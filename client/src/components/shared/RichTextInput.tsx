import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  ImageIcon,
  Minus,
  Loader2,
  Code2,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadTaskImage } from '@/services/upload.service';

interface Props {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

type Mode = 'visual' | 'markdown';

export function RichTextInput({ value, onChange, placeholder, className }: Props) {
  const [mode, setMode] = useState<Mode>('visual');
  const [mdDraft, setMdDraft] = useState(value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // track externally-set value to avoid update loops
  const lastExternalValue = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Add a description — supports Markdown…',
      }),
      Markdown.configure({ transformPastedText: true }),
    ],
    content: value,
    onUpdate({ editor: e }) {
      const md = getMarkdownFromEditor(e);
      lastExternalValue.current = md;
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[90px] text-sm text-text-secondary leading-relaxed',
      },
    },
  });

  // When parent sets a new value externally (e.g. AI parse), sync into editor
  useEffect(() => {
    if (!editor || value === lastExternalValue.current) return;
    lastExternalValue.current = value;
    editor.commands.setContent(value);
    setMdDraft(value);
  }, [value, editor]);

  function getMarkdownFromEditor(e = editor) {
    const storage = e?.storage as unknown as { markdown: { getMarkdown: () => string } };
    return storage?.markdown.getMarkdown() ?? '';
  }

  function switchToMarkdown() {
    if (!editor) return;
    const md = getMarkdownFromEditor();
    setMdDraft(md);
    setMode('markdown');
  }

  function switchToVisual() {
    if (!editor) return;
    editor.commands.setContent(mdDraft);
    lastExternalValue.current = mdDraft;
    onChange(mdDraft);
    setMode('visual');
  }

  function handleMdChange(val: string) {
    setMdDraft(val);
    lastExternalValue.current = val;
    onChange(val);
  }

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const url = await uploadTaskImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // silent
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleImageFile(file);
    e.target.value = '';
  }

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith('image/'),
      );
      if (!item) return;
      e.preventDefault();
      const file = item.getAsFile();
      if (file) void handleImageFile(file);
    }
    dom.addEventListener('paste', onPaste);
    return () => dom.removeEventListener('paste', onPaste);
  }, [editor, handleImageFile]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'flex flex-col rounded-input border border-input bg-card transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden',
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-2 py-1.5">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        >
          <Code2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          active={false}
          onClick={() => fileInputRef.current?.click()}
          title="Insert image"
          disabled={uploading || mode === 'markdown'}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Mode toggle */}
        <div className="ml-auto flex items-center rounded-nav border border-border bg-card text-xs font-medium overflow-hidden">
          <button
            type="button"
            onClick={() => mode === 'markdown' && switchToVisual()}
            className={cn(
              'px-2.5 py-1 transition-colors',
              mode === 'visual'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => mode === 'visual' && switchToMarkdown()}
            className={cn(
              'px-2.5 py-1 transition-colors',
              mode === 'markdown'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            Markdown
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="px-3.5 py-3">
        {mode === 'visual' ? (
          <EditorContent editor={editor} />
        ) : (
          <textarea
            value={mdDraft}
            onChange={(e) => handleMdChange(e.target.value)}
            className="w-full min-h-[90px] resize-y font-mono text-xs text-text-secondary leading-relaxed outline-none bg-transparent"
            placeholder="Write Markdown here…"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-text-muted hover:bg-surface hover:text-text-primary',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-4 w-px bg-border" />;
}

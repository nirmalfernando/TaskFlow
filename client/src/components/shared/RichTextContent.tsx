import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-text-primary mt-4 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-text-primary mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-text-primary mt-2 mb-1 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-text-secondary leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-2 space-y-0.5 text-sm text-text-secondary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-2 space-y-0.5 text-sm text-text-secondary">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary pl-3 my-2 text-text-muted italic text-sm">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <pre className="bg-surface rounded-card p-3 my-2 overflow-x-auto border border-border">
          <code className="font-mono text-xs text-text-secondary">{children}</code>
        </pre>
      );
    }
    return (
      <code className="font-mono bg-surface px-1.5 py-0.5 rounded text-xs text-text-secondary border border-border">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ''}
      className="max-w-full rounded-card my-3 border border-border shadow-sm"
    />
  ),
  hr: () => <hr className="my-4 border-border" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
};

interface Props {
  content: string;
}

export function RichTextContent({ content }: Props) {
  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

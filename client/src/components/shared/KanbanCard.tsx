import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge, type Priority } from './PriorityBadge';
import { StatusBadge, type TaskStatus } from './StatusBadge';
import { UserAvatar } from './UserAvatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KanbanCardData {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  assignee: { name: string; avatarSrc?: string } | null;
  dueDate: string;
  isOverdue?: boolean;
}

export interface KanbanCardProps extends KanbanCardData {
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: () => void;
  className?: string;
}

// ─── Drag handle indicator ────────────────────────────────────────────────────

function DragHandle() {
  return (
    <div className="flex items-center gap-1.5 mb-2.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="h-1 w-1 rounded-full bg-[#8ec5ff]" />
        ))}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#51a2ff]">
        Dragging
      </span>
    </div>
  );
}

// ─── KanbanCard ───────────────────────────────────────────────────────────────

export function KanbanCard({
  title,
  description,
  priority,
  status,
  assignee,
  dueDate,
  isOverdue = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick,
  className,
}: KanbanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    const card = cardRef.current;
    if (card) {
      // Build a clone that already has the DragHandle visible so the ghost shows it
      const clone = card.cloneNode(true) as HTMLElement;
      const handle = document.createElement('div');
      handle.className = 'flex items-center gap-1.5 mb-2.5';
      handle.innerHTML = `<div class="flex gap-0.5">${Array.from({ length: 6 })
        .map(() => '<span class="h-1 w-1 rounded-full bg-[#8ec5ff]"></span>')
        .join(
          '',
        )}</div><span class="text-[10px] font-semibold uppercase tracking-wide text-[#51a2ff]">Dragging</span>`;
      clone.insertBefore(handle, clone.firstChild);
      Object.assign(clone.style, {
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: `${card.offsetWidth}px`,
        pointerEvents: 'none',
        border: '1px solid #bedbff',
        boxShadow: '0px 0px 0px 2px rgba(190,219,255,0.5), 0px 20px 48px 0px rgba(0,0,0,0.2)',
        borderRadius: '12px',
        background: 'white',
        padding: '17px',
      });
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, card.offsetWidth / 2, 28);
      requestAnimationFrame(() => document.body.removeChild(clone));
    }
    onDragStart?.(e);
  };

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'flex flex-col rounded-card bg-card p-[17px] transition-all cursor-grab active:cursor-grabbing select-none',
        isDragging
          ? [
              'border border-[#bedbff] opacity-90',
              'shadow-[0px_0px_0px_2px_rgba(190,219,255,0.5),0px_20px_48px_0px_rgba(0,0,0,0.2)]',
            ]
          : [
              'border border-border',
              'shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)]',
              'hover:shadow-[0px_4px_12px_rgba(0,0,0,0.1)]',
            ],
        className,
      )}
    >
      {isDragging && <DragHandle />}

      {/* Title */}
      <p className="text-sm font-medium leading-snug text-text-dark line-clamp-2">{title}</p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-xs leading-relaxed text-text-placeholder line-clamp-2">
          {description}
        </p>
      )}

      {/* Badges */}
      <div className="mt-3 flex items-center gap-1.5">
        <PriorityBadge priority={priority} />
        <StatusBadge status={status} />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-surface pt-3">
        <div
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium',
            isOverdue ? 'text-red-500' : 'text-text-placeholder',
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
          {dueDate}
        </div>
        {assignee ? (
          <UserAvatar name={assignee.name} src={assignee.avatarSrc} size="sm" />
        ) : (
          <span className="h-[26px] w-[26px] rounded-full border border-dashed border-border" />
        )}
      </div>
    </div>
  );
}

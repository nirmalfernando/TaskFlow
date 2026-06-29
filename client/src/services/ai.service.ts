import { api } from './api';
import type { Priority } from '@/components/shared/PriorityBadge';
import type { TaskStatus } from '@/components/shared/StatusBadge';

export interface ParsedTaskFields {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
}

export async function transcribeAudio(blob: Blob, mimeType: string): Promise<string> {
  const form = new FormData();
  form.append('audio', blob, `recording.${mimeType.split('/')[1]?.split(';')[0] ?? 'webm'}`);

  const { data } = await api.post<{ success: boolean; data: { transcript: string } }>(
    '/ai/transcribe',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return data.data.transcript;
}

export async function parseTaskFromText(text: string): Promise<ParsedTaskFields> {
  const { data } = await api.post<{ success: boolean; data: ParsedTaskFields }>('/ai/parse-task', {
    text,
  });
  return data.data;
}

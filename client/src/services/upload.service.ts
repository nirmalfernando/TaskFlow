import { api } from './api';

export async function uploadTaskImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<{ success: boolean; data: { url: string } }>(
    '/tasks/upload-image',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data.url;
}

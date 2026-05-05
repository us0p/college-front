import client from './client';
import type { DocumentResponse } from '../types';

export const getDocuments = () =>
  client.get<DocumentResponse[]>('/documents').then((r) => r.data);

export const getDocument = (id: number) =>
  client.get<DocumentResponse>(`/documents/${id}`).then((r) => r.data);

export const uploadDocument = (
  userId: number,
  file: File,
  description?: string
) => {
  const form = new FormData();
  form.append('file', file);
  const params = new URLSearchParams({ userId: String(userId) });
  if (description) params.append('description', description);
  return client
    .post<DocumentResponse>(`/documents?${params}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const deleteDocument = (id: number) =>
  client.delete(`/documents/${id}`);

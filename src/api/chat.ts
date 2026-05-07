import client from './client';
import type { ChatRequest, ChatResponse } from '../types';

export function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  return client.post<ChatResponse>('/chat', req).then((r) => r.data);
}

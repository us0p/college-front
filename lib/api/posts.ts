import { apiClient } from './client'
import type { PostResponse, PostRequest, PostUpdateRequest } from './types'

export function getPosts(): Promise<PostResponse[]> {
  return apiClient.get<PostResponse[]>('/api/posts', undefined)
}

export function getPost(id: number): Promise<PostResponse> {
  return apiClient.get<PostResponse>(`/api/posts/${id}`, undefined)
}

export function createPost(data: PostRequest, token: string): Promise<PostResponse> {
  return apiClient.post<PostResponse>('/api/posts', data, token)
}

export function updatePost(
  id: number,
  data: PostUpdateRequest,
  token: string,
): Promise<PostResponse> {
  return apiClient.put<PostResponse>(`/api/posts/${id}`, data, token)
}

export function deletePost(id: number, token: string): Promise<void> {
  return apiClient.delete(`/api/posts/${id}`, token)
}

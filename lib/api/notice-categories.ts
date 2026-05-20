import { apiClient } from './client'
import type { NoticeCategoryRequest, NoticeCategoryResponse } from './types'

export function getNoticeCategories(token: string): Promise<NoticeCategoryResponse[]> {
  return apiClient.get<NoticeCategoryResponse[]>('/api/notice-categories', token)
}

export function createNoticeCategory(
  data: NoticeCategoryRequest,
  token: string,
): Promise<NoticeCategoryResponse> {
  return apiClient.post<NoticeCategoryResponse>('/api/notice-categories', data, token)
}

export function updateNoticeCategory(
  id: number,
  data: NoticeCategoryRequest,
  token: string,
): Promise<NoticeCategoryResponse> {
  return apiClient.put<NoticeCategoryResponse>(`/api/notice-categories/${id}`, data, token)
}

export function deleteNoticeCategory(id: number, token: string): Promise<void> {
  return apiClient.delete(`/api/notice-categories/${id}`, token)
}

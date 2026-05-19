import { apiClient } from './client'
import type { PostCategoryResponse } from './types'

export function getPostCategories(token: string): Promise<PostCategoryResponse[]> {
  return apiClient.get<PostCategoryResponse[]>('/api/post-categories', token)
}

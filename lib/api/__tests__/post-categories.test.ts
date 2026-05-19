import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPostCategories } from '../post-categories'
import { apiClient, ApiError } from '../client'
import type { PostCategoryResponse } from '../types'

vi.mock('../client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../client')>()
  return {
    ...mod,
    apiClient: { get: vi.fn() },
  }
})

const mockCategories: PostCategoryResponse[] = [
  { id: 1, name: 'Eventos' },
  { id: 2, name: 'Estágios' },
  { id: 3, name: 'Anúncios' },
]

describe('getPostCategories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /api/post-categories with the provided token', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockCategories)

    await getPostCategories('my-token')

    expect(apiClient.get).toHaveBeenCalledWith('/api/post-categories', 'my-token')
  })

  it('returns the list of categories', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockCategories)

    const result = await getPostCategories('my-token')

    expect(result).toEqual(mockCategories)
  })

  it('propagates ApiError on 401', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(401, 'Unauthorized'))

    await expect(getPostCategories('bad-token')).rejects.toThrow(ApiError)
  })
})

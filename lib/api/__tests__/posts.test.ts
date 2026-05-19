import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPosts, getPost, createPost, updatePost, deletePost } from '../posts'
import { apiClient, ApiError } from '../client'
import type { PostResponse } from '../types'

vi.mock('../client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../client')>()
  return {
    ...mod,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      postFormData: vi.fn(),
    },
  }
})

const mockPost: PostResponse = {
  id: 1,
  userId: 1,
  username: 'admin',
  title: 'Test Post',
  markdownContent: '# Hello',
  categoryId: 1,
  categoryName: 'Eventos',
  coverImgUrl: 'https://example.com/img.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('posts API', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getPosts', () => {
    it('calls GET /api/posts without a token', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockPost])

      await getPosts()

      expect(apiClient.get).toHaveBeenCalledWith('/api/posts', undefined)
    })

    it('returns the list of posts', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockPost])

      const result = await getPosts()

      expect(result).toEqual([mockPost])
    })
  })

  describe('getPost', () => {
    it('calls GET /api/posts/{id} without a token', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPost)

      await getPost(1)

      expect(apiClient.get).toHaveBeenCalledWith('/api/posts/1', undefined)
    })

    it('returns the matching post', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPost)

      const result = await getPost(1)

      expect(result).toEqual(mockPost)
    })

    it('propagates ApiError when post is not found', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError(404, 'Not Found'))

      await expect(getPost(999)).rejects.toThrow(ApiError)
    })
  })

  describe('createPost', () => {
    it('calls POST /api/posts with body and token', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockPost)
      const data = { userId: 1, title: 'New Post', markdownContent: '# New', categoryId: 1 }

      await createPost(data, 'my-token')

      expect(apiClient.post).toHaveBeenCalledWith('/api/posts', data, 'my-token')
    })

    it('returns the created post', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockPost)

      const result = await createPost(
        { userId: 1, title: 'New Post', markdownContent: '# New', categoryId: 1 },
        'token',
      )

      expect(result).toEqual(mockPost)
    })

    it('propagates ApiError on 401', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError(401, 'Unauthorized'))

      await expect(
        createPost({ userId: 1, title: 'x', markdownContent: 'x', categoryId: 1 }, 'bad'),
      ).rejects.toThrow(ApiError)
    })
  })

  describe('updatePost', () => {
    it('calls PUT /api/posts/{id} with body and token', async () => {
      vi.mocked(apiClient.put).mockResolvedValue(mockPost)
      const data = { title: 'Updated', markdownContent: '# Updated', categoryId: 2 }

      await updatePost(1, data, 'my-token')

      expect(apiClient.put).toHaveBeenCalledWith('/api/posts/1', data, 'my-token')
    })

    it('returns the updated post', async () => {
      const updated = { ...mockPost, title: 'Updated' }
      vi.mocked(apiClient.put).mockResolvedValue(updated)

      const result = await updatePost(1, { title: 'Updated', markdownContent: '# U', categoryId: 2 }, 'token')

      expect(result).toEqual(updated)
    })
  })

  describe('deletePost', () => {
    it('calls DELETE /api/posts/{id} with token', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      await deletePost(1, 'my-token')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/posts/1', 'my-token')
    })

    it('returns void on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)

      const result = await deletePost(1, 'token')

      expect(result).toBeUndefined()
    })

    it('propagates ApiError on 403', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(403, 'Forbidden'))

      await expect(deletePost(1, 'bad')).rejects.toThrow(ApiError)
    })
  })
})

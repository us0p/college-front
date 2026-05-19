import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '../use-auth'
import * as authApi from '@/lib/api/auth'
import * as uiItemsApi from '@/lib/api/ui-items'
import { apiClient } from '@/lib/api/client'
import type { UserResponse, RolePermissionResponse, UiPermissionObjectResponse } from '@/lib/api/types'

vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
}))

vi.mock('@/lib/api/ui-items', () => ({
  getUiPermissionObjects: vi.fn(),
}))

vi.mock('@/lib/api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api/client')>()
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

const mockUser: UserResponse = {
  id: 1,
  username: 'admin',
  email: 'admin@test.com',
  roleId: 1,
  roleName: 'Administradores',
}

const mockPermissions: RolePermissionResponse[] = [
  { id: 1, roleId: 1, roleName: 'Administradores', permissionId: 1, permissionName: 'manage_users' },
  { id: 2, roleId: 1, roleName: 'Administradores', permissionId: 2, permissionName: 'manage_posts' },
]

const mockUiPermissions: UiPermissionObjectResponse[] = [
  { id: 1, uiItemName: 'admin_dashboard', permissionId: 1, permissionName: 'manage_users' },
  { id: 2, uiItemName: 'admin_users', permissionId: 1, permissionName: 'manage_users' },
  { id: 3, uiItemName: 'admin_blog_post', permissionId: 2, permissionName: 'manage_posts' },
  { id: 4, uiItemName: 'admin_documents', permissionId: 3, permissionName: 'upload_docs' },
  { id: 5, uiItemName: 'admin_access_groups', permissionId: 1, permissionName: 'manage_users' },
]

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children)
}

function setupLoginMocks() {
  vi.mocked(authApi.login).mockResolvedValue({ token: 'jwt-token' })
  vi.mocked(apiClient.get).mockImplementation((path: string) => {
    if (path === '/api/users') return Promise.resolve([mockUser])
    if (path.startsWith('/api/role-permissions/by-role/')) return Promise.resolve(mockPermissions)
    return Promise.reject(new Error(`Unexpected path: ${path}`))
  })
  vi.mocked(uiItemsApi.getUiPermissionObjects).mockResolvedValue(mockUiPermissions)
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('throws when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider')
    spy.mockRestore()
  })

  it('starts with null user and null token when no stored session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  describe('login', () => {
    beforeEach(setupLoginMocks)

    it('calls auth API with provided username and password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('admin', 'password123')
      })

      expect(authApi.login).toHaveBeenCalledWith({ username: 'admin', password: 'password123' })
    })

    it('sets user and token in context after successful login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('admin', 'secret')
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe('jwt-token')
    })

    it('fetches users list, role permissions, and UI permissions after receiving token', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('admin', 'secret')
      })

      expect(apiClient.get).toHaveBeenCalledWith('/api/users', 'jwt-token')
      expect(apiClient.get).toHaveBeenCalledWith('/api/role-permissions/by-role/1', 'jwt-token')
      expect(uiItemsApi.getUiPermissionObjects).toHaveBeenCalledWith('jwt-token')
    })

    it('persists token, user, and UI permissions in localStorage', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('admin', 'secret')
      })

      expect(localStorage.getItem('auth_token')).toBe('jwt-token')
      expect(JSON.parse(localStorage.getItem('auth_user')!)).toEqual(mockUser)
      expect(JSON.parse(localStorage.getItem('auth_ui_permissions')!)).toEqual(mockUiPermissions)
    })

    it('sets isAdmin true when user has a manage_* permission', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('admin', 'secret')
      })

      expect(result.current.isAdmin).toBe(true)
    })

    it('sets isAdmin false when user has no manage_* permissions', async () => {
      const studentPermissions: RolePermissionResponse[] = [
        { id: 3, roleId: 2, roleName: 'Alunos', permissionId: 3, permissionName: 'view_public_docs' },
      ]
      const studentUser: UserResponse = { ...mockUser, id: 2, username: 'student', roleId: 2 }

      vi.mocked(apiClient.get).mockImplementation((path: string) => {
        if (path === '/api/users') return Promise.resolve([studentUser])
        if (path.startsWith('/api/role-permissions/by-role/')) return Promise.resolve(studentPermissions)
        return Promise.reject(new Error(`Unexpected path: ${path}`))
      })

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('student', 'pass')
      })

      expect(result.current.isAdmin).toBe(false)
    })

    it('throws and leaves user null when login API fails', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await expect(
        act(async () => {
          await result.current.login('wrong', 'wrong')
        }),
      ).rejects.toThrow()

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears user, token, UI permissions, and localStorage', async () => {
      setupLoginMocks()

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => {
        await result.current.login('admin', 'secret')
      })
      expect(result.current.user).not.toBeNull()

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_ui_permissions')).toBeNull()
    })
  })

  describe('hasPermission', () => {
    beforeEach(setupLoginMocks)

    it('returns true when user holds the named permission', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => {
        await result.current.login('admin', 'secret')
      })

      expect(result.current.hasPermission('manage_users')).toBe(true)
    })

    it('returns false when user lacks the named permission', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => {
        await result.current.login('admin', 'secret')
      })

      expect(result.current.hasPermission('upload_docs')).toBe(false)
    })

    it('returns false when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.hasPermission('manage_users')).toBe(false)
    })
  })

  describe('canAccessUiItem', () => {
    beforeEach(setupLoginMocks)

    async function loginAndGetResult() {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => {
        await result.current.login('admin', 'secret')
      })
      return result
    }

    it('returns true when user has all permissions required by the UI item', async () => {
      const result = await loginAndGetResult()

      // admin has manage_users (id:1) — admin_dashboard requires it
      expect(result.current.canAccessUiItem('admin_dashboard')).toBe(true)
    })

    it('returns false when user lacks a required permission for the UI item', async () => {
      const result = await loginAndGetResult()

      // admin lacks upload_docs (id:3) — admin_documents requires it
      expect(result.current.canAccessUiItem('admin_documents')).toBe(false)
    })

    it('returns true for a UI item with no permissions configured', async () => {
      const result = await loginAndGetResult()

      // 'unknown_item' has no permission requirements → open to all authenticated users
      expect(result.current.canAccessUiItem('unknown_item')).toBe(true)
    })

    it('returns false when user is not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.canAccessUiItem('admin_dashboard')).toBe(false)
    })

    it('checks each named UI item correctly against user permissions', async () => {
      const result = await loginAndGetResult()

      // admin has: manage_users(1), manage_posts(2) — does NOT have upload_docs(3)
      expect(result.current.canAccessUiItem('admin_users')).toBe(true)         // needs manage_users
      expect(result.current.canAccessUiItem('admin_blog_post')).toBe(true)     // needs manage_posts
      expect(result.current.canAccessUiItem('admin_access_groups')).toBe(true) // needs manage_users
      expect(result.current.canAccessUiItem('admin_documents')).toBe(false)    // needs upload_docs
    })
  })

  describe('session persistence', () => {
    it('restores user, token, and UI permissions from localStorage on mount', async () => {
      localStorage.setItem('auth_token', 'stored-token')
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      localStorage.setItem('auth_permissions', JSON.stringify(mockPermissions))
      localStorage.setItem('auth_ui_permissions', JSON.stringify(mockUiPermissions))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe('stored-token')
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.canAccessUiItem('admin_dashboard')).toBe(true)
    })

    it('starts unauthenticated when localStorage is empty', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toBeNull()
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.canAccessUiItem('admin_dashboard')).toBe(false)
    })
  })
})

'use client'

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { login as apiLogin } from '@/lib/api/auth'
import { apiClient } from '@/lib/api/client'
import { getUiPermissionObjects } from '@/lib/api/ui-items'
import type { UserResponse, RolePermissionResponse, UiPermissionObjectResponse } from '@/lib/api/types'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const PERMISSIONS_KEY = 'auth_permissions'
const UI_PERMISSIONS_KEY = 'auth_ui_permissions'

interface AuthContextType {
  user: UserResponse | null
  token: string | null
  isLoading: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permissionName: string) => boolean
  canAccessUiItem: (uiItemName: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function readLocal<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<RolePermissionResponse[]>([])
  const [uiPermissions, setUiPermissions] = useState<UiPermissionObjectResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    const storedUser = readLocal<UserResponse>(USER_KEY)
    const storedPermissions = readLocal<RolePermissionResponse[]>(PERMISSIONS_KEY)
    const storedUiPermissions = readLocal<UiPermissionObjectResponse[]>(UI_PERMISSIONS_KEY)

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      setPermissions(storedPermissions ?? [])
      setUiPermissions(storedUiPermissions ?? [])
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const { token: jwt } = await apiLogin({ username, password })

    const [users, uiPerms] = await Promise.all([
      apiClient.get<UserResponse[]>('/api/users', jwt),
      getUiPermissionObjects(jwt),
    ])

    const currentUser = users.find((u) => u.username === username)
    if (!currentUser) throw new Error('Usuário não encontrado após autenticação.')

    const rolePerms = await apiClient.get<RolePermissionResponse[]>(
      `/api/role-permissions/by-role/${currentUser.roleId}`,
      jwt,
    )

    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(rolePerms))
    localStorage.setItem(UI_PERMISSIONS_KEY, JSON.stringify(uiPerms))

    setToken(jwt)
    setUser(currentUser)
    setPermissions(rolePerms)
    setUiPermissions(uiPerms)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(PERMISSIONS_KEY)
    localStorage.removeItem(UI_PERMISSIONS_KEY)
    setToken(null)
    setUser(null)
    setPermissions([])
    setUiPermissions([])
  }, [])

  const hasPermission = useCallback(
    (permissionName: string): boolean =>
      permissions.some((p) => p.permissionName === permissionName),
    [permissions],
  )

  const canAccessUiItem = useCallback(
    (uiItemName: string): boolean => {
      if (!user) return false
      const required = uiPermissions.filter((p) => p.uiItemName === uiItemName)
      if (required.length === 0) return true
      const userPermissionIds = new Set(permissions.map((p) => p.permissionId))
      return required.every((r) => userPermissionIds.has(r.permissionId))
    },
    [user, uiPermissions, permissions],
  )

  const isAdmin = permissions.some((p) => p.permissionName.startsWith('manage'))

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAdmin, login, logout, hasPermission, canAccessUiItem }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

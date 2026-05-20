import { apiClient } from './client'
import type { PermissionObjectResponse, RolePageResponse, RolePermissionRequest, RolePermissionResponse, RoleRequest, RoleResponse } from './types'

export interface GetRolesParams {
  searchParam?: string
  page?: number
  size?: number
}

export async function getRoles(params: GetRolesParams = {}, token: string): Promise<RolePageResponse> {
  const query = new URLSearchParams()
  if (params.searchParam) query.set('search_param', params.searchParam)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  const qs = query.toString()
  const raw = await apiClient.get<RolePageResponse | RoleResponse[]>(`/api/roles${qs ? `?${qs}` : ''}`, token)

  // Normalise: old backend returns a plain array; new backend returns a paginated object
  if (Array.isArray(raw)) {
    return { content: raw, page: 0, size: raw.length, totalElements: raw.length, totalPages: 1 }
  }
  return raw
}

export function createRole(data: RoleRequest, token: string): Promise<RoleResponse> {
  return apiClient.post<RoleResponse>('/api/roles', data, token)
}

export function updateRole(id: number, data: RoleRequest, token: string): Promise<RoleResponse> {
  return apiClient.put<RoleResponse>(`/api/roles/${id}`, data, token)
}

export function deleteRole(id: number, token: string): Promise<void> {
  return apiClient.delete(`/api/roles/${id}`, token)
}

export function getPermissionObjects(token: string): Promise<PermissionObjectResponse[]> {
  return apiClient.get<PermissionObjectResponse[]>('/api/permission-objects', token)
}

export function getRolePermissions(roleId: number, token: string): Promise<RolePermissionResponse[]> {
  return apiClient.get<RolePermissionResponse[]>(`/api/role-permissions/by-role/${roleId}`, token)
}

export function assignPermission(data: RolePermissionRequest, token: string): Promise<RolePermissionResponse> {
  return apiClient.post<RolePermissionResponse>('/api/role-permissions', data, token)
}

export function revokePermission(rolePermissionId: number, token: string): Promise<void> {
  return apiClient.delete(`/api/role-permissions/${rolePermissionId}`, token)
}

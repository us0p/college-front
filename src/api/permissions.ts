import client from './client';
import type {
  PermissionObjectResponse,
  RolePermissionRequest,
  RolePermissionResponse,
} from '../types';

export const getPermissionObjects = () =>
  client.get<PermissionObjectResponse[]>('/permission-objects').then((r) => r.data);

export const getRolePermissions = () =>
  client.get<RolePermissionResponse[]>('/role-permissions').then((r) => r.data);

export const getRolePermissionsByRole = (roleId: number) =>
  client
    .get<RolePermissionResponse[]>(`/role-permissions/by-role/${roleId}`)
    .then((r) => r.data);

export const assignPermission = (data: RolePermissionRequest) =>
  client.post<RolePermissionResponse>('/role-permissions', data).then((r) => r.data);

export const revokePermission = (id: number) =>
  client.delete(`/role-permissions/${id}`);

import client from './client';
import type { RoleRequest, RoleResponse } from '../types';

export const getRoles = () =>
  client.get<RoleResponse[]>('/roles').then((r) => r.data);

export const getRole = (id: number) =>
  client.get<RoleResponse>(`/roles/${id}`).then((r) => r.data);

export const createRole = (data: RoleRequest) =>
  client.post<RoleResponse>('/roles', data).then((r) => r.data);

export const updateRole = (id: number, data: RoleRequest) =>
  client.put<RoleResponse>(`/roles/${id}`, data).then((r) => r.data);

export const deleteRole = (id: number) =>
  client.delete(`/roles/${id}`);

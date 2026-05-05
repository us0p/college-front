import client from './client';
import type { UserRequest, UserResponse } from '../types';

export const getUsers = () =>
  client.get<UserResponse[]>('/users').then((r) => r.data);

export const getUser = (id: number) =>
  client.get<UserResponse>(`/users/${id}`).then((r) => r.data);

export const createUser = (data: UserRequest) =>
  client.post<UserResponse>('/users', data).then((r) => r.data);

export const updateUser = (id: number, data: UserRequest) =>
  client.put<UserResponse>(`/users/${id}`, data).then((r) => r.data);

export const deleteUser = (id: number) =>
  client.delete(`/users/${id}`);

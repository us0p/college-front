import client from './client';
import type { PostRequest, PostResponse, PostUpdateRequest } from '../types';

export const getPosts = () =>
  client.get<PostResponse[]>('/posts').then((r) => r.data);

export const getPost = (id: number) =>
  client.get<PostResponse>(`/posts/${id}`).then((r) => r.data);

export const createPost = (data: PostRequest) =>
  client.post<PostResponse>('/posts', data).then((r) => r.data);

export const updatePost = (id: number, data: PostUpdateRequest) =>
  client.put<PostResponse>(`/posts/${id}`, data).then((r) => r.data);

export const deletePost = (id: number) =>
  client.delete(`/posts/${id}`);

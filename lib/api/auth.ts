import { apiClient } from './client'
import type { LoginRequest, LoginResponse } from './types'

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', credentials)
}

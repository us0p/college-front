export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserRequest {
  username: string;
  roleId: number;
  ra?: string;
  password: string;
  email: string;
  phoneNumber?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  roleId: number;
  roleName: string;
  ra?: string;
}

export interface RoleRequest {
  name: string;
}

export interface RoleResponse {
  id: number;
  name: string;
}

export interface RolePermissionRequest {
  roleId: number;
  permissionId: number;
}

export interface RolePermissionResponse {
  id: number;
  roleId: number;
  roleName: string;
  permissionId: number;
  permissionName: string;
}

export interface PermissionObjectResponse {
  id: number;
  name: string;
}

export interface PostRequest {
  userId: number;
  title: string;
  markdownContent: string;
}

export interface PostUpdateRequest {
  title: string;
  markdownContent: string;
}

export interface PostResponse {
  id: number;
  userId: number;
  username: string;
  title: string;
  markdownContent: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DocumentResponse {
  id: number;
  userId: number;
  username: string;
  fileName: string;
  description?: string;
  fileSize: number;
  bucketUrl: string;
  knowledgeBase: boolean;
}

export interface SourceChunk {
  documentId: number;
  fileName: string;
  chunkIndex: number;
}

export interface ChatRequest {
  question: string;
  contextChunks?: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceChunk[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceChunk[];
}

// Usuário
export interface User {
  id: string
  username: string
  email: string
  password: string
  phone?: string
  groupId: string
  isAdmin: boolean
  createdAt: string
}

// Grupo de Acesso
export interface AccessGroup {
  id: string
  name: string
  permissions: Permission[]
  level: number // 1-10, maior = mais acesso
}

// Permissões disponíveis
export type Permission =
  | 'view_public_docs'
  | 'view_private_docs'
  | 'upload_docs'
  | 'manage_users'
  | 'manage_groups'
  | 'manage_posts'

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_public_docs: 'Ver documentos públicos',
  view_private_docs: 'Ver documentos privados',
  upload_docs: 'Upload de documentos',
  manage_users: 'Gerenciar usuários',
  manage_groups: 'Gerenciar grupos',
  manage_posts: 'Gerenciar posts',
}

// Post do Blog
export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string // Markdown
  author: string
  category: PostCategory
  coverImage: string
  createdAt: string
  updatedAt: string
}

export type PostCategory = 'eventos' | 'estagios' | 'anuncios' | 'noticias'

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  eventos: 'Eventos',
  estagios: 'Estágios',
  anuncios: 'Anúncios',
  noticias: 'Notícias',
}

// Documento
export interface Document {
  id: string
  name: string
  fileName: string
  fileType: string
  fileSize: number
  isPublic: boolean
  isKnowledgeBase: boolean
  minAccessLevel: number
  uploadedBy: string
  createdAt: string
}

// Newsletter Subscriber
export interface Subscriber {
  id: string
  email: string
  subscribedAt: string
}

// Chat Message
export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

// Auth Session
export interface AuthSession {
  user: User
  expiresAt: string
}

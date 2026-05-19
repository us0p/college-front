import type { User, AccessGroup, Post, Document, Subscriber, AuthSession } from './types'
import {
  defaultUsers,
  defaultGroups,
  defaultPosts,
  defaultDocuments,
  defaultSubscribers,
} from './mock-data'

// Storage Keys
const KEYS = {
  users: 'mural_users',
  groups: 'mural_groups',
  posts: 'mural_posts',
  documents: 'mural_documents',
  subscribers: 'mural_subscribers',
  session: 'mural_session',
  chatHistory: 'mural_chat_history',
}

// Helper para verificar se está no cliente
const isClient = typeof window !== 'undefined'

// Inicializa dados padrão se não existirem
export function initializeStorage() {
  if (!isClient) return

  if (!localStorage.getItem(KEYS.users)) {
    localStorage.setItem(KEYS.users, JSON.stringify(defaultUsers))
  }
  if (!localStorage.getItem(KEYS.groups)) {
    localStorage.setItem(KEYS.groups, JSON.stringify(defaultGroups))
  }
  if (!localStorage.getItem(KEYS.posts)) {
    localStorage.setItem(KEYS.posts, JSON.stringify(defaultPosts))
  }
  if (!localStorage.getItem(KEYS.documents)) {
    localStorage.setItem(KEYS.documents, JSON.stringify(defaultDocuments))
  }
  if (!localStorage.getItem(KEYS.subscribers)) {
    localStorage.setItem(KEYS.subscribers, JSON.stringify(defaultSubscribers))
  }
}

// === USERS ===
export function getUsers(): User[] {
  if (!isClient) return defaultUsers
  const data = localStorage.getItem(KEYS.users)
  return data ? JSON.parse(data) : defaultUsers
}

export function getUser(id: string): User | undefined {
  return getUsers().find((u) => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email)
}

export function saveUser(user: User): void {
  if (!isClient) return
  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(KEYS.users, JSON.stringify(users))
}

export function deleteUser(id: string): void {
  if (!isClient) return
  const users = getUsers().filter((u) => u.id !== id)
  localStorage.setItem(KEYS.users, JSON.stringify(users))
}

// === GROUPS ===
export function getGroups(): AccessGroup[] {
  if (!isClient) return defaultGroups
  const data = localStorage.getItem(KEYS.groups)
  return data ? JSON.parse(data) : defaultGroups
}

export function getGroup(id: string): AccessGroup | undefined {
  return getGroups().find((g) => g.id === id)
}

export function saveGroup(group: AccessGroup): void {
  if (!isClient) return
  const groups = getGroups()
  const index = groups.findIndex((g) => g.id === group.id)
  if (index >= 0) {
    groups[index] = group
  } else {
    groups.push(group)
  }
  localStorage.setItem(KEYS.groups, JSON.stringify(groups))
}

export function deleteGroup(id: string): void {
  if (!isClient) return
  const groups = getGroups().filter((g) => g.id !== id)
  localStorage.setItem(KEYS.groups, JSON.stringify(groups))
}

// === POSTS ===
export function getPosts(): Post[] {
  if (!isClient) return defaultPosts
  const data = localStorage.getItem(KEYS.posts)
  return data ? JSON.parse(data) : defaultPosts
}

export function getPost(id: string): Post | undefined {
  return getPosts().find((p) => p.id === id)
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug)
}

export function savePost(post: Post): void {
  if (!isClient) return
  const posts = getPosts()
  const index = posts.findIndex((p) => p.id === post.id)
  if (index >= 0) {
    posts[index] = post
  } else {
    posts.push(post)
  }
  localStorage.setItem(KEYS.posts, JSON.stringify(posts))
}

export function deletePost(id: string): void {
  if (!isClient) return
  const posts = getPosts().filter((p) => p.id !== id)
  localStorage.setItem(KEYS.posts, JSON.stringify(posts))
}

// === DOCUMENTS ===
export function getDocuments(): Document[] {
  if (!isClient) return defaultDocuments
  const data = localStorage.getItem(KEYS.documents)
  return data ? JSON.parse(data) : defaultDocuments
}

export function getDocument(id: string): Document | undefined {
  return getDocuments().find((d) => d.id === id)
}

export function getDocumentsByAccessLevel(level: number): Document[] {
  return getDocuments().filter((d) => d.isPublic || d.minAccessLevel <= level)
}

export function saveDocument(doc: Document): void {
  if (!isClient) return
  const documents = getDocuments()
  const index = documents.findIndex((d) => d.id === doc.id)
  if (index >= 0) {
    documents[index] = doc
  } else {
    documents.push(doc)
  }
  localStorage.setItem(KEYS.documents, JSON.stringify(documents))
}

export function deleteDocument(id: string): void {
  if (!isClient) return
  const documents = getDocuments().filter((d) => d.id !== id)
  localStorage.setItem(KEYS.documents, JSON.stringify(documents))
}

// === SUBSCRIBERS ===
export function getSubscribers(): Subscriber[] {
  if (!isClient) return defaultSubscribers
  const data = localStorage.getItem(KEYS.subscribers)
  return data ? JSON.parse(data) : defaultSubscribers
}

export function addSubscriber(email: string): Subscriber {
  const subscriber: Subscriber = {
    id: `sub-${Date.now()}`,
    email,
    subscribedAt: new Date().toISOString(),
  }
  if (isClient) {
    const subscribers = getSubscribers()
    subscribers.push(subscriber)
    localStorage.setItem(KEYS.subscribers, JSON.stringify(subscribers))
  }
  return subscriber
}

// === AUTH SESSION ===
export function getSession(): AuthSession | null {
  if (!isClient) return null
  const data = localStorage.getItem(KEYS.session)
  if (!data) return null
  const session: AuthSession = JSON.parse(data)
  // Verifica se expirou
  if (new Date(session.expiresAt) < new Date()) {
    clearSession()
    return null
  }
  return session
}

export function setSession(user: User): void {
  if (!isClient) return
  const session: AuthSession = {
    user,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
  }
  localStorage.setItem(KEYS.session, JSON.stringify(session))
}

export function clearSession(): void {
  if (!isClient) return
  localStorage.removeItem(KEYS.session)
}

// === CHAT HISTORY ===
export function getChatHistory(): { content: string; role: 'user' | 'assistant' }[] {
  if (!isClient) return []
  const data = localStorage.getItem(KEYS.chatHistory)
  return data ? JSON.parse(data) : []
}

export function saveChatMessage(content: string, role: 'user' | 'assistant'): void {
  if (!isClient) return
  const history = getChatHistory()
  history.push({ content, role })
  // Mantém apenas as últimas 50 mensagens
  if (history.length > 50) {
    history.splice(0, history.length - 50)
  }
  localStorage.setItem(KEYS.chatHistory, JSON.stringify(history))
}

export function clearChatHistory(): void {
  if (!isClient) return
  localStorage.removeItem(KEYS.chatHistory)
}

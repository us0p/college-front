'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Users,
  Shield,
  Eye,
  Mail,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getPosts,
  getUsers,
  getGroups,
  getDocuments,
  getSubscribers,
  initializeStorage,
} from '@/lib/storage'

interface Stats {
  posts: number
  users: number
  groups: number
  documents: number
  subscribers: number
  publicDocs: number
  privateDocs: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    users: 0,
    groups: 0,
    documents: 0,
    subscribers: 0,
    publicDocs: 0,
    privateDocs: 0,
  })

  useEffect(() => {
    initializeStorage()
    const posts = getPosts()
    const users = getUsers()
    const groups = getGroups()
    const documents = getDocuments()
    const subscribers = getSubscribers()

    setStats({
      posts: posts.length,
      users: users.length,
      groups: groups.length,
      documents: documents.length,
      subscribers: subscribers.length,
      publicDocs: documents.filter((d) => d.isPublic).length,
      privateDocs: documents.filter((d) => !d.isPublic).length,
    })
  }, [])

  const statCards = [
    {
      title: 'Total de Avisos',
      value: stats.posts,
      icon: FileText,
      description: 'Avisos publicados',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Usuários',
      value: stats.users,
      icon: Users,
      description: 'Cadastrados no sistema',
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Grupos de Acesso',
      value: stats.groups,
      icon: Shield,
      description: 'Níveis de permissão',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Documentos',
      value: stats.documents,
      icon: Eye,
      description: `${stats.publicDocs} públicos, ${stats.privateDocs} restritos`,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      title: 'Inscritos Newsletter',
      value: stats.subscribers,
      icon: Mail,
      description: 'Recebendo notificações',
      color: 'text-pink-600 bg-pink-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do Mural Universitário
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Semana Acadêmica 2024 publicado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Há 2 horas atrás
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Novo usuário cadastrado</p>
                  <p className="text-xs text-muted-foreground">
                    Há 5 horas atrás
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Manual do Aluno atualizado
                  </p>
                  <p className="text-xs text-muted-foreground">Há 1 dia atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium text-foreground">Versão Demo</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Esta é uma versão de demonstração. Os dados são armazenados
                  localmente no navegador e serão perdidos ao limpar os dados de
                  navegação.
                </p>
              </div>
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                <h4 className="font-medium text-accent">Chatbot</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  O chatbot está ativo e disponível para todos os visitantes. As
                  respostas são baseadas em palavras-chave e documentos marcados
                  como base de conhecimento.
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium text-foreground">
                  Documentos na Base de Conhecimento
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {
                    getDocuments().filter((d) => d.isKnowledgeBase).length
                  }{' '}
                  documento(s) disponível(is) para o chatbot.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

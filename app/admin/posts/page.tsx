'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, FileText, Search, Eye, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { getPosts, createPost, updatePost, deletePost } from '@/lib/api/posts'
import { getPostCategories } from '@/lib/api/post-categories'
import type { PostResponse, PostCategoryResponse } from '@/lib/api/types'

type FormData = {
  title: string
  markdownContent: string
  categoryId: string
  coverImgUrl: string
}

const emptyForm: FormData = { title: '', markdownContent: '', categoryId: '', coverImgUrl: '' }

export default function AdminPostsPage() {
  const { user, token } = useAuth()
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [categories, setCategories] = useState<PostCategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPosts()
      setPosts(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch {
      setError('Não foi possível carregar os posts.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
    if (token) {
      getPostCategories(token)
        .then(setCategories)
        .catch(() => setError('Não foi possível carregar as categorias.'))
    }
  }, [loadPosts, token])

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleOpenDialog = (post?: PostResponse) => {
    setFormError(null)
    if (post) {
      setSelectedPost(post)
      setFormData({
        title: post.title,
        markdownContent: post.markdownContent,
        categoryId: post.categoryId?.toString() ?? '',
        coverImgUrl: post.coverImgUrl ?? '',
      })
    } else {
      setSelectedPost(null)
      setFormData(emptyForm)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !user) return
    setIsSaving(true)
    setFormError(null)
    try {
      const categoryId = Number(formData.categoryId)
      const coverImgUrl = formData.coverImgUrl.trim() || undefined
      if (selectedPost) {
        await updatePost(selectedPost.id, { title: formData.title, markdownContent: formData.markdownContent, categoryId, coverImgUrl }, token)
      } else {
        await createPost({ userId: user.id, title: formData.title, markdownContent: formData.markdownContent, categoryId, coverImgUrl }, token)
      }
      await loadPosts()
      setIsDialogOpen(false)
    } catch {
      setFormError('Erro ao salvar o post. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPost || !token) return
    try {
      await deletePost(selectedPost.id, token)
      await loadPosts()
    } catch {
      setError('Erro ao excluir o post.')
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedPost(null)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Posts do Blog</h1>
          <p className="text-muted-foreground">Gerencie os posts e publicações do Mural Universitário</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredPosts.length} post(s)</Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="hidden sm:table-cell">Autor</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum post encontrado.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <p className="min-w-0 truncate font-medium">{post.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {post.categoryName
                      ? <Badge variant="secondary">{post.categoryName}</Badge>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{post.username}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/blog/${post.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedPost(post); setIsDeleteDialogOpen(true) }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost ? 'Editar Post' : 'Novo Post'}</DialogTitle>
            <DialogDescription>
              {selectedPost ? 'Atualize as informações do post.' : 'Preencha as informações do novo post.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Semana de Tecnologia 2024"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImgUrl">URL da Imagem de Capa</Label>
                <Input
                  id="coverImgUrl"
                  value={formData.coverImgUrl}
                  onChange={(e) => setFormData({ ...formData, coverImgUrl: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markdownContent">Conteúdo (Markdown)</Label>
              <Textarea
                id="markdownContent"
                value={formData.markdownContent}
                onChange={(e) => setFormData({ ...formData, markdownContent: e.target.value })}
                placeholder={`# Título\n\nEscreva o conteúdo usando **Markdown**.\n\n![descrição](https://url-da-imagem.jpg)\n\n## Subtítulo\n\n- Item 1\n- Item 2`}
                rows={14}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown: # títulos, **negrito**, *itálico*, - listas, ![alt](url) imagens.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !formData.categoryId}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSaving ? 'Salvando...' : selectedPost ? 'Salvar Alterações' : 'Publicar Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o post &quot;{selectedPost?.title}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

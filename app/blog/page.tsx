'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import { Calendar, User, Tag, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getPosts } from '@/lib/api/posts'
import type { PostResponse } from '@/lib/api/types'

const POSTS_PER_PAGE = 4

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')          // remove images ![alt](url)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')        // [label](url) → label only
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`>]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

function PostCard({ post }: { post: PostResponse }) {
  const excerpt = stripMarkdown(post.markdownContent).slice(0, 140)

  return (
    <Link
      href={`/blog/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/50 hover:shadow-lg"
    >
      {/* Cover image */}
      <div className="relative aspect-video overflow-hidden">
        {post.coverImgUrl ? (
          <Image
            src={post.coverImgUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent/20 to-primary/20" />
        )}
        {post.categoryName && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-accent text-accent-foreground">
              <Tag className="mr-1 h-3 w-3" />
              {post.categoryName}
            </Badge>
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-card-foreground transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {excerpt}
          {post.markdownContent.length > 140 ? '…' : ''}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.username}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </Link>
  )
}

function BlogContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('q') ?? ''

  const [allPosts, setAllPosts] = useState<PostResponse[]>([])
  const [displayedPosts, setDisplayedPosts] = useState<PostResponse[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [isLoading, setIsLoading] = useState(true)

  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' })

  useEffect(() => {
    getPosts()
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        setAllPosts(sorted)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filteredPosts = useCallback(() => {
    if (!searchQuery.trim()) return allPosts
    const q = searchQuery.toLowerCase()
    return allPosts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.username.toLowerCase().includes(q),
    )
  }, [allPosts, searchQuery])

  useEffect(() => {
    const posts = filteredPosts()
    setDisplayedPosts(posts.slice(0, POSTS_PER_PAGE))
    setPage(1)
    setHasMore(posts.length > POSTS_PER_PAGE)
  }, [filteredPosts])

  useEffect(() => {
    if (inView && hasMore) {
      const posts = filteredPosts()
      const nextPage = page + 1
      const next = posts.slice(0, nextPage * POSTS_PER_PAGE)
      setDisplayedPosts(next)
      setPage(nextPage)
      setHasMore(next.length < posts.length)
    }
  }, [inView, hasMore, page, filteredPosts])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Blog</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Confira as últimas novidades, eventos e oportunidades.
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="border-b border-border bg-card/50 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar publicações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">Nenhuma publicação encontrada.</p>
                {searchQuery && (
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {hasMore && (
                  <div ref={ref} className="mt-8 flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                  </div>
                )}

                {!hasMore && displayedPosts.length > 0 && (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    Você chegou ao fim das publicações.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense>
      <BlogContent />
    </Suspense>
  )
}

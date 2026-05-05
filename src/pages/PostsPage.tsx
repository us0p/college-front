import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPosts, createPost, updatePost, deletePost } from '../api/posts';
import type { PostResponse } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  markdownContent: z.string().min(1, 'Content is required'),
});
type PostFormData = z.infer<typeof postSchema>;

function previewContent(markdown: string): string {
  if (markdown.length <= 100) return markdown;

  let end = 100;
  const linkOrImage = /!?\[[^\]]*\]\([^)]*\)/g;
  let match;
  while ((match = linkOrImage.exec(markdown)) !== null) {
    if (match.index < end && match.index + match[0].length > end) {
      end = match.index + match[0].length;
      break;
    }
  }

  return markdown.slice(0, end) + (end < markdown.length ? '...' : '');
}

function PostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: PostResponse;
  onEdit: (p: PostResponse) => void;
  onDelete: (id: number) => void;
}) {
  const preview = previewContent(post.markdownContent);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-indigo-700 text-sm">@{post.username}</span>
        <span className="text-gray-400 text-xs">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <Link
        to={`/posts/${post.id}`}
        className="block font-semibold text-gray-900 hover:text-indigo-700 transition-colors leading-snug mb-2"
      >
        {post.title}
      </Link>

      <div className="relative h-40 overflow-hidden">
        <div className="prose prose-sm max-w-none text-gray-500 prose-headings:text-gray-700 prose-headings:font-medium prose-a:text-indigo-600 prose-img:my-1 pointer-events-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview}</ReactMarkdown>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
        <Link
          to={`/posts/${post.id}`}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Read more →
        </Link>
        <button
          onClick={() => onEdit(post)}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="text-xs text-red-400 hover:text-red-600 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function PostForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: PostFormData;
  onSubmit: (data: PostFormData) => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          {...register('title')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Post title..."
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content (Markdown supported)
        </label>
        <textarea
          {...register('markdownContent')}
          rows={10}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Write your post in **markdown**..."
        />
        {errors.markdownContent && (
          <p className="text-red-500 text-xs mt-1">{errors.markdownContent.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isPending && <Spinner className="w-4 h-4" />}
        Save Post
      </button>
    </form>
  );
}

export default function PostsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PostResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const userId = 1; // TODO: derive from token

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const createMutation = useMutation({
    mutationFn: (data: PostFormData) =>
      createPost({ userId, title: data.title, markdownContent: data.markdownContent }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PostFormData) =>
      updatePost(editing!.id, { title: data.title, markdownContent: data.markdownContent }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      setDeletingId(null);
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Posts</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Post
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load posts." />}

      <div className="space-y-3">
        {posts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={setEditing}
            onDelete={setDeletingId}
          />
        ))}
        {posts?.length === 0 && (
          <p className="text-center text-gray-400 py-10">No posts yet.</p>
        )}
      </div>

      {showCreate && (
        <Modal title="New Post" onClose={() => setShowCreate(false)}>
          <PostForm
            onSubmit={(d) => createMutation.mutate(d)}
            isPending={createMutation.isPending}
          />
          {createMutation.isError && (
            <ErrorMessage message="Failed to create post." />
          )}
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Post" onClose={() => setEditing(null)}>
          <PostForm
            defaultValues={{ title: editing.title, markdownContent: editing.markdownContent }}
            onSubmit={(d) => updateMutation.mutate(d)}
            isPending={updateMutation.isPending}
          />
          {updateMutation.isError && (
            <ErrorMessage message="Failed to update post." />
          )}
        </Modal>
      )}

      {deletingId !== null && (
        <ConfirmDialog
          message="Are you sure you want to delete this post? This action cannot be undone."
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPost, updatePost, deletePost } from '../api/posts';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  markdownContent: z.string().min(1, 'Content is required'),
});
type PostFormData = z.infer<typeof postSchema>;

function EditForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues: PostFormData;
  onSubmit: (d: PostFormData) => void;
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
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          {...register('markdownContent')}
          rows={14}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
        Save Changes
      </button>
    </form>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['posts', Number(id)],
    queryFn: () => getPost(Number(id)),
  });

  const updateMutation = useMutation({
    mutationFn: (data: PostFormData) =>
      updatePost(Number(id), { title: data.title, markdownContent: data.markdownContent }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts', Number(id)] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      navigate('/');
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-4"
      >
        ← Back
      </button>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load post." />}

      {post && (
        <>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
              {post.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-indigo-700">@{post.username}</span>
                <span>·</span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {post.updatedAt !== post.createdAt && (
                  <>
                    <span>·</span>
                    <span>edited {new Date(post.updatedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-4" />

          <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {post.markdownContent}
            </ReactMarkdown>
          </article>

          {deleteMutation.isError && (
            <div className="mt-4">
              <ErrorMessage message="Failed to delete post." />
            </div>
          )}

          {showDeleteConfirm && (
            <ConfirmDialog
              message="Are you sure you want to delete this post? This action cannot be undone."
              onConfirm={() => deleteMutation.mutate()}
              onCancel={() => setShowDeleteConfirm(false)}
              isPending={deleteMutation.isPending}
            />
          )}
        </>
      )}

      {editing && post && (
        <Modal title="Edit Post" onClose={() => setEditing(false)}>
          <EditForm
            defaultValues={{ title: post.title, markdownContent: post.markdownContent }}
            onSubmit={(d) => updateMutation.mutate(d)}
            isPending={updateMutation.isPending}
          />
          {updateMutation.isError && (
            <ErrorMessage message="Failed to update post." />
          )}
        </Modal>
      )}
    </div>
  );
}

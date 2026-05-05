import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, uploadDocument, deleteDocument } from '../api/documents';
import type { DocumentResponse } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentCard({
  doc,
  onDelete,
}: {
  doc: DocumentResponse;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
      <div className="text-3xl shrink-0">📄</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{doc.fileName}</p>
        {doc.description && (
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{doc.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">@{doc.username}</span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400">{formatBytes(doc.fileSize)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <a
          href={doc.bucketUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View
        </a>
        <button
          onClick={() => onDelete(doc.id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function UploadForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const userId = 1; // TODO: derive from token

  const mutation = useMutation({
    mutationFn: () => {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error('No file selected');
      return uploadDocument(userId, file, description || undefined);
    },
    onSuccess,
  });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
        <input
          ref={fileRef}
          type="file"
          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Brief description of the document..."
        />
      </div>
      {mutation.isError && <ErrorMessage message="Upload failed. Please try again." />}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {mutation.isPending && <Spinner className="w-4 h-4" />}
        Upload Document
      </button>
    </div>
  );
}

export default function DocumentsPage() {
  const qc = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: docs, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      setDeletingId(null);
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Documents</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Upload
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load documents." />}

      <div className="space-y-3">
        {docs?.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            onDelete={setDeletingId}
          />
        ))}
        {docs?.length === 0 && (
          <p className="text-center text-gray-400 py-10">No documents yet.</p>
        )}
      </div>

      {deletingId !== null && (
        <ConfirmDialog
          message="Are you sure you want to delete this document? This action cannot be undone."
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}

      {showUpload && (
        <Modal title="Upload Document" onClose={() => setShowUpload(false)}>
          <UploadForm
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['documents'] });
              setShowUpload(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import { getRoles } from '../api/roles';
import type { UserResponse } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const userSchema = z.object({
  username: z.string().min(1).max(20),
  email: z.string().email().max(254),
  password: z.string().min(8).max(72),
  roleId: z.string().min(1, 'Select a role'),
  ra: z.string().max(10).optional(),
  phoneNumber: z.string().max(20).optional(),
});
type UserFormData = z.infer<typeof userSchema>;

function UserForm({
  defaultValues,
  onSubmit,
  isPending,
  isEdit,
}: {
  defaultValues?: Partial<UserFormData>;
  onSubmit: (d: UserFormData) => void;
  isPending: boolean;
  isEdit?: boolean;
}) {
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: getRoles });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {[
        { name: 'username' as const, label: 'Username', placeholder: 'johndoe' },
        { name: 'email' as const, label: 'Email', placeholder: 'john@college.edu' },
        {
          name: 'password' as const,
          label: isEdit ? 'New Password' : 'Password',
          placeholder: '••••••••',
          type: 'password',
        },
        { name: 'ra' as const, label: 'RA (optional)', placeholder: '2024001' },
        { name: 'phoneNumber' as const, label: 'Phone (optional)', placeholder: '+55 11 9...' },
      ].map(({ name, label, placeholder, type }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            {...register(name)}
            type={type ?? 'text'}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors[name] && (
            <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          {...register('roleId')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select a role...</option>
          {roles?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {errors.roleId && (
          <p className="text-red-500 text-xs mt-1">{errors.roleId.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isPending && <Spinner className="w-4 h-4" />}
        {isEdit ? 'Update User' : 'Create User'}
      </button>
    </form>
  );
}

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: UserResponse;
  onEdit: (u: UserResponse) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{user.username}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {user.roleName}
            </span>
            {user.ra && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                RA: {user.ra}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      {user.phoneNumber && (
        <p className="text-xs text-gray-400 mt-2">{user.phoneNumber}</p>
      )}
    </div>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      createUser({
        ...data,
        roleId: Number(data.roleId),
        ra: data.ra || undefined,
        phoneNumber: data.phoneNumber || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      updateUser(editing!.id, {
        ...data,
        roleId: Number(data.roleId),
        ra: data.ra || undefined,
        phoneNumber: data.phoneNumber || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeletingId(null);
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New User
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load users." />}

      <div className="space-y-3">
        {users?.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={setEditing}
            onDelete={setDeletingId}
          />
        ))}
        {users?.length === 0 && (
          <p className="text-center text-gray-400 py-10">No users found.</p>
        )}
      </div>

      {deletingId !== null && (
        <ConfirmDialog
          message="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}

      {showCreate && (
        <Modal title="New User" onClose={() => setShowCreate(false)}>
          <UserForm
            onSubmit={(d) => createMutation.mutate(d)}
            isPending={createMutation.isPending}
          />
          {createMutation.isError && <ErrorMessage message="Failed to create user." />}
        </Modal>
      )}

      {editing && (
        <Modal title="Edit User" onClose={() => setEditing(null)}>
          <UserForm
            isEdit
            defaultValues={{
              username: editing.username,
              email: editing.email,
              roleId: String(editing.roleId),
              ra: editing.ra,
              phoneNumber: editing.phoneNumber,
            }}
            onSubmit={(d) => updateMutation.mutate(d)}
            isPending={updateMutation.isPending}
          />
          {updateMutation.isError && <ErrorMessage message="Failed to update user." />}
        </Modal>
      )}
    </div>
  );
}

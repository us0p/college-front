import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getRoles, createRole, updateRole, deleteRole } from '../api/roles';
import {
  getPermissionObjects,
  getRolePermissionsByRole,
  assignPermission,
  revokePermission,
} from '../api/permissions';
import type { RoleResponse, RolePermissionResponse } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const roleSchema = z.object({ name: z.string().min(1).max(20) });
type RoleFormData = z.infer<typeof roleSchema>;

function RoleForm({
  defaultValues,
  onSubmit,
  isPending,
  isEdit,
}: {
  defaultValues?: RoleFormData;
  onSubmit: (d: RoleFormData) => void;
  isPending: boolean;
  isEdit?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormData>({ resolver: zodResolver(roleSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
        <input
          {...register('name')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. ADMIN, STUDENT"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isPending && <Spinner className="w-4 h-4" />}
        {isEdit ? 'Update Role' : 'Create Role'}
      </button>
    </form>
  );
}

function RolePermissionsPanel({ role }: { role: RoleResponse }) {
  const qc = useQueryClient();
  const [selectedPermId, setSelectedPermId] = useState('');
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const { data: allPerms } = useQuery({
    queryKey: ['permission-objects'],
    queryFn: getPermissionObjects,
  });

  const { data: rolePerms, isLoading } = useQuery({
    queryKey: ['role-permissions', role.id],
    queryFn: () => getRolePermissionsByRole(role.id),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignPermission({ roleId: role.id, permissionId: Number(selectedPermId) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-permissions', role.id] });
      setSelectedPermId('');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokePermission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-permissions', role.id] });
      setRevokingId(null);
    },
  });

  const assignedIds = new Set(rolePerms?.map((p: RolePermissionResponse) => p.permissionId));
  const available = allPerms?.filter((p) => !assignedIds.has(p.id)) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Assigned Permissions</p>
        {isLoading && <Spinner className="w-5 h-5" />}
        <div className="flex flex-wrap gap-2">
          {rolePerms?.map((rp: RolePermissionResponse) => (
            <span
              key={rp.id}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
            >
              {rp.permissionName}
              <button
                onClick={() => setRevokingId(rp.id)}
                className="text-indigo-400 hover:text-red-500 leading-none ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          {rolePerms?.length === 0 && (
            <p className="text-xs text-gray-400">No permissions assigned.</p>
          )}
        </div>
      </div>

      {revokingId !== null && (
        <ConfirmDialog
          message="Are you sure you want to revoke this permission?"
          onConfirm={() => revokeMutation.mutate(revokingId)}
          onCancel={() => setRevokingId(null)}
          isPending={revokeMutation.isPending}
        />
      )}

      {available.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Add Permission</p>
          <div className="flex gap-2">
            <select
              value={selectedPermId}
              onChange={(e) => setSelectedPermId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select permission...</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedPermId && assignMutation.mutate()}
              disabled={!selectedPermId || assignMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {assignMutation.isError && (
            <ErrorMessage message="Failed to assign permission." />
          )}
        </div>
      )}
    </div>
  );
}

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: RoleResponse;
  onEdit: (r: RoleResponse) => void;
  onDelete: (id: number) => void;
}) {
  const [showPerms, setShowPerms] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{role.name}</p>
          <p className="text-xs text-gray-400">ID: {role.id}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPerms(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Permissions
          </button>
          <button
            onClick={() => onEdit(role)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(role.id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {showPerms && (
        <Modal
          title={`Permissions – ${role.name}`}
          onClose={() => setShowPerms(false)}
        >
          <RolePermissionsPanel role={role} />
        </Modal>
      )}
    </div>
  );
}

export default function RolesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<RoleResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RoleFormData) => updateRole(editing!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setDeletingId(null);
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Roles</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Role
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {error && <ErrorMessage message="Failed to load roles." />}

      <div className="space-y-3">
        {roles?.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={setEditing}
            onDelete={setDeletingId}
          />
        ))}
        {roles?.length === 0 && (
          <p className="text-center text-gray-400 py-10">No roles found.</p>
        )}
      </div>

      {deletingId !== null && (
        <ConfirmDialog
          message="Are you sure you want to delete this role? This action cannot be undone."
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}

      {showCreate && (
        <Modal title="New Role" onClose={() => setShowCreate(false)}>
          <RoleForm
            onSubmit={(d) => createMutation.mutate(d)}
            isPending={createMutation.isPending}
          />
          {createMutation.isError && <ErrorMessage message="Failed to create role." />}
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Role" onClose={() => setEditing(null)}>
          <RoleForm
            isEdit
            defaultValues={{ name: editing.name }}
            onSubmit={(d) => updateMutation.mutate(d)}
            isPending={updateMutation.isPending}
          />
          {updateMutation.isError && <ErrorMessage message="Failed to update role." />}
        </Modal>
      )}
    </div>
  );
}

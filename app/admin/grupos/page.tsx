'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Search,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  getGroups,
  getUsers,
  saveGroup,
  deleteGroup,
  initializeStorage,
} from '@/lib/storage'
import type { AccessGroup, Permission } from '@/lib/types'
import { PERMISSION_LABELS } from '@/lib/types'

const ALL_PERMISSIONS: Permission[] = [
  'view_public_docs',
  'view_private_docs',
  'upload_docs',
  'manage_users',
  'manage_groups',
  'manage_posts',
]

const emptyGroup: Omit<AccessGroup, 'id'> = {
  name: '',
  permissions: ['view_public_docs'],
  level: 1,
}

export default function AdminGruposPage() {
  const [groups, setGroups] = useState<AccessGroup[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AccessGroup | null>(null)
  const [formData, setFormData] = useState<Omit<AccessGroup, 'id'>>(emptyGroup)
  const [usersInGroup, setUsersInGroup] = useState<number>(0)

  useEffect(() => {
    initializeStorage()
    loadGroups()
  }, [])

  const loadGroups = () => {
    setGroups(getGroups())
  }

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const countUsersInGroup = (groupId: string) => {
    return getUsers().filter((u) => u.groupId === groupId).length
  }

  const handleOpenDialog = (group?: AccessGroup) => {
    if (group) {
      setSelectedGroup(group)
      setFormData({
        name: group.name,
        permissions: group.permissions,
        level: group.level,
      })
    } else {
      setSelectedGroup(null)
      setFormData(emptyGroup)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const groupToSave: AccessGroup = {
      id: selectedGroup?.id || `group-${Date.now()}`,
      ...formData,
    }

    saveGroup(groupToSave)
    loadGroups()
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    if (selectedGroup && usersInGroup === 0) {
      deleteGroup(selectedGroup.id)
      loadGroups()
      setIsDeleteDialogOpen(false)
      setSelectedGroup(null)
    }
  }

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission],
      })
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== permission),
      })
    }
  }

  const openDeleteDialog = (group: AccessGroup) => {
    setSelectedGroup(group)
    setUsersInGroup(countUsersInGroup(group.id))
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Grupos de Acesso
          </h1>
          <p className="text-muted-foreground">
            Gerencie os grupos e níveis de permissão
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredGroups.length} grupo(s)</Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Nível</TableHead>
              <TableHead className="hidden sm:table-cell">Permissões</TableHead>
              <TableHead className="hidden md:table-cell">Usuários</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">
                    Nenhum grupo encontrado.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups.map((group) => {
                const userCount = countUsersInGroup(group.id)
                return (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                          <Shield className="h-5 w-5 text-accent" />
                        </div>
                        <p className="truncate font-medium">{group.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className={
                          group.level >= 7
                            ? 'bg-purple-100 text-purple-800'
                            : group.level >= 4
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        Nível {group.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {group.permissions.slice(0, 3).map((perm) => (
                          <Badge
                            key={perm}
                            variant="outline"
                            className="text-xs"
                          >
                            {PERMISSION_LABELS[perm]}
                          </Badge>
                        ))}
                        {group.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.permissions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{userCount} usuário(s)</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(group)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(group)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? 'Editar Grupo' : 'Novo Grupo'}
            </DialogTitle>
            <DialogDescription>
              {selectedGroup
                ? 'Atualize as informações e permissões do grupo.'
                : 'Defina o nome, nível e permissões do novo grupo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Professores"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nível de Acesso</Label>
              <Select
                value={formData.level.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, level: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Nível {level}{' '}
                      {level === 1
                        ? '(Básico)'
                        : level === 5
                        ? '(Intermediário)'
                        : level === 10
                        ? '(Completo)'
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                O nível determina quais documentos restritos o usuário pode
                acessar
              </p>
            </div>

            <div className="space-y-3">
              <Label>Permissões</Label>
              <div className="rounded-lg border border-border divide-y divide-border">
                {ALL_PERMISSIONS.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(permission, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={permission}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {PERMISSION_LABELS[permission]}
                      </Label>
                    </div>
                    {formData.permissions.includes(permission) && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                {selectedGroup ? 'Salvar' : 'Criar'}
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
              {usersInGroup > 0 ? (
                <>
                  Não é possível excluir o grupo &quot;{selectedGroup?.name}&quot; pois
                  existem {usersInGroup} usuário(s) vinculado(s) a ele. Remova ou
                  mova os usuários para outro grupo primeiro.
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir o grupo &quot;{selectedGroup?.name}&quot;?
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {usersInGroup === 0 && (
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

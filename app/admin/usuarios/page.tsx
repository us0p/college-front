'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  Shield,
  Mail,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import {
  getUsers,
  getGroups,
  saveUser,
  deleteUser,
  initializeStorage,
} from '@/lib/storage'
import { useAuth } from '@/hooks/use-auth'
import type { User, AccessGroup } from '@/lib/types'

const emptyUser: Omit<User, 'id' | 'createdAt'> = {
  username: '',
  email: '',
  password: '',
  phone: '',
  groupId: '',
  isAdmin: false,
}

export default function AdminUsuariosPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<AccessGroup[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] =
    useState<Omit<User, 'id' | 'createdAt'>>(emptyUser)

  useEffect(() => {
    initializeStorage()
    loadData()
  }, [])

  const loadData = () => {
    setUsers(getUsers())
    setGroups(getGroups())
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getGroupName = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    return group?.name || 'Sem grupo'
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        username: user.username,
        email: user.email,
        password: user.password,
        phone: user.phone || '',
        groupId: user.groupId,
        isAdmin: user.isAdmin,
      })
    } else {
      setSelectedUser(null)
      setFormData(emptyUser)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const userToSave: User = {
      id: selectedUser?.id || `user-${Date.now()}`,
      ...formData,
      createdAt: selectedUser?.createdAt || new Date().toISOString(),
    }

    saveUser(userToSave)
    loadData()
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    if (selectedUser && selectedUser.id !== currentUser?.id) {
      deleteUser(selectedUser.id)
      loadData()
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie os usuários e suas permissões
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredUsers.length} usuário(s)</Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="hidden sm:table-cell">Contato</TableHead>
              <TableHead className="hidden sm:table-cell">Grupo</TableHead>
              <TableHead className="hidden md:table-cell">Admin</TableHead>
              <TableHead className="hidden md:table-cell">Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{user.username}</p>
                        {user.id === currentUser?.id && (
                          <Badge variant="secondary" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">
                      <Shield className="mr-1 h-3 w-3" />
                      {getGroupName(user.groupId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.isAdmin ? (
                      <Badge className="bg-purple-100 text-purple-800">Sim</Badge>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={user.id === currentUser?.id}
                      >
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? 'Atualize as informações do usuário.'
                : 'Preencha as informações do novo usuário.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Ex: joao.silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Ex: joao@mural.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Digite a senha"
                required={!selectedUser}
              />
              {selectedUser && (
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter a senha atual
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Ex: (11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId">Grupo de Acesso</Label>
              <Select
                value={formData.groupId}
                onValueChange={(value) =>
                  setFormData({ ...formData, groupId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} (Nível {group.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isAdmin">Administrador</Label>
                <p className="text-xs text-muted-foreground">
                  Acesso ao painel administrativo
                </p>
              </div>
              <Switch
                id="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAdmin: checked })
                }
              />
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
                {selectedUser ? 'Salvar' : 'Criar'}
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
              Tem certeza que deseja excluir o usuário &quot;{selectedUser?.username}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

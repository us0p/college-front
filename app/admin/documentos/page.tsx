'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Search,
  Upload,
  Lock,
  Unlock,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  getDocuments,
  saveDocument,
  deleteDocument,
  initializeStorage,
} from '@/lib/storage'
import { useAuth } from '@/hooks/use-auth'
import type { Document } from '@/lib/types'

const emptyDocument: Omit<Document, 'id' | 'createdAt' | 'uploadedBy'> = {
  name: '',
  fileName: '',
  fileType: 'application/pdf',
  fileSize: 0,
  isPublic: true,
  isKnowledgeBase: false,
  minAccessLevel: 1,
}

export default function AdminDocumentosPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [formData, setFormData] =
    useState<Omit<Document, 'id' | 'createdAt' | 'uploadedBy'>>(emptyDocument)

  useEffect(() => {
    initializeStorage()
    loadDocuments()
  }, [])

  const loadDocuments = () => {
    const docs = getDocuments()
    setDocuments(docs)
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDialog = (doc?: Document) => {
    if (doc) {
      setSelectedDocument(doc)
      setFormData({
        name: doc.name,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        isPublic: doc.isPublic,
        isKnowledgeBase: doc.isKnowledgeBase,
        minAccessLevel: doc.minAccessLevel,
      })
    } else {
      setSelectedDocument(null)
      setFormData(emptyDocument)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const docToSave: Document = {
      id: selectedDocument?.id || `doc-${Date.now()}`,
      ...formData,
      uploadedBy: selectedDocument?.uploadedBy || user?.username || 'admin',
      createdAt: selectedDocument?.createdAt || new Date().toISOString(),
    }

    saveDocument(docToSave)
    loadDocuments()
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    if (selectedDocument) {
      deleteDocument(selectedDocument.id)
      loadDocuments()
      setIsDeleteDialogOpen(false)
      setSelectedDocument(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({
        ...formData,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        name: formData.name || file.name.replace(/\.[^/.]+$/, ''),
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Documentos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os documentos disponíveis para download
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredDocuments.length} documento(s)</Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Acesso</TableHead>
              <TableHead className="hidden sm:table-cell">Nível Mín.</TableHead>
              <TableHead className="hidden md:table-cell">Base IA</TableHead>
              <TableHead className="hidden md:table-cell">Enviado por</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">
                    Nenhum documento encontrado.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{doc.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {doc.fileName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {doc.isPublic ? (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        <Unlock className="mr-1 h-3 w-3" />
                        Público
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-500 text-orange-600">
                        <Lock className="mr-1 h-3 w-3" />
                        Restrito
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">Nível {doc.minAccessLevel}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {doc.isKnowledgeBase ? (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Brain className="mr-1 h-3 w-3" />
                        Sim
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {doc.uploadedBy}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(doc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDocument(doc)
                          setIsDeleteDialogOpen(true)
                        }}
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
              {selectedDocument ? 'Editar Documento' : 'Novo Documento'}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument
                ? 'Atualize as informações do documento.'
                : 'Preencha as informações do novo documento.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>
              {formData.fileName && (
                <p className="text-xs text-muted-foreground">
                  <Upload className="mr-1 inline h-3 w-3" />
                  {formData.fileName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Documento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Manual do Aluno 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minAccessLevel">Nível de Acesso Mínimo</Label>
              <Select
                value={formData.minAccessLevel.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, minAccessLevel: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Nível {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Acesso Público</Label>
                <p className="text-xs text-muted-foreground">
                  Disponível para todos os visitantes
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isKnowledgeBase">Base de Conhecimento IA</Label>
                <p className="text-xs text-muted-foreground">
                  Usar como referência para o chatbot
                </p>
              </div>
              <Switch
                id="isKnowledgeBase"
                checked={formData.isKnowledgeBase}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isKnowledgeBase: checked })
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
                {selectedDocument ? 'Salvar' : 'Criar'}
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
              Tem certeza que deseja excluir o documento &quot;{selectedDocument?.name}&quot;?
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

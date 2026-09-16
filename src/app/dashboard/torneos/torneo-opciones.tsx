'use client'

import { useState } from 'react'
import { MoreVertical, Edit, FileText, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { eliminarTorneo, editarTorneo } from './actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TorneoOpciones({ torneo }: { torneo: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de que deseas eliminar el torneo "${torneo.name}"? Se borrarán TODAS las inscripciones y partidos. Esta acción no se puede deshacer.`)) {
      setIsDeleting(true)
      try {
        const res = await eliminarTorneo(torneo.id)
        if (res?.error) {
          alert(res.error)
        } else {
          setIsOpen(false)
        }
      } catch (err) {
        alert('Ocurrió un error inesperado al eliminar')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsEditing(true)
    const formData = new FormData(e.currentTarget)
    await editarTorneo(torneo.id, formData)
    setIsEditing(false)
    setIsEditOpen(false)
  }


  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen) }}
        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); setIsOpen(false) }}></div>
          <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-md shadow-lg z-20 overflow-hidden text-sm flex flex-col">
            <button 
              onClick={(e) => { e.preventDefault(); setIsOpen(false); setIsEditOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted text-left"
            >
              <Edit className="h-4 w-4" /> Editar Torneo
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); setIsOpen(false); alert('Próximamente: Reporte Financiero') }}
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted text-left"
            >
              <FileText className="h-4 w-4" /> Reporte
            </button>
            <div className="h-px bg-border my-1"></div>
            <button 
              onClick={(e) => { e.preventDefault(); handleDelete() }}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-destructive/10 text-destructive text-left font-medium"
            >
              {isDeleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-r-transparent" /> : <Trash2 className="h-4 w-4" />} 
              {isDeleting ? 'Eliminando...' : 'Eliminar Torneo'}
            </button>
          </div>
        </>
      )}

      {/* Modal Editar Torneo */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Torneo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={torneo.name} required className="uppercase" />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={torneo.start_date?.split('T')[0]} required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Input id="category" name="category" defaultValue={torneo.category || ''} className="uppercase" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">Rama / Género</Label>
              <Select name="gender" defaultValue={torneo.gender || 'Masculino'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino (Caballeros)</SelectItem>
                  <SelectItem value="Femenino">Femenino (Damas)</SelectItem>
                  <SelectItem value="Mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price_per_player">Precio de Inscripción ($)</Label>
              <Input id="price_per_player" name="price_per_player" type="number" defaultValue={torneo.price_per_player} required />
            </div>
            
            <button 
              type="submit" 
              disabled={isEditing}
              className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md font-semibold transition-colors"
            >
              {isEditing ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

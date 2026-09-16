'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Settings2, Loader2 } from 'lucide-react'
import { actualizarPareja } from './actions'

export function BotonEditarPareja({ 
  teamId, 
  tournamentId, 
  initialTimeAvailability = '' 
}: { 
  teamId: string
  tournamentId: string
  initialTimeAvailability?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeAvailability, setTimeAvailability] = useState(initialTimeAvailability || '')

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await actualizarPareja(teamId, tournamentId, { 
        time_availability: timeAvailability 
      })
      if (res?.error) {
        alert(res.error)
      } else {
        setOpen(false)
      }
    } catch (e) {
      alert('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted" 
        title="Editar Pareja (Notas, Disponibilidad)"
        type="button"
      >
        <Settings2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajustes de la Pareja</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="time_availability" className="font-semibold text-foreground">Disponibilidad Horaria / Notas</Label>
            <textarea
              id="time_availability"
              value={timeAvailability}
              onChange={(e) => setTimeAvailability(e.target.value)}
              placeholder="Ej: Solo pueden jugar viernes después de las 18hs, o Sábado a la mañana."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {/* Aquí se pueden agregar más opciones a futuro */}
        </div>
        <DialogFooter>
          <button 
            type="button" 
            onClick={() => setOpen(false)}
            className="px-4 py-2 border rounded-md hover:bg-accent text-sm font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold flex items-center gap-2 hover:bg-primary/90"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar Cambios
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

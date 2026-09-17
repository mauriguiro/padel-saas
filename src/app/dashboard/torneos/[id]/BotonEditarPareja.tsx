'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Settings2, Loader2 } from 'lucide-react'
import { actualizarPareja } from './actions'
import { TeamAvailabilityConfig } from './team-availability-config'

export function BotonEditarPareja({ 
  teamId, 
  tournamentId, 
  initialTimeAvailability = '',
  initialAvailability = [],
  scheduleConfig = []
}: { 
  teamId: string
  tournamentId: string
  initialTimeAvailability?: string | null
  initialAvailability?: any
  scheduleConfig?: any
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeAvailability, setTimeAvailability] = useState(initialTimeAvailability || '')

  const handleSave = async (formData: FormData) => {
    setLoading(true)
    try {
      const availabilityStr = formData.get('availability') as string
      let parsedAvailability = []
      try {
        if (availabilityStr) parsedAvailability = JSON.parse(availabilityStr)
      } catch (err) {}

      const res = await actualizarPareja(teamId, tournamentId, { 
        time_availability: timeAvailability,
        availability: parsedAvailability
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
        className="px-2 py-1 rounded-md flex items-center justify-center gap-1.5 transition-colors border bg-muted/50 border-transparent text-muted-foreground hover:bg-muted/80 text-xs font-bold" 
        title="Editar Pareja (Notas, Disponibilidad)"
        type="button"
      >
        <Settings2 className="h-3.5 w-3.5" />
        <span>Ajustes</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajustes de la Pareja</DialogTitle>
        </DialogHeader>
        <form action={handleSave} className="flex flex-col gap-4 py-4">
          
          <TeamAvailabilityConfig 
            scheduleConfig={scheduleConfig} 
            initialAvailability={initialAvailability} 
          />

          <div className="flex flex-col gap-2 mt-4">
            <Label htmlFor="time_availability" className="font-semibold text-foreground">Notas Adicionales</Label>
            <textarea
              id="time_availability"
              value={timeAvailability}
              onChange={(e) => setTimeAvailability(e.target.value)}
              placeholder="Ej: Deben jugar en la Cancha 1 si es posible."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <DialogFooter className="mt-4">
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-accent text-sm font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold flex items-center gap-2 hover:bg-primary/90"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar Cambios
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

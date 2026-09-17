'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, X } from 'lucide-react'
import { inscribirPareja } from './actions'
import { TeamAvailabilityConfig } from './team-availability-config'

type Player = {
  id: string
  first_name: string
  last_name: string
  category: string
}

function MultiPlayerSelect({ 
  jugadores, 
  selectedIds, 
  onSelect, 
  disabledIds 
}: { 
  jugadores: Player[], 
  selectedIds: string[], 
  onSelect: (ids: string[]) => void, 
  disabledIds: string[] 
}) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = jugadores.filter(j => 
    `${j.last_name} ${j.first_name}`.toLowerCase().includes(inputValue.toLowerCase()) && !selectedIds.includes(j.id)
  )

  const handleSelect = (j: Player) => {
    if (disabledIds.includes(j.id) || selectedIds.length >= 2) return;
    onSelect([...selectedIds, j.id])
    setInputValue('')
    if (selectedIds.length === 1) {
      setIsOpen(false) // Second player selected, close menu
    }
  }

  const handleRemove = (idToRemove: string) => {
    onSelect(selectedIds.filter(id => id !== idToRemove))
  }

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-sm font-semibold">Seleccionar Pareja (2 Jugadores)</label>
      
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {selectedIds.map(id => {
            const j = jugadores.find(p => p.id === id)
            if (!j) return null
            return (
              <div key={id} className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md text-xs font-medium border border-green-200 dark:border-green-800">
                {j.last_name}, {j.first_name}
                <button type="button" onClick={() => handleRemove(id)} className="hover:text-red-500 ml-1 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selectedIds.length < 2 && (
        <input 
          type="text"
          placeholder={selectedIds.length === 0 ? "Buscar primer jugador..." : "Buscar compañero..."}
          value={inputValue}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          autoComplete="off"
        />
      )}
      
      {isOpen && selectedIds.length < 2 && (
        <div 
          className="absolute top-[100%] mt-1 z-50 w-full max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.length > 0 ? (
            filtered.map(j => {
              const isDisabled = disabledIds.includes(j.id)
              return (
                <div 
                  key={j.id} 
                  className={`relative flex w-full select-none items-center rounded-sm py-2 px-3 text-sm outline-none ${isDisabled ? 'opacity-50 cursor-not-allowed bg-muted/50' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => handleSelect(j)}
                >
                  {j.last_name}, {j.first_name} <span className="ml-2 text-muted-foreground text-xs">({j.category || 'Sin categoría'})</span>
                  {isDisabled && <span className="ml-auto text-xs font-semibold text-destructive">En otro equipo</span>}
                </div>
              )
            })
          ) : (
            <div className="py-2 px-3 text-sm text-muted-foreground">No se encontraron jugadores disponibles.</div>
          )}
        </div>
      )}
    </div>
  )
}


export function InscribirParejaModal({ 
  tournamentId, 
  jugadores,
  inscriptosIds = [],
  scheduleConfig = []
}: { 
  tournamentId: string, 
  jugadores: Player[],
  inscriptosIds?: string[],
  scheduleConfig?: any[]
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setSelectedPlayers([])
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    // Validación adicional frontend
    if (selectedPlayers.length !== 2) {
      setError('Debes seleccionar exactamente 2 jugadores para formar la pareja.')
      return
    }
    
    // Asignar los IDs de los jugadores
    formData.set('player1_id', selectedPlayers[0])
    formData.set('player2_id', selectedPlayers[1])

    const result = await inscribirPareja(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false) // Cierra el modal si fue exitoso
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger 
        className="flex items-center gap-2 bg-orange-400 text-black hover:bg-orange-500 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        type="button"
      >
        <Users className="h-4 w-4" />
        Inscribir Pareja
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inscribir Nueva Pareja</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <input type="hidden" name="tournament_id" value={tournamentId} />
          
          <MultiPlayerSelect 
            jugadores={jugadores}
            selectedIds={selectedPlayers}
            onSelect={setSelectedPlayers}
            disabledIds={inscriptosIds}
          />

          <div className="mt-2 border-t pt-4">
            <TeamAvailabilityConfig scheduleConfig={scheduleConfig} />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded-md hover:bg-accent text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-bold">
              Guardar Pareja
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users } from 'lucide-react'
import { inscribirPareja } from './actions'

type Player = {
  id: string
  first_name: string
  last_name: string
  category: string
}

function PlayerSelect({ 
  name, 
  jugadores, 
  label,
  selectedId,
  onSelect,
  disabledIds 
}: { 
  name: string, 
  jugadores: Player[], 
  label: string,
  selectedId: string,
  onSelect: (id: string) => void,
  disabledIds: string[]
}) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!selectedId) setInputValue('')
  }, [selectedId])

  const filtered = jugadores.filter(j => 
    `${j.last_name} ${j.first_name}`.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleSelect = (j: Player) => {
    if (disabledIds.includes(j.id)) return;
    onSelect(j.id)
    setInputValue(`${j.last_name}, ${j.first_name} - ${j.category || 'Sin categoría'}`)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-sm font-semibold">{label}</label>
      <input type="hidden" name={name} value={selectedId} required />
      <input 
        type="text"
        placeholder="Escribe para buscar jugador..."
        value={inputValue}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onChange={(e) => {
          setInputValue(e.target.value)
          onSelect('')
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        autoComplete="off"
      />
      {isOpen && (
        <div 
          className="absolute top-full mt-1 z-50 w-full max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
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
                  {isDisabled && <span className="ml-auto text-xs font-semibold text-destructive">Seleccionado</span>}
                </div>
              )
            })
          ) : (
            <div className="py-2 px-3 text-sm text-muted-foreground">No se encontraron jugadores.</div>
          )}
        </div>
      )}
      {!selectedId && inputValue && !isOpen && (
        <p className="text-xs text-muted-foreground">Selecciona un jugador válido de la lista.</p>
      )}
    </div>
  )
}

export function InscribirParejaModal({ 
  tournamentId, 
  jugadores,
  inscriptosIds = []
}: { 
  tournamentId: string, 
  jugadores: Player[],
  inscriptosIds?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setPlayer1('')
      setPlayer2('')
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    // Validación adicional frontend
    if (!formData.get('player1_id') || !formData.get('player2_id')) {
      setError('Debes seleccionar ambos jugadores de la lista.')
      return
    }

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
        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors"
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
          <PlayerSelect 
            name="player1_id" 
            label="Jugador 1" 
            jugadores={jugadores} 
            selectedId={player1}
            onSelect={setPlayer1}
            disabledIds={[...inscriptosIds, player2].filter(Boolean)}
          />
          <PlayerSelect 
            name="player2_id" 
            label="Jugador 2" 
            jugadores={jugadores} 
            selectedId={player2}
            onSelect={setPlayer2}
            disabledIds={[...inscriptosIds, player1].filter(Boolean)}
          />

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

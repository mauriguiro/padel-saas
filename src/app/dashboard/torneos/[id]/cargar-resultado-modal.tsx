'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Swords, Pencil } from 'lucide-react'
import { guardarResultado } from './actions'

type Team = {
  id: string
  player1: { last_name: string }
  player2: { last_name: string }
}

export function CargarResultadoModal({ 
  matchId, 
  tournamentId,
  team1, 
  team2,
  isEdit = false
}: { 
  matchId: string, 
  tournamentId: string,
  team1: Team, 
  team2: Team,
  isEdit?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await guardarResultado(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  const team1Name = `${team1.player1.last_name} / ${team1.player2?.last_name || ''}`
  const team2Name = `${team2.player1.last_name} / ${team2.player2?.last_name || ''}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        type="button"
        className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2 rounded-md transition-all ${
          isEdit 
          ? 'bg-background border border-muted-foreground/30 text-foreground hover:bg-muted shadow-sm' 
          : 'bg-emerald-100 text-black hover:bg-emerald-200 border border-emerald-200 shadow-sm'
        }`}
      >
        {isEdit && <Pencil className="h-3 w-3" />}
        {isEdit ? 'Editar' : 'Cargar Resultado'}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Cargar Resultado del Partido
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <input type="hidden" name="match_id" value={matchId} />
          <input type="hidden" name="tournament_id" value={tournamentId} />
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold">Resultados (Sets)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="stb" 
                  name="is_super_tiebreak" 
                  defaultChecked={true} 
                  className="w-4 h-4"
                />
                <label htmlFor="stb" className="text-xs text-muted-foreground">3er Set es Súper Tie-Break</label>
              </div>
            </div>

            <div className="bg-muted/10 p-4 rounded-lg border flex flex-col gap-3">
              {/* Encabezados */}
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1">
                <div className="w-1/2">EQUIPO</div>
                <div className="flex gap-2 w-1/2 justify-end">
                  <div className="w-10 text-center">S1</div>
                  <div className="w-10 text-center">S2</div>
                  <div className="w-10 text-center">S3</div>
                </div>
              </div>

              {/* Equipo 1 */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate pr-4 w-1/2" title={team1Name}>{team1Name}</span>
                <div className="flex gap-2 w-1/2 justify-end">
                  <input name="t1_s1" type="number" min="0" max="7" required className="w-10 h-10 text-center border rounded-md focus-visible:ring-2 outline-none" />
                  <input name="t1_s2" type="number" min="0" max="7" required className="w-10 h-10 text-center border rounded-md focus-visible:ring-2 outline-none" />
                  <input name="t1_s3" type="number" min="0" max="30" className="w-10 h-10 text-center border rounded-md focus-visible:ring-2 outline-none bg-accent/30" placeholder="-" />
                </div>
              </div>

              {/* Equipo 2 */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate pr-4 w-1/2" title={team2Name}>{team2Name}</span>
                <div className="flex gap-2 w-1/2 justify-end">
                  <input name="t2_s1" type="number" min="0" max="7" required className="w-10 h-10 text-center border rounded-md focus-visible:ring-2 outline-none" />
                  <input name="t2_s2" type="number" min="0" max="7" required className="w-10 h-10 text-center border rounded-md focus-visible:ring-2 outline-none" />
                  <input name="t2_s3" type="number" min="0" max="30" className="w-10 h-10 text-center border rounded-md focus-visible:ring-2 outline-none bg-accent/30" placeholder="-" />
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">Si no hubo 3er set, deja sus casilleros vacíos. El sistema calculará el ganador automáticamente.</p>
          </div>

          {error && <p className="text-sm text-destructive font-medium bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded-md hover:bg-accent text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md text-sm font-bold">
              Guardar Partido
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { togglePago } from './actions'
import { CheckCircle2, CircleDollarSign } from 'lucide-react'
import { useTransition } from 'react'

export function BotonPago({ 
  teamId, 
  playerNum, 
  hasPaid, 
  tournamentId 
}: { 
  teamId: string, 
  playerNum: 1 | 2, 
  hasPaid: boolean,
  tournamentId: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('team_id', teamId)
      formData.append('player_num', playerNum.toString())
      formData.append('current_status', hasPaid.toString())
      formData.append('tournament_id', tournamentId)
      await togglePago(formData)
    })
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors border ${
        hasPaid 
          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
          : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={hasPaid ? 'Pagado (Clic para deshacer)' : 'Pendiente (Clic para marcar como pagado)'}
    >
      {hasPaid ? <CheckCircle2 className="h-3 w-3" /> : <CircleDollarSign className="h-3 w-3" />}
      {hasPaid ? 'Pagado' : 'Pendiente'}
    </button>
  )
}

'use client'

import { useState } from 'react'
import { Crown } from 'lucide-react'
import { toggleSeeded } from './actions'

export function BotonCabezaSerie({ 
  teamId, 
  isSeeded, 
  tournamentId 
}: { 
  teamId: string, 
  isSeeded: boolean,
  tournamentId: string
}) {
  const [loading, setLoading] = useState(false)
  
  const handleToggle = async () => {
    setLoading(true)
    await toggleSeeded(teamId, !isSeeded, tournamentId)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-2 py-1 rounded-md flex items-center justify-center gap-1.5 transition-colors border text-xs font-bold ${
        isSeeded 
          ? 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-500 shadow-sm' 
          : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted/80'
      }`}
      title={isSeeded ? "Quitar Cabeza de Serie" : "Marcar como Cabeza de Serie"}
    >
      <Crown className={`h-3.5 w-3.5 ${isSeeded ? 'fill-current' : ''}`} />
      {isSeeded && <span>Cabeza de Serie</span>}
    </button>
  )
}

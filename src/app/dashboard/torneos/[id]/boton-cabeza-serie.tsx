'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
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
      className={`p-1.5 rounded-md flex items-center justify-center transition-colors border ${
        isSeeded 
          ? 'bg-yellow-100 border-yellow-300 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-500' 
          : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted/80'
      }`}
      title={isSeeded ? "Quitar Cabeza de Serie" : "Marcar como Cabeza de Serie"}
    >
      <Star className={`h-4 w-4 ${isSeeded ? 'fill-current' : ''}`} />
    </button>
  )
}

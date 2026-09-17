'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { avanzarRonda } from './actions'

export function BotonAvanzarRonda({ tournamentId }: { tournamentId: string }) {
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    setLoading(true)
    
    // Primero intentamos sin forzar
    const formData = new FormData()
    formData.append('tournament_id', tournamentId)
    
    const result = await avanzarRonda(formData)
    
    if (result?.error === 'UNVERIFIED') {
      const confirmForce = confirm('Hay resultados cargados pero sin verificar.\n\n¿Quieres proceder de todas formas a generar la siguiente ronda?')
      if (confirmForce) {
        formData.append('force', 'true')
        await avanzarRonda(formData)
      }
    } else if (result?.error) {
      alert(result.error)
    }
    
    setLoading(false)
  }

  return (
    <button 
      type="button"
      onClick={handleAction} 
      disabled={loading}
      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md font-bold shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
    >
      <Trophy className="h-4 w-4" />
      {loading ? 'Generando...' : 'Generar Siguiente Ronda'}
    </button>
  )
}

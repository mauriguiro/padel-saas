'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { eliminarInscripcion } from './actions'

export function BotonEliminarInscripcion({ teamId, tournamentId }: { teamId: string, tournamentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar a esta pareja del torneo?')) {
      setIsDeleting(true)
      await eliminarInscripcion(teamId, tournamentId)
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
      title="Eliminar Inscripción"
    >
      {isDeleting ? <span className="h-4 w-4 block animate-spin rounded-full border-2 border-destructive border-r-transparent" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}

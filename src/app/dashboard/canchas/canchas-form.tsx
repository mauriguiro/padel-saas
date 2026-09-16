'use client'

import { useState, useRef } from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { addCourt, deleteCourt } from './actions'

export function CanchasForm({ canchas }: { canchas: any[] }) {
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleAdd = async (formData: FormData) => {
    setLoading(true)
    await addCourt(formData)
    formRef.current?.reset()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta cancha? Si hay partidos asignados a ella, perderán su asignación.')) {
      setDeletingId(id)
      await deleteCourt(id)
      setDeletingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Formulario para añadir */}
      <div className="bg-card border rounded-xl p-6 shadow-sm h-fit">
        <h2 className="text-xl font-bold mb-4">Añadir Nueva Cancha</h2>
        <form ref={formRef} action={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre de la Cancha</label>
            <input 
              name="name" 
              type="text" 
              placeholder="Ej: Cancha 1, Central, Cristal..." 
              required 
              className="w-full border rounded-md px-3 py-2 bg-background"
            />
          </div>
          <button 
            disabled={loading}
            className="bg-primary text-primary-foreground font-bold py-2 rounded-md hover:bg-primary/90 flex justify-center items-center gap-2"
          >
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" /> : <PlusCircle className="h-5 w-5" />}
            {loading ? 'Guardando...' : 'Añadir Cancha'}
          </button>
        </form>
      </div>

      {/* Lista de Canchas */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Mis Canchas Registradas ({canchas.length})</h2>
        {canchas.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No tienes canchas registradas. Añade una para empezar a usar el Planificador.</p>
        ) : (
          <ul className="divide-y border rounded-md">
            {canchas.map(cancha => (
              <li key={cancha.id} className="p-3 flex justify-between items-center hover:bg-muted/30">
                <span className="font-medium">{cancha.name}</span>
                <button 
                  onClick={() => handleDelete(cancha.id)}
                  disabled={deletingId === cancha.id}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  {deletingId === cancha.id ? (
                    <span className="h-4 w-4 block animate-spin rounded-full border-2 border-destructive border-r-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

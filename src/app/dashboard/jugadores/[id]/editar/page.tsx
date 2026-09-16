import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarJugadorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jugador } = await supabase.from('players').select('*').eq('id', params.id).eq('club_id', user.id).single()

  if (!jugador) {
    redirect('/dashboard/jugadores')
  }

  async function actualizarJugador(formData: FormData) {
    'use server'
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('players').update({
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      dni: formData.get('dni'),
      birth_date: formData.get('birth_date') ? formData.get('birth_date') : null,
      category: (formData.get('category') as string)?.toUpperCase() || '',
      gender: formData.get('gender'),
      points: Number(formData.get('points') || 0)
    }).eq('id', params.id).eq('club_id', user.id)

    redirect('/dashboard/jugadores')
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jugadores" className="bg-muted p-2 rounded-md hover:bg-muted/80">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold text-3xl">Editar Jugador</h1>
      </div>

      <form action={actualizarJugador} className="bg-background border rounded-lg p-6 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-red-500">Nombre *</label>
            <input required name="first_name" defaultValue={jugador.first_name} className="border p-2 rounded-md" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-red-500">Apellido *</label>
            <input required name="last_name" defaultValue={jugador.last_name} className="border p-2 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-red-500">Teléfono *</label>
            <input required name="phone" defaultValue={jugador.phone} className="border p-2 rounded-md" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Email</label>
            <input name="email" type="email" defaultValue={jugador.email} className="border p-2 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-red-500">DNI *</label>
            <input required name="dni" defaultValue={jugador.dni} className="border p-2 rounded-md" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Fecha de Nacimiento</label>
            <input type="date" name="birth_date" defaultValue={jugador.birth_date} className="border p-2 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-red-500">Categoría *</label>
            <input 
              required 
              name="category" 
              list="categorias-jugador"
              defaultValue={jugador.category} 
              className="border p-2 rounded-md uppercase"
            />
            <datalist id="categorias-jugador">
              <option value="1RA" />
              <option value="2DA" />
              <option value="3RA" />
              <option value="4TA" />
              <option value="5TA" />
              <option value="6TA" />
              <option value="7MA" />
              <option value="8VA" />
            </datalist>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-red-500">Género *</label>
            <select required name="gender" defaultValue={jugador.gender} className="border p-2 rounded-md">
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm text-primary">Puntos (Ranking)</label>
            <input type="number" name="points" defaultValue={jugador.points || 0} className="border p-2 rounded-md font-bold text-primary" />
          </div>
        </div>

        <button type="submit" className="mt-4 bg-primary text-primary-foreground font-bold p-3 rounded-md hover:bg-primary/90">
          Guardar Cambios
        </button>
      </form>
    </div>
  )
}

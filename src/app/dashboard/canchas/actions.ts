'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCourt(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autorizado')

  const name = formData.get('name') as string
  if (!name) return { error: 'El nombre de la cancha es requerido' }

  const { error } = await supabase
    .from('courts')
    .insert({
      club_id: user.id,
      name: name
    })

  if (error) {
    console.error('Error adding court:', error)
    return { error: 'No se pudo añadir la cancha' }
  }

  revalidatePath('/dashboard/canchas')
  return { success: true }
}

export async function deleteCourt(courtId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('courts')
    .delete()
    .eq('id', courtId)
    .eq('club_id', user.id) // Seguridad

  if (error) {
    console.error('Error deleting court:', error)
    throw new Error('No se pudo eliminar la cancha')
  }

  revalidatePath('/dashboard/canchas')
}

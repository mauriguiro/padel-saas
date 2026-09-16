'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function eliminarTorneo(torneoId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autorizado')
  }

  // Verificar que el usuario es el dueño
  const { data: torneo } = await supabase
    .from('tournaments')
    .select('club_id')
    .eq('id', torneoId)
    .single()

  if (!torneo || torneo.club_id !== user.id) {
    throw new Error('No tienes permisos para eliminar este torneo')
  }

  // Eliminar dependencias manualmente por si no hay CASCADE
  await supabase.from('player_history').delete().eq('tournament_id', torneoId)
  await supabase.from('matches').delete().eq('tournament_id', torneoId)
  await supabase.from('tournament_teams').delete().eq('tournament_id', torneoId)

  // Eliminar torneo
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', torneoId)

  if (error) {
    console.error('Error al eliminar torneo:', error)
    return { error: 'No se pudo eliminar el torneo. Revisa si hay otros datos vinculados.' }
  }

  revalidatePath('/dashboard/torneos')
  return { success: true }
}

export async function editarTorneo(torneoId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autorizado')
  }

  const name = formData.get('name') as string
  const start_date = formData.get('start_date') as string
  const category = formData.get('category') as string
  const gender = formData.get('gender') as string
  const price_per_player = parseInt(formData.get('price_per_player') as string) || 0

  const { error } = await supabase
    .from('tournaments')
    .update({
      name: name?.toUpperCase(),
      start_date,
      category: category?.toUpperCase(),
      gender,
      price_per_player
    })
    .eq('id', torneoId)
    .eq('club_id', user.id)

  if (error) {
    console.error('Error al editar torneo:', error)
    throw new Error('No se pudo editar el torneo')
  }

  revalidatePath('/dashboard/torneos')
}

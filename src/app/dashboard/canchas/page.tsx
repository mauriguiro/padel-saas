import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CanchasForm } from './canchas-form'

export default async function CanchasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: canchas } = await supabase
    .from('courts')
    .select('*')
    .eq('club_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-10">
      <div className="text-center">
        <h1 className="font-bold text-3xl">Mis Canchas</h1>
      </div>

      <CanchasForm canchas={canchas || []} />
    </div>
  )
}

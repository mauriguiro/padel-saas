import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { CheckCircle, XCircle, Building2, Calendar as CalendarIcon } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function SolicitudesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Incoming Requests (where user is the co_host and status is PENDING)
  // We need to fetch the host club profile too
  const { data: incomingRequests } = await supabase
    .from('tournaments')
    .select(`
      *,
      host:profiles!tournaments_club_id_fkey(full_name, username)
    `)
    .eq('co_host_id', user.id)
    .eq('zonal_status', 'PENDING')

  // Outgoing Requests (where user is the host, is_zonal is true, and status is PENDING)
  const { data: outgoingRequests } = await supabase
    .from('tournaments')
    .select(`
      *,
      co_host:profiles!tournaments_co_host_id_fkey(full_name, username)
    `)
    .eq('club_id', user.id)
    .eq('is_zonal', true)
    .eq('zonal_status', 'PENDING')

  const updateRequestStatus = async (formData: FormData) => {
    'use server'
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const tournamentId = formData.get('tournament_id') as string
    const status = formData.get('status') as string

    await supabase
      .from('tournaments')
      .update({ zonal_status: status })
      .eq('id', tournamentId)
      .eq('co_host_id', user.id) // Security check

    revalidatePath('/dashboard/solicitudes')
    revalidatePath('/dashboard/torneos')
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      <div>
        <h1 className="font-bold text-3xl text-foreground">Solicitudes Zonales</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona las invitaciones de otros clubes para organizar torneos combinados.
        </p>
      </div>

      {/* Recibidas */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Invitaciones Recibidas ({incomingRequests?.length || 0})
        </h2>
        
        {incomingRequests && incomingRequests.length > 0 ? (
          <div className="grid gap-4">
            {incomingRequests.map((req: any) => (
              <Card key={req.id} className="border-green-200 shadow-sm bg-green-50/10">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg uppercase">{req.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" /> 
                      Club Anfitrión: <strong>{req.host?.full_name}</strong> (@{req.host?.username})
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-4 w-4" /> 
                      Fecha de Inicio: {new Date(req.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <form action={updateRequestStatus} className="flex-1">
                      <input type="hidden" name="tournament_id" value={req.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 font-bold rounded-md transition-colors">
                        <XCircle className="h-4 w-4" /> Rechazar
                      </button>
                    </form>
                    <form action={updateRequestStatus} className="flex-1">
                      <input type="hidden" name="tournament_id" value={req.id} />
                      <input type="hidden" name="status" value="ACCEPTED" />
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 font-bold rounded-md transition-colors shadow-sm">
                        <CheckCircle className="h-4 w-4" /> Aceptar Invitación
                      </button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm p-4 border rounded-md bg-muted/20">
            No tienes invitaciones pendientes.
          </p>
        )}
      </section>

      {/* Enviadas */}
      <section className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-bold">
          Invitaciones Enviadas ({outgoingRequests?.length || 0})
        </h2>
        
        {outgoingRequests && outgoingRequests.length > 0 ? (
          <div className="grid gap-4">
            {outgoingRequests.map((req: any) => (
              <Card key={req.id} className="shadow-sm">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg uppercase">{req.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" /> 
                      Esperando respuesta de: <strong>{req.co_host?.full_name}</strong> (@{req.co_host?.username})
                    </p>
                  </div>
                  <div>
                    <span className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Pendiente
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm p-4 border rounded-md bg-muted/20">
            No has enviado invitaciones zonales.
          </p>
        )}
      </section>
    </div>
  )
}

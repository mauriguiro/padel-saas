import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { CalendarDays, Users, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TorneoOpciones } from '../torneo-opciones'

export default async function TorneosHistorialPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: misTorneos } = await supabase
    .from('tournaments')
    .select('*')
    .eq('club_id', user.id)
    .order('start_date', { ascending: false })

  const { data: torneosZonales } = await supabase
    .from('tournaments')
    .select('*')
    .eq('co_host_id', user.id)
    .eq('zonal_status', 'ACCEPTED')
    .order('start_date', { ascending: false })

  // Unir ambas listas
  const torneosRaw = [...(misTorneos || []), ...(torneosZonales || [])]
  // Ordenar por fecha descendente
  const torneos = torneosRaw.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

  const torneosHistorial = torneos.filter(t => t.status === 'COMPLETED' || t.status === 'FINISHED')

  if (!torneosHistorial || torneosHistorial.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-bold text-3xl whitespace-nowrap">Historial de Torneos</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-accent/20 mt-4">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold">No hay torneos en el historial</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Tus torneos finalizados aparecerán aquí.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-10">
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-bold text-3xl whitespace-nowrap">Historial de Torneos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {torneosHistorial.map((torneo) => (
          <Card key={torneo.id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-2 border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-2 overflow-hidden">
                <div className="flex flex-col gap-1 min-w-0">
                  <CardTitle className="text-lg leading-tight truncate uppercase" title={torneo.name}>{torneo.name}</CardTitle>
                  {torneo.is_zonal && (
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit">
                      Torneo Zonal
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap">
                    Finalizado
                  </span>
                  <TorneoOpciones torneo={torneo} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid gap-3 flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(torneo.start_date), "d 'de' MMMM, yyyy", { locale: es })}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Categoría: <span className="uppercase">{torneo.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Formato: {torneo.registration_type === 'POR_PAREJAS' ? 'Por Parejas' : 'Sorteo Individual'}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link 
                href={`/dashboard/torneos/${torneo.id}`} 
                className="w-full text-center bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 rounded-md text-sm font-semibold transition-colors"
              >
                Ver Detalles
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

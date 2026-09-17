import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { PlusCircle, CalendarDays, Users, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TorneoOpciones } from './torneo-opciones'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TorneosPage() {
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
  // 1. Obtener invitaciones zonales pendientes
  const { data: invitaciones, count: invitacionesCount } = await supabase
    .from('tournaments')
    .select('*', { count: 'exact' })
    .eq('co_host_id', user.id)
    .eq('zonal_status', 'PENDING')

  const torneosActivos = torneos.filter(t => t.status !== 'COMPLETED' && t.status !== 'FINISHED')
  const torneosHistorial = torneos.filter(t => t.status === 'COMPLETED' || t.status === 'FINISHED')

  const renderTorneos = (lista: typeof torneos, isEmptyMessage: string) => {
    if (!lista || lista.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-accent/20 mt-4">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold">{isEmptyMessage}</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Comienza a organizar tu primer torneo para generar el fixture e invitar jugadores.
          </p>
          <Link 
            href="/dashboard/torneos/nuevo" 
            className="mt-6 flex items-center gap-2 bg-[#6b8e23] text-white hover:bg-[#556b2f] px-6 py-3 rounded-md font-medium"
          >
            <PlusCircle className="h-5 w-5" />
            Crear mi primer torneo
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {lista.map((torneo) => (
          <Card key={torneo.id} className="hover:shadow-md transition-shadow flex flex-col overflow-visible">
            <CardHeader className="pb-2 border-b bg-muted/20 rounded-t-xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <CardTitle className="text-lg leading-tight truncate uppercase" title={torneo.name}>{torneo.name}</CardTitle>
                  {torneo.is_zonal && (
                    <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">
                      Torneo Zonal
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap">
                    {torneo.status === 'OPEN' && 'Inscripciones Abiertas'}
                    {torneo.status === 'IN_PROGRESS' && 'En Curso'}
                    {torneo.status === 'COMPLETED' && 'Finalizado'}
                    {torneo.status === 'FINISHED' && 'Finalizado'}
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
                Gestionar Torneo
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-10">
      
      {/* Banner de Invitaciones Zonales */}
      {invitacionesCount && invitacionesCount > 0 ? (
        <div className="bg-green-50 dark:bg-blue-950/40 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
              <svg className="h-5 w-5 text-green-700 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-green-900 dark:text-green-100">¡Tienes invitaciones a Torneos Zonales!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Has sido invitado a co-organizar {invitacionesCount} torneo(s) combinado(s).</p>
            </div>
          </div>
          <Link href="/dashboard/solicitudes" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-green-700 dark:hover:bg-green-500 transition-colors">
            Ver Invitaciones
          </Link>
        </div>
      ) : null}

      <div className="flex justify-between items-center mb-4 gap-2">
        <h1 className="font-bold text-2xl sm:text-3xl whitespace-nowrap truncate">Mis Torneos</h1>
        <Link 
          href="/dashboard/torneos/nuevo" 
          className="flex items-center gap-2 bg-[#6b8e23] text-white hover:bg-[#556b2f] px-3 sm:px-4 py-2 rounded-md font-medium shadow-sm transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0 text-sm sm:text-base"
        >
          <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>Nuevo Torneo</span>
        </Link>
      </div>

      {renderTorneos(torneosActivos, "No hay torneos activos")}
    </div>
  )
}

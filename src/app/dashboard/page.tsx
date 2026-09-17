import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Obtener conteo de jugadores
  const { count: playersCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', user.id)

  // 2. Obtener torneos (incluyendo zonales aceptados)
  const { data: torneos } = await supabase
    .from('tournaments')
    .select('*')
    .or(`club_id.eq.${user.id},and(co_host_id.eq.${user.id},zonal_status.eq.ACCEPTED)`)

  const activeTournaments = torneos?.filter(t => t.status !== 'FINISHED').length || 0

  // 3. Ingresos Mensuales Estimados (simplificado por ahora: torneos creados este mes)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const estimatedRevenue = torneos?.reduce((acc, t) => {
    const tDate = new Date(t.start_date)
    if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && t.club_id === user.id) {
      // Como no tenemos todavía el contador de inscriptos, mostramos el precio base por ahora o 0
      return acc + (t.price_per_player || 0)
    }
    return acc
  }, 0) || 0

  // 4. Invitaciones Zonales
  const { count: invitacionesCount } = await supabase
    .from('tournaments')
    .select('*', { count: 'exact', head: true })
    .eq('co_host_id', user.id)
    .eq('zonal_status', 'PENDING')

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      
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
          <a href="/dashboard/solicitudes" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-green-700 dark:hover:bg-green-500 transition-colors">
            Ver Invitaciones
          </a>
        </div>
      ) : null}

      <div>
        <h1 className="font-bold text-3xl">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen de tu club y accesos rápidos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <Link href="/dashboard/jugadores" className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl">
          <Card className="hover:shadow-md hover:bg-muted/30 hover:-translate-y-1 transition-all cursor-pointer text-center flex flex-col items-center h-full">
            <CardHeader>
              <CardTitle className="text-lg">Jugadores Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{playersCount || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Registrados en tu base de datos</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/torneos" className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl">
          <Card className="hover:shadow-md hover:bg-muted/30 hover:-translate-y-1 transition-all cursor-pointer text-center flex flex-col items-center h-full">
            <CardHeader>
              <CardTitle className="text-lg">Torneos en curso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{activeTournaments}</p>
              <p className="text-sm text-muted-foreground mt-1">Gana la fecha o zonales activos</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-shadow text-center flex flex-col items-center">
          <CardHeader>
            <CardTitle className="text-lg">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">${new Intl.NumberFormat('es-AR').format(estimatedRevenue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Valor base de torneos este mes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

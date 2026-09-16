import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Trophy, CalendarDays, MapPin } from 'lucide-react'
import { TorneoTabs } from '@/app/dashboard/torneos/[id]/torneo-tabs'

export default async function TorneoPublicoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  // 1. Obtener datos del torneo
  const { data: torneo } = await supabase
    .from('tournaments')
    .select('*, club:profiles!club_id(*)')
    .eq('id', params.id)
    .single()

  if (!torneo) return notFound()

  // 2. Obtener Partidos
  const { data: partidos } = await supabase
    .from('matches')
    .select(`
      *,
      team1:tournament_teams!team1_id(id, player1:players!player1_id(last_name), player2:players!player2_id(last_name)),
      team2:tournament_teams!team2_id(id, player1:players!player1_id(last_name), player2:players!player2_id(last_name))
    `)
    .eq('tournament_id', params.id)
    .order('created_at', { ascending: true })

  // 3. Obtener Canchas
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name')
    .eq('club_id', torneo.club_id)
    .order('name', { ascending: true })

  // Construir una vista simple de fixture de solo lectura
  const FixtureReadOnly = () => (
    <div className="flex flex-col gap-4">
      {partidos && partidos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partidos.map((partido) => (
            <div key={partido.id} className="bg-card border rounded-md p-4 flex flex-col gap-2 shadow-sm">
              <div className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                <span>{partido.round_name}</span>
                {partido.status === 'COMPLETED' && <span className="text-green-600">Finalizado</span>}
                {partido.status === 'PENDING' && <span className="text-orange-500">Pendiente</span>}
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className={`flex justify-between items-center ${partido.winner_id === partido.team1_id ? 'font-bold' : ''}`}>
                  <span>
                    {partido.team1 ? `${partido.team1.player1?.last_name} / ${partido.team1.player2?.last_name || '?'}` : 'Por definir'}
                  </span>
                  <span>{partido.status === 'COMPLETED' ? '✓' : ''}</span>
                </div>
                <div className={`flex justify-between items-center ${partido.winner_id === partido.team2_id ? 'font-bold' : ''}`}>
                  <span>
                    {partido.team2 ? `${partido.team2.player1?.last_name} / ${partido.team2.player2?.last_name || '?'}` : 'Por definir'}
                  </span>
                  <span>{partido.status === 'COMPLETED' ? '✓' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-muted/20 border-dashed border-2 rounded-xl">
          <p className="text-muted-foreground">El fixture aún no ha sido sorteado.</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Navbar Pública */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Trophy className="h-6 w-6" />
          <h1 className="font-extrabold text-xl">Padel SaaS • En Vivo</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 flex flex-col gap-8">
        
        {/* Cabecera del Torneo */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border text-center flex flex-col items-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
            {torneo.category || 'Categoría Única'} • {torneo.gender || 'Masculino'}
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-4">{torneo.name}</h2>
          
          <div className="flex flex-wrap justify-center gap-4 text-muted-foreground font-medium">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
              <CalendarDays className="h-4 w-4" />
              {new Date(torneo.start_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
              <MapPin className="h-4 w-4" />
              Sede: {torneo.club?.full_name || 'Club Organizador'}
            </div>
          </div>
        </div>

        {/* Tabs: Fixture y Planificador (Read Only) */}
        <div className="bg-card border rounded-2xl p-4 md:p-6 shadow-sm">
          <TorneoTabs 
            torneo={torneo}
            partidos={partidos || []}
            courts={courts || []}
            isReadOnly={true}
            FixtureView={<FixtureReadOnly />}
          />
        </div>

      </main>
    </div>
  )
}

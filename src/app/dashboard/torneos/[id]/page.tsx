import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Trophy, Play, CheckCircle2, Swords, Check, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InscribirParejaModal } from './inscribir-pareja-modal'
import { CargarResultadoModal } from './cargar-resultado-modal'
import { BotonPago } from './boton-pago'
import { BotonCabezaSerie } from './boton-cabeza-serie'
import { BotonEliminarInscripcion } from './boton-eliminar-inscripcion'
import { BotonEditarPareja } from './BotonEditarPareja'
import { BotonWhatsAppPromo, BotonWhatsAppPago, BotonWhatsAppPartido } from './whatsapp-botones'
import { generarFixture, finalizarTorneo } from './actions'
import { TorneoTabs } from './torneo-tabs'
import { BotonVerificarPartido } from './boton-verificar-partido'
import { BotonAvanzarRonda } from './boton-avanzar-ronda'
import { TournamentBracket } from './tournament-bracket'
import { FixtureView } from './fixture-view'
import { FAP_BRACKETS } from '@/lib/fap-rules'

export default async function TorneoDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  // Obtener datos del torneo
  const { data: torneo } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!torneo) redirect('/dashboard/torneos')

  // Obtener inscriptos (parejas)
  const { data: inscriptos, count: inscriptosCount } = await supabase
    .from('tournament_teams')
    .select('*, player1:players!player1_id(*), player2:players!player2_id(*)', { count: 'exact' })
    .eq('tournament_id', params.id)
    .order('created_at', { ascending: true })

  // Mapear los IDs de jugadores ya inscriptos para deshabilitarlos
  const inscritosIds = new Set<string>()
  if (inscriptos) {
    inscriptos.forEach(eq => {
      if (eq.player1_id) inscritosIds.add(eq.player1_id)
      if (eq.player2_id) inscritosIds.add(eq.player2_id)
    })
  }

  // Obtener jugadores para el Modal
  const tGender = torneo.gender || 'Masculino'
  let playersQuery = supabase
    .from('players')
    .select('id, first_name, last_name, category')
    .order('first_name', { ascending: true })

  if (tGender === 'Masculino' || tGender === 'Femenino') {
    playersQuery = playersQuery.eq('gender', tGender)
  }

  const { data: jugadores } = await playersQuery

  // Calcular finanzas (price_per_player ahora guarda el precio por pareja según lo solicitado)
  const pricePorPareja = torneo.price_per_player || 0
  const pricePorJugador = pricePorPareja / 2
  const totalPotencial = (inscriptosCount || 0) * pricePorPareja
  
  let totalRecaudado = 0
  if (inscriptos) {
    inscriptos.forEach(eq => {
      if (eq.has_paid_p1) totalRecaudado += pricePorJugador
      if (eq.has_paid_p2) totalRecaudado += pricePorJugador
    })
  }

  // Obtener Partidos si el torneo ya está en progreso
  const { data: partidos } = await supabase
    .from('matches')
    .select(`
      *,
      team1:tournament_teams!team1_id(id, player1:players!player1_id(first_name, last_name, phone), player2:players!player2_id(first_name, last_name, phone)),
      team2:tournament_teams!team2_id(id, player1:players!player1_id(first_name, last_name, phone), player2:players!player2_id(first_name, last_name, phone))
    `)
    .eq('tournament_id', params.id)
    .order('created_at', { ascending: true })

  // Obtener Canchas del Club
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name')
    .eq('club_id', torneo.club_id)
    .order('name', { ascending: true })

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-10">
      
      {/* Cabecera Principal */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/torneos" className="p-2 hover:bg-accent rounded-full transition-colors border bg-background shadow-sm">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="font-bold text-3xl uppercase">{torneo.name}</h1>
          <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {torneo.category || 'Categoría Única'} • {torneo.gender || 'Masculino'}
            </span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {torneo.status === 'OPEN' && 'Inscripciones Abiertas'}
              {torneo.status === 'IN_PROGRESS' && 'En Juego'}
              {torneo.status === 'COMPLETED' && 'Torneo Finalizado'}
            </span>
          </div>
        </div>
      </div>

      {/* Recuadros de Información y Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Recuadro de Info y Finanzas */}
        <Card className="shadow-sm border bg-muted/10">
          <CardHeader className="py-3 bg-muted/30 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" /> Resumen del Torneo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center divide-x">
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs uppercase font-bold text-muted-foreground mb-1">Inscriptos</span>
                <span className="text-2xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> {inscriptosCount || 0}</span>
                <span className="text-xs text-muted-foreground">Parejas</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs uppercase font-bold text-muted-foreground mb-1">Potencial</span>
                <span className="text-xl font-bold">${new Intl.NumberFormat('es-AR').format(totalPotencial)}</span>
                <span className="text-xs text-muted-foreground">Proyectado</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs uppercase font-bold text-muted-foreground mb-1">Recaudado</span>
                <span className="text-xl font-bold text-green-600">${new Intl.NumberFormat('es-AR').format(totalRecaudado)}</span>
                <span className="text-xs text-muted-foreground">Actual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recuadro de Acciones */}
        <Card className="shadow-sm border bg-muted/10">
          <CardHeader className="py-3 bg-muted/30 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
              <Play className="h-4 w-4" /> Panel de Acciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="flex flex-wrap gap-3">
              {torneo.status === 'OPEN' && (
                <>
                  <InscribirParejaModal 
                    tournamentId={torneo.id} 
                    jugadores={jugadores || []} 
                    inscriptosIds={Array.from(inscritosIds)}
                    scheduleConfig={torneo.schedule_config}
                  />
                  <BotonWhatsAppPromo torneoName={torneo.name} jugadores={jugadores || []} />
                  <form action={async (formData) => {
                    'use server'
                    await generarFixture(formData)
                  }} className="w-full sm:w-auto">
                    <input type="hidden" name="tournament_id" value={torneo.id} />
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-bold shadow-md transition-transform hover:-translate-y-0.5">
                      <Play className="h-4 w-4" />
                      Cerrar Inscripción y Sortear
                    </button>
                  </form>
                </>
              )}

              {torneo.status === 'IN_PROGRESS' && (
                <>
                  <BotonAvanzarRonda tournamentId={torneo.id} />
                  <form action={async (formData) => {
                    'use server'
                    await finalizarTorneo(formData)
                  }} className="w-full sm:w-auto">
                    <input type="hidden" name="tournament_id" value={torneo.id} />
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md font-bold shadow-md transition-transform hover:-translate-y-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Finalizar Torneo y Repartir Puntos
                    </button>
                  </form>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full mt-4">
        <TorneoTabs 
          torneo={torneo}
          partidos={partidos || []}
          courts={courts || []}
          InscriptosView={
            <div className="w-full max-w-3xl mx-auto">
              <Card className="shadow-sm border-0 sm:border">
                <CardContent className="p-0 sm:p-2">
                  {inscriptos && inscriptos.length > 0 ? (
                    <ul className="flex flex-col gap-3 p-2 sm:p-4">
                      {inscriptos.map((equipo, index) => {
                        const hasRestriction = Boolean(equipo.time_availability) || (Array.isArray(equipo.availability) && equipo.availability.some((a: any) => a.status && a.status !== 'ALL_DAY' && a.status !== 'TODO_EL_DIA'));
                        return (
                        <li key={equipo.id} className={`relative rounded-lg border shadow-sm transition-all hover:shadow-md bg-card ${hasRestriction ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-900/10' : 'border-border hover:border-primary/30'}`}>
                          <details className="group [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex items-center justify-between p-3 cursor-pointer list-none outline-none select-none">
                              <div className="flex items-center gap-2 truncate pr-2">
                                <span className="font-extrabold text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded shadow-sm shrink-0">
                                  Pareja {index + 1}
                                </span>
                                <span className="font-semibold text-sm truncate">
                                  {equipo.player1?.last_name} / {equipo.player2?.last_name || 'A designar'}
                                </span>
                                {hasRestriction && (
                                   <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/50 text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm" title="Con restricciones horarias">
                                     ⏱️
                                   </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                {/* Indicador de pago */}
                                {equipo.has_paid_p1 && (!equipo.player2 || equipo.has_paid_p2) ? (
                                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-green-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Pagos
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-red-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span> Deuda
                                  </div>
                                )}
                                <svg className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                              </div>
                            </summary>
                            
                            <div className="px-3 pb-3 flex flex-col gap-3">
                              <div className="w-full h-px bg-border/60"></div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <BotonEditarPareja 
                                    teamId={equipo.id} 
                                    tournamentId={torneo.id} 
                                    initialTimeAvailability={equipo.time_availability} 
                                    initialAvailability={equipo.availability}
                                    scheduleConfig={torneo.schedule_config}
                                  />
                                  {torneo.has_seeded_teams && (
                                    <BotonCabezaSerie teamId={equipo.id} isSeeded={equipo.is_seeded} tournamentId={torneo.id} />
                                  )}
                                </div>
                                {torneo.status === 'OPEN' && (
                                  <BotonEliminarInscripcion teamId={equipo.id} tournamentId={torneo.id} />
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between bg-muted/20 px-2.5 py-1.5 rounded-md border text-sm transition-colors hover:bg-muted/40 hover:border-primary/20">
                                  <span className="font-semibold text-xs truncate">{equipo.player1?.first_name} {equipo.player1?.last_name}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {!equipo.has_paid_p1 && <BotonWhatsAppPago playerName={equipo.player1?.first_name} phone={equipo.player1?.phone} torneoName={torneo.name} />}
                                    <BotonPago teamId={equipo.id} playerNum={1} hasPaid={equipo.has_paid_p1} tournamentId={torneo.id} />
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between bg-muted/20 px-2.5 py-1.5 rounded-md border text-sm transition-colors hover:bg-muted/40 hover:border-primary/20">
                                  <span className={`font-semibold text-xs truncate ${!equipo.player2 ? 'text-muted-foreground italic' : ''}`}>
                                    {equipo.player2 ? `${equipo.player2.first_name} ${equipo.player2.last_name}` : 'A designar'}
                                  </span>
                                  {equipo.player2 && (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {!equipo.has_paid_p2 && <BotonWhatsAppPago playerName={equipo.player2?.first_name} phone={equipo.player2?.phone} torneoName={torneo.name} />}
                                      <BotonPago teamId={equipo.id} playerNum={2} hasPaid={equipo.has_paid_p2} tournamentId={torneo.id} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </details>
                        </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">Aún no hay parejas inscriptas.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          }
          FixtureView={
            <div className="min-h-[400px] w-full bg-background rounded-xl p-2 border">
              <FixtureView torneo={torneo} dbMatches={partidos || []} />
            </div>
          }
          BracketView={
            <div className="min-h-[400px] w-full">
            {torneo.status === 'OPEN' ? (
              <Card className="h-full flex flex-col items-center justify-center bg-muted/10 border-dashed p-10">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-bold">Sorteo Pendiente</h3>
                <p className="text-muted-foreground mt-2 text-sm text-center max-w-sm">
                  Inscribe al menos a 2 parejas. El fixture matemático cruzará a los jugadores al azar cuando presiones "Sortear".
                </p>
              </Card>
            ) : (
              <TournamentBracket torneo={torneo} dbMatches={partidos || []} fapConfig={FAP_BRACKETS[inscriptos?.length || 6] || FAP_BRACKETS[6]} />
            )}
            </div>
          }
        />
      </div>
      
      {/* Modal de Inscripción */}
    </div>
  )
}

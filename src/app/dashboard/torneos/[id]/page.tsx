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
import { generarFixture, avanzarRonda, finalizarTorneo } from './actions'
import { TorneoTabs } from './torneo-tabs'
import { BotonVerificarPartido } from './boton-verificar-partido'

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
                  <BotonWhatsAppPromo torneoName={torneo.name} />
                  <InscribirParejaModal 
                    tournamentId={torneo.id} 
                    jugadores={jugadores || []} 
                    inscriptosIds={Array.from(inscritosIds)}
                  />
                  <form action={generarFixture} className="w-full sm:w-auto">
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
                  <form action={avanzarRonda} className="w-full sm:w-auto">
                    <input type="hidden" name="tournament_id" value={torneo.id} />
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-bold shadow-md transition-transform hover:-translate-y-0.5">
                      <Trophy className="h-4 w-4" />
                      Generar Siguiente Ronda
                    </button>
                  </form>
                  <form action={finalizarTorneo} className="w-full sm:w-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Parejas */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Inscriptos y Pagos</h2>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {inscriptos && inscriptos.length > 0 ? (
                <ul className="flex flex-col gap-4 p-4">
                  {inscriptos.map((equipo, index) => (
                    <li key={equipo.id} className={`relative p-3 rounded-xl border shadow-sm transition-all hover:shadow-md flex flex-col gap-3 ${equipo.time_availability ? 'border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-900/10' : 'bg-card'}`}>
                      
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-start justify-between border-b border-border/60 pb-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm tracking-tight text-foreground">
                              Pareja {index + 1}
                            </span>
                            {equipo.time_availability && (
                               <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800 text-[9px] font-bold uppercase tracking-wider leading-none">
                                 Con Notas
                               </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <BotonEditarPareja 
                              teamId={equipo.id} 
                              tournamentId={torneo.id} 
                              initialTimeAvailability={equipo.time_availability} 
                            />
                            {torneo.has_seeded_teams && (
                              <BotonCabezaSerie teamId={equipo.id} isSeeded={equipo.is_seeded} tournamentId={torneo.id} />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {torneo.status === 'OPEN' && (
                            <BotonEliminarInscripcion teamId={equipo.id} tournamentId={torneo.id} />
                          )}
                        </div>
                      </div>
                      
                      {/* Lista de Jugadores */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between bg-muted/40 dark:bg-muted/20 px-3 py-1.5 rounded-md border border-muted">
                          <span className="text-sm font-medium">{equipo.player1?.first_name} {equipo.player1?.last_name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!equipo.has_paid_p1 && <BotonWhatsAppPago playerName={equipo.player1?.first_name} phone={equipo.player1?.phone} torneoName={torneo.name} />}
                            <BotonPago teamId={equipo.id} playerNum={1} hasPaid={equipo.has_paid_p1} tournamentId={torneo.id} />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-muted/40 dark:bg-muted/20 px-3 py-1.5 rounded-md border border-muted">
                          <span className={`text-sm font-medium ${!equipo.player2 ? 'text-muted-foreground italic' : ''}`}>
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
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">Aún no hay parejas inscriptas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: El Cuadro / Fixture y Planificador */}
        <TorneoTabs 
          torneo={torneo}
          partidos={partidos || []}
          courts={courts || []}
          FixtureView={
            <div className="min-h-[400px]">
            {torneo.status === 'OPEN' ? (
              <Card className="h-full flex flex-col items-center justify-center bg-muted/10 border-dashed p-10">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-bold">Sorteo Pendiente</h3>
                <p className="text-muted-foreground mt-2 text-sm text-center max-w-sm">
                  Inscribe al menos a 2 parejas. El fixture matemático cruzará a los jugadores al azar cuando presiones "Sortear".
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {partidos?.map((partido) => {
                  const hasWinner = !!partido.winner_id;
                  
                  return (
                    <Card key={partido.id} className={`shadow-sm border-l-4 ${hasWinner ? 'border-l-green-500 bg-green-50/30' : 'border-l-primary'}`}>
                      <CardHeader className="py-2 px-3 bg-muted/20 border-b">
                        <CardTitle className="text-xs font-bold flex items-center justify-between">
                          {partido.round_name}
                          {hasWinner ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Swords className="h-3 w-3 text-muted-foreground" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 flex flex-col gap-1.5">
                        
                        {/* Equipo 1 */}
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold text-sm flex items-center gap-2 ${hasWinner && partido.winner_id !== partido.team1?.id ? 'text-muted-foreground line-through' : ''}`}>
                            {partido.team1 ? `${partido.team1.player1.last_name} / ${partido.team1.player2?.last_name || ''}` : '---'}
                            {hasWinner && partido.winner_id === partido.team1?.id && <Check className="h-3 w-3 text-green-600" />}
                          </span>
                          
                          {/* Puntajes Equipo 1 */}
                          {hasWinner && partido.sets_data && (
                            <div className="flex gap-2 text-sm">
                              {partido.sets_data.map((s: any, i: number) => (
                                <span key={i} className={`font-bold w-4 text-center ${s.t1 > s.t2 ? 'text-foreground' : 'text-muted-foreground'}`}>{s.t1}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full h-px bg-border my-0.5"></div>
                        
                        {/* Equipo 2 */}
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold text-sm flex items-center gap-2 ${hasWinner && partido.winner_id !== partido.team2?.id ? 'text-muted-foreground line-through' : ''}`}>
                            {partido.team2 ? `${partido.team2.player1.last_name} / ${partido.team2.player2?.last_name || ''}` : 'Pasa Directo (BYE)'}
                            {hasWinner && partido.winner_id === partido.team2?.id && <Check className="h-3 w-3 text-green-600" />}
                          </span>

                          {/* Puntajes Equipo 2 */}
                          {hasWinner && partido.sets_data && (
                            <div className="flex gap-2 text-sm">
                              {partido.sets_data.map((s: any, i: number) => (
                                <span key={i} className={`font-bold w-4 text-center ${s.t2 > s.t1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s.t2}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Botón / Estado */}
                        {partido.team1 && partido.team2 && (
                          <div className="flex gap-2 w-full mt-1.5">
                            <CargarResultadoModal 
                              matchId={partido.id} 
                              tournamentId={torneo.id}
                              team1={partido.team1} 
                              team2={partido.team2} 
                              isEdit={hasWinner}
                            />
                            {hasWinner && (
                              <BotonVerificarPartido 
                                matchId={partido.id}
                                tournamentId={torneo.id}
                                torneoName={torneo.name}
                                roundName={partido.round_name || ''}
                                winner={partido.winner_id === partido.team1.id ? partido.team1 : partido.team2}
                                loser={partido.winner_id === partido.team1.id ? partido.team2 : partido.team1}
                                isVerified={partido.is_verified}
                                setsData={partido.sets_data}
                              />
                            )}
                            {!hasWinner && (
                              <BotonWhatsAppPartido 
                                torneoName={torneo.name}
                                roundName={partido.round_name}
                                team1={partido.team1}
                                team2={partido.team2}
                              />
                            )}
                          </div>
                        )}
                        {!hasWinner && (!partido.team1 || !partido.team2) && (
                          <p className="mt-1 text-[10px] text-center text-muted-foreground italic">
                            Clasificación Automática
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
          }
        />
      </div>
      
      {/* Modal de Inscripción */}
    </div>
  )
}

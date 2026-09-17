'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Swords, Calendar } from 'lucide-react'
import { CargarResultadoModal } from './cargar-resultado-modal'
import { BotonVerificarPartido } from './boton-verificar-partido'
import { BotonWhatsAppPartido } from './whatsapp-botones'

export function FixtureView({ torneo, dbMatches }: { torneo: any, dbMatches: any[] }) {
  
  if (!dbMatches || dbMatches.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center bg-muted/10 border-dashed p-10 min-h-[400px]">
        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-bold">Sin partidos</h3>
        <p className="text-muted-foreground mt-2 text-sm text-center max-w-sm">
          Aún no se han generado los partidos para este torneo.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
      {dbMatches.map((partido) => {
        const hasWinner = !!partido.winner_id;
        
        // Calcular la hora del partido si tiene cancha asignada
        let matchTimeStr = `Turno ${partido.turn_order + 1}`
        if (partido.court_id && torneo.schedule_config?.length > 0) {
          const sortedDays = [...torneo.schedule_config].sort((a, b) => a.date.localeCompare(b.date))
          let currentDayIdx = 0
          let currentDay = sortedDays[currentDayIdx]
          const parseTime = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number)
            return h * 60 + m
          }
          let currentTime = parseTime(currentDay.startTime)
          let endTime = parseTime(currentDay.lastMatchTime)
          
          for (let i = 0; i < partido.turn_order; i++) {
            currentTime += (torneo.match_duration_min || 90)
            if (currentTime > endTime) {
              currentDayIdx++
              if (currentDayIdx >= sortedDays.length) break
              currentDay = sortedDays[currentDayIdx]
              currentTime = parseTime(currentDay.startTime)
              endTime = parseTime(currentDay.lastMatchTime)
            }
          }
          
          if (currentDayIdx < sortedDays.length) {
            const h = Math.floor(currentTime / 60)
            const m = currentTime % 60
            const daysStr = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
            const dateObj = new Date(currentDay.date + 'T12:00:00Z')
            const dayName = daysStr[dateObj.getDay()] || ''
            matchTimeStr = `${dayName} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
          }
        }

        return (
          <Card key={partido.id} className={`shadow-sm border-l-4 ${hasWinner ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/20' : 'border-l-primary'}`}>
            <CardHeader className="py-2 px-3 bg-muted/20 border-b">
              <CardTitle className="text-xs font-bold flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span>{partido.round_name || 'Partido'}</span>
                  {partido.court_id && torneo.schedule_config?.length > 0 && (
                    <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1">
                      <span className="bg-primary/10 text-primary px-1 rounded-sm font-semibold">
                        {matchTimeStr}
                      </span>
                      • Cancha asignada
                    </span>
                  )}
                  {(!partido.court_id) && (
                    <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1">
                      <span className="bg-muted text-muted-foreground px-1 rounded-sm font-semibold">
                        Turno {partido.turn_order + 1}
                      </span>
                    </span>
                  )}
                </div>
                {hasWinner ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Swords className="h-3 w-3 text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-1.5">
              
              {/* Equipo 1 */}
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-sm flex items-center gap-2 ${hasWinner && partido.winner_id !== partido.team1?.id ? 'text-muted-foreground line-through' : ''}`}>
                  {partido.team1 ? `${partido.team1.player1?.last_name || 'TBD'} / ${partido.team1.player2?.last_name || 'TBD'}` : 'A definir'}
                </span>
                
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
                  {partido.team2 ? `${partido.team2.player1?.last_name || 'TBD'} / ${partido.team2.player2?.last_name || 'TBD'}` : 'A definir'}
                </span>

                {hasWinner && partido.sets_data && (
                  <div className="flex gap-2 text-sm">
                    {partido.sets_data.map((s: any, i: number) => (
                      <span key={i} className={`font-bold w-4 text-center ${s.t2 > s.t1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s.t2}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

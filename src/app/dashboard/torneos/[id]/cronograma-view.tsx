'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Swords, Calendar } from 'lucide-react'
import { CargarResultadoModal } from './cargar-resultado-modal'
import { BotonVerificarPartido } from './boton-verificar-partido'
import { BotonWhatsAppPartido } from './whatsapp-botones'

export function CronogramaView({ torneo, dbMatches, courts, fapConfig }: { torneo: any, dbMatches: any[], courts: any[], fapConfig?: any }) {
  
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

  // Precompute times for all matches
  const matchesWithTime = dbMatches.map((partido) => {
    let matchTimeStr = `Turno ${partido.turn_order + 1}`
    let timeValue = partido.turn_order // For sorting
    let dayNameStr = ''
    
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
        dayNameStr = daysStr[dateObj.getDay()] || ''
        matchTimeStr = `${dayNameStr} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        timeValue = currentDayIdx * 10000 + currentTime
      }
    }
    
    // Resolve FAP Team names if missing
    let t1Name = partido.team1 ? `${partido.team1.player1?.last_name || 'TBD'} / ${partido.team1.player2?.last_name || 'TBD'}` : 'A definir'
    let t2Name = partido.team2 ? `${partido.team2.player1?.last_name || 'TBD'} / ${partido.team2.player2?.last_name || 'TBD'}` : 'A definir'
    let displayRound = partido.round_name || 'Partido'
    let isFap = false

    if (partido.round_name?.startsWith('FAP_') && fapConfig) {
      isFap = true
      const matchId = parseInt(partido.round_name.replace('FAP_', ''))
      displayRound = `Partido ${matchId}`
      const fapMatch = fapConfig.matches.find((m: any) => m.id === matchId)
      if (fapMatch) {
        if (fapMatch.isFinal) displayRound = 'Final'
        else displayRound = `Partido ${matchId}` // Puede personalizarse ms si se desea
        
        if (!partido.team1) {
           t1Name = fapMatch.team1.startsWith('W') 
             ? `Ganador Pdo. ${fapMatch.team1.replace('W', '')}`
             : `Clasificado ${fapMatch.team1}`
        }
        if (!partido.team2) {
           t2Name = fapMatch.team2.startsWith('W') 
             ? `Ganador Pdo. ${fapMatch.team2.replace('W', '')}`
             : `Clasificado ${fapMatch.team2}`
        }
      }
    }

    return {
      ...partido,
      matchTimeStr,
      timeValue,
      t1Name,
      t2Name,
      displayRound,
      isFap
    }
  })

  // Group by court
  const groupedMatches: Record<string, any[]> = {}
  const unassigned: any[] = []

  matchesWithTime.forEach(m => {
    if (m.court_id) {
      if (!groupedMatches[m.court_id]) groupedMatches[m.court_id] = []
      groupedMatches[m.court_id].push(m)
    } else {
      unassigned.push(m)
    }
  })

  // Sort each group by time
  Object.keys(groupedMatches).forEach(k => {
    groupedMatches[k].sort((a, b) => a.timeValue - b.timeValue)
  })
  unassigned.sort((a, b) => a.timeValue - b.timeValue)

  // Map court IDs to Names
  const courtNames: Record<string, string> = {}
  courts?.forEach(c => { courtNames[c.id] = c.name })

  return (
    <div className="flex flex-col gap-8 w-full p-2">
      {Object.keys(groupedMatches).length === 0 && unassigned.length === 0 && (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
          No hay partidos generados.
        </div>
      )}

      {/* Render each court */}
      {Object.keys(groupedMatches).map(courtId => (
        <div key={courtId} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2">
            <h3 className="text-lg font-black text-primary uppercase tracking-wide flex items-center gap-2">
              Cancha: {courtNames[courtId] || 'Desconocida'}
            </h3>
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {groupedMatches[courtId].length} partidos
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {groupedMatches[courtId].map(partido => (
              <MatchRow key={partido.id} partido={partido} torneo={torneo} />
            ))}
          </div>
        </div>
      ))}

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-2 border-b-2 border-amber-200 dark:border-amber-900/50 pb-2">
            <h3 className="text-lg font-black text-amber-600 dark:text-amber-500 uppercase tracking-wide flex items-center gap-2">
              ⚠️ Sin Cancha Asignada
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
              {unassigned.length} partidos
            </span>
          </div>
          
          <div className="flex flex-col gap-3 opacity-90">
            {unassigned.map(partido => (
              <MatchRow key={partido.id} partido={partido} torneo={torneo} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchRow({ partido, torneo }: { partido: any, torneo: any }) {
  const hasWinner = !!partido.winner_id;
  
  return (
    <Card className={`shadow-sm border-l-4 transition-all hover:shadow-md ${hasWinner ? 'border-l-green-500 bg-green-50/20 dark:bg-green-950/10' : 'border-l-primary'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center p-3 gap-4">
        
        {/* Info lateral izquierda (Hora y Nombre) */}
        <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-1 sm:w-32 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">{partido.matchTimeStr}</span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${partido.isFap ? 'text-primary' : 'text-muted-foreground'}`}>
            {partido.displayRound}
          </span>
        </div>

        <div className="hidden sm:block w-px h-12 bg-border"></div>

        {/* Equipos */}
        <div className="flex-1 flex flex-col gap-2">
          {/* T1 */}
          <div className="flex justify-between items-center bg-card rounded px-2 py-1 border border-transparent hover:border-border">
            <span className={`font-semibold text-sm ${hasWinner && partido.winner_id !== partido.team1?.id ? 'text-muted-foreground line-through' : ''}`}>
              {partido.t1Name}
            </span>
            {hasWinner && partido.sets_data && (
              <div className="flex gap-2 text-sm font-bold ml-4">
                {partido.sets_data.map((s: any, i: number) => (
                  <span key={i} className={`w-5 text-center ${s.t1 > s.t2 ? 'text-foreground' : 'text-muted-foreground'}`}>{s.t1}</span>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-full h-px bg-border/50"></div>
          
          {/* T2 */}
          <div className="flex justify-between items-center bg-card rounded px-2 py-1 border border-transparent hover:border-border">
            <span className={`font-semibold text-sm ${hasWinner && partido.winner_id !== partido.team2?.id ? 'text-muted-foreground line-through' : ''}`}>
              {partido.t2Name}
            </span>
            {hasWinner && partido.sets_data && (
              <div className="flex gap-2 text-sm font-bold ml-4">
                {partido.sets_data.map((s: any, i: number) => (
                  <span key={i} className={`w-5 text-center ${s.t2 > s.t1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s.t2}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden sm:block w-px h-12 bg-border"></div>

        {/* Botones / Estado */}
        <div className="flex flex-wrap sm:flex-col justify-end gap-2 shrink-0 sm:w-32">
          {partido.team1 && partido.team2 ? (
            <>
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
                  roundName={partido.displayRound}
                  winner={partido.winner_id === partido.team1.id ? partido.team1 : partido.team2}
                  loser={partido.winner_id === partido.team1.id ? partido.team2 : partido.team1}
                  isVerified={partido.is_verified}
                  setsData={partido.sets_data}
                />
              )}
              {!hasWinner && (
                <BotonWhatsAppPartido 
                  torneoName={torneo.name}
                  roundName={partido.displayRound}
                  team1={partido.team1}
                  team2={partido.team2}
                />
              )}
            </>
          ) : (
             <div className="text-center w-full bg-muted/50 py-2 rounded border border-dashed">
               <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-center gap-1">
                 <Swords className="h-3 w-3" />
                 Espera rivales
               </span>
             </div>
          )}
        </div>

      </div>
    </Card>
  )
}

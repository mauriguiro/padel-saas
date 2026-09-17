'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, CheckCircle2, Swords, Printer } from 'lucide-react'
import { CargarResultadoModal } from './cargar-resultado-modal'
import { BotonVerificarPartido } from './boton-verificar-partido'
import { BotonWhatsAppPartido } from './whatsapp-botones'
import { FapConfig } from '@/lib/fap-rules'

function MatchCard({ partido, torneo, fapMatch }: { partido: any, torneo: any, fapMatch: any }) {
  if (!partido) {
    return (
      <Card className="w-72 shadow-sm border-dashed bg-muted/10 opacity-70">
        <CardHeader className="py-2 px-3 border-b">
          <CardTitle className="text-xs font-bold text-center text-muted-foreground">
            {fapMatch.isFinal ? 'Final' : `Partido ${fapMatch.id}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Pendiente de clasificación
        </CardContent>
      </Card>
    )
  }

  const hasWinner = !!partido.winner_id;
  
  return (
    <Card className={`w-72 shadow-sm border-l-4 print:border border print:border-gray-300 print:shadow-none ${hasWinner ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/20' : 'border-l-primary'}`}>
      <CardHeader className="py-2 px-3 bg-muted/20 print:bg-gray-100 border-b">
        <CardTitle className="text-xs font-bold flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span>{partido.round_name}</span>
            {partido.court_id && torneo.schedule_config?.length > 0 && (
              <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1">
                <span className="bg-primary/10 text-primary px-1 rounded-sm font-semibold">
                  Turno {partido.turn_order + 1}
                </span>
                • Cancha asignada
              </span>
            )}
          </div>
          {hasWinner ? <CheckCircle2 className="h-3 w-3 text-green-600 print:text-black" /> : <Swords className="h-3 w-3 text-muted-foreground print:text-black" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex flex-col gap-1.5 print:bg-white print:border-none">
        
        {/* Equipo 1 */}
        <div className="flex justify-between items-center">
          <span className={`font-semibold text-sm flex items-center gap-2 ${hasWinner && partido.winner_id !== partido.team1?.id ? 'text-muted-foreground line-through print:text-gray-400' : 'print:text-black'}`}>
            {partido.team1 ? `${partido.team1.player1?.last_name || 'TBD'} / ${partido.team1.player2?.last_name || 'TBD'}` : '---'}
            {hasWinner && partido.winner_id === partido.team1?.id && <Check className="h-3 w-3 text-green-600 print:hidden" />}
          </span>
          
          {hasWinner && partido.sets_data && (
            <div className="flex gap-2 text-sm">
              {partido.sets_data.map((s: any, i: number) => (
                <span key={i} className={`font-bold w-4 text-center ${s.t1 > s.t2 ? 'text-foreground print:text-black' : 'text-muted-foreground print:text-gray-500'}`}>{s.t1}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-full h-px bg-border print:bg-gray-300 my-0.5"></div>
        
        {/* Equipo 2 */}
        <div className="flex justify-between items-center">
          <span className={`font-semibold text-sm flex items-center gap-2 ${hasWinner && partido.winner_id !== partido.team2?.id ? 'text-muted-foreground line-through print:text-gray-400' : 'print:text-black'}`}>
            {partido.team2 ? `${partido.team2.player1?.last_name || 'TBD'} / ${partido.team2.player2?.last_name || 'TBD'}` : 'Pasa Directo (BYE)'}
            {hasWinner && partido.winner_id === partido.team2?.id && <Check className="h-3 w-3 text-green-600 print:hidden" />}
          </span>

          {hasWinner && partido.sets_data && (
            <div className="flex gap-2 text-sm">
              {partido.sets_data.map((s: any, i: number) => (
                <span key={i} className={`font-bold w-4 text-center ${s.t2 > s.t1 ? 'text-foreground print:text-black' : 'text-muted-foreground print:text-gray-500'}`}>{s.t2}</span>
              ))}
            </div>
          )}
        </div>

        {/* Botones (ocultos en impresión) */}
        {partido.team1 && partido.team2 && (
          <div className="flex gap-2 w-full mt-1.5 print:hidden">
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
}

function BracketNode({ matchId, fapConfig, dbMatches, torneo }: any) {
  const fapMatch = fapConfig.matches.find((m: any) => m.id === matchId)
  if (!fapMatch) return null

  const dbMatch = dbMatches.find((m: any) => m.round_name === `FAP_${matchId}`)
  
  const isW1 = fapMatch.team1.startsWith('W')
  const isW2 = fapMatch.team2.startsWith('W')
  const child1Id = isW1 ? parseInt(fapMatch.team1.substring(1)) : null
  const child2Id = isW2 ? parseInt(fapMatch.team2.substring(1)) : null

  return (
    <div className="flex items-center gap-0 relative">
      
      {/* Columna Izquierda: Los hijos */}
      <div className="flex flex-col justify-center gap-8 py-4">
        
        {/* Child 1 */}
        <div className="flex items-center relative">
          {child1Id ? (
            <BracketNode matchId={child1Id} fapConfig={fapConfig} dbMatches={dbMatches} torneo={torneo} />
          ) : (
            <div className="w-64 bg-muted/30 border border-dashed rounded-lg p-3 text-center shrink-0 print:border-gray-400 print:text-black">
              <span className="text-xs font-bold text-muted-foreground print:text-black uppercase tracking-wider">De Zonas: {fapMatch.team1}</span>
            </div>
          )}
          {/* Conector Horizontal T */}
          <div className="w-8 border-b-2 border-border print:border-gray-400"></div>
          {/* Conector Vertical Abajo */}
          <div className="absolute right-0 top-1/2 bottom-[-1rem] w-px bg-border print:bg-gray-400" style={{ transform: 'translateX(100%)' }}></div>
        </div>

        {/* Child 2 */}
        <div className="flex items-center relative">
          {child2Id ? (
            <BracketNode matchId={child2Id} fapConfig={fapConfig} dbMatches={dbMatches} torneo={torneo} />
          ) : (
            <div className="w-64 bg-muted/30 border border-dashed rounded-lg p-3 text-center shrink-0 print:border-gray-400 print:text-black">
              <span className="text-xs font-bold text-muted-foreground print:text-black uppercase tracking-wider">De Zonas: {fapMatch.team2}</span>
            </div>
          )}
          {/* Conector Horizontal T */}
          <div className="w-8 border-b-2 border-border print:border-gray-400"></div>
          {/* Conector Vertical Arriba */}
          <div className="absolute right-0 bottom-1/2 top-[-1rem] w-px bg-border print:bg-gray-400" style={{ transform: 'translateX(100%)' }}></div>
        </div>
      </div>

      <div className="w-8 border-b-2 border-border print:border-gray-400 shrink-0 relative z-10 bg-background print:bg-white"></div>

      {/* Nodo Actual */}
      <div className="shrink-0 z-20 relative bg-background print:bg-white rounded-xl">
        <MatchCard partido={dbMatch} torneo={torneo} fapMatch={fapMatch} />
      </div>

    </div>
  )
}

export function TournamentBracket({ torneo, dbMatches, fapConfig }: { torneo: any, dbMatches: any[], fapConfig: FapConfig }) {
  const finalMatch = fapConfig.matches.find(m => m.isFinal)
  
  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <h3 className="text-xl font-bold">Cuadro Eliminatorio (Playoffs)</h3>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 shadow-md transition-transform hover:-translate-y-0.5 text-sm font-bold"
        >
          <Printer className="h-4 w-4" />
          Exportar PDF / Imprimir
        </button>
      </div>

      <div className="overflow-x-auto pb-8 print:overflow-visible scrollbar-thin scrollbar-thumb-muted">
        <div className="min-w-max p-6 bg-muted/5 rounded-xl border border-dashed print:border-none print:bg-white print:p-0">
          {finalMatch ? (
            <BracketNode 
              matchId={finalMatch.id} 
              fapConfig={fapConfig} 
              dbMatches={dbMatches} 
              torneo={torneo} 
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Configuración de Playoffs no disponible para esta cantidad de inscriptos.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

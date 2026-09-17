'use client'

import React, { useState } from 'react'
import { Trophy, Calendar } from 'lucide-react'
import { PlanificadorCanchas } from './planificador'

export function TorneoTabs({ 
  torneo, 
  partidos, 
  courts,
  CronogramaView,
  InscriptosView,
  isReadOnly = false
}: { 
  torneo: any, 
  partidos: any[], 
  courts: any[],
  CronogramaView: React.ReactNode,
  InscriptosView: React.ReactNode,
  isReadOnly?: boolean
}) {
  // If tournament is open, default to inscriptos. Otherwise default to cronograma.
  const [activeTab, setActiveTab] = useState<'inscriptos' | 'cronograma' | 'planificador'>(torneo.status === 'OPEN' ? 'inscriptos' : 'cronograma')

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-4">
        
        <div className="flex bg-muted/50 p-1 rounded-md border overflow-x-auto no-scrollbar max-w-full">
          <button 
            onClick={() => setActiveTab('inscriptos')}
            className={`px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'inscriptos' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Inscriptos y Pagos
          </button>
          {torneo.status !== 'OPEN' && (
            <>
              <button 
                onClick={() => setActiveTab('cronograma')}
                className={`px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'cronograma' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Cronograma de Partidos
              </button>
              <button 
                onClick={() => setActiveTab('planificador')}
                className={`px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'planificador' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Planificador de Canchas
              </button>
            </>
          )}
        </div>
      </div>
      
      {activeTab === 'inscriptos' && InscriptosView}
      {activeTab === 'cronograma' && CronogramaView}
      {activeTab === 'planificador' && (
        <PlanificadorCanchas 
          initialMatches={partidos || []} 
          courts={courts || []} 
          tournamentId={torneo.id}
          isReadOnly={isReadOnly}
          scheduleConfig={torneo.schedule_config}
          matchDuration={torneo.match_duration_min}
        />
      )}
    </div>
  )
}

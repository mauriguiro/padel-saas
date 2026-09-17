'use client'

import React, { useState } from 'react'
import { Trophy, Calendar } from 'lucide-react'
import { PlanificadorCanchas } from './planificador'

export function TorneoTabs({ 
  torneo, 
  partidos, 
  courts,
  FixtureView,
  InscriptosView,
  isReadOnly = false
}: { 
  torneo: any, 
  partidos: any[], 
  courts: any[],
  FixtureView: React.ReactNode,
  InscriptosView: React.ReactNode,
  isReadOnly?: boolean
}) {
  // If tournament is open, default to inscriptos. Otherwise default to fixture.
  const [activeTab, setActiveTab] = useState<'inscriptos' | 'fixture' | 'planificador'>(torneo.status === 'OPEN' ? 'inscriptos' : 'fixture')

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
          <button 
            onClick={() => setActiveTab('fixture')}
            className={`px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'fixture' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            El Cuadro
          </button>
          {torneo.status !== 'OPEN' && (
            <button 
              onClick={() => setActiveTab('planificador')}
              className={`px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'planificador' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Planificador de Canchas
            </button>
          )}
        </div>
      </div>
      
      {activeTab === 'inscriptos' && InscriptosView}
      {activeTab === 'fixture' && FixtureView}
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

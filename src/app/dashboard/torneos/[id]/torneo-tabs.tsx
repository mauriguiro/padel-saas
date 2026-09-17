'use client'

import React, { useState } from 'react'
import { Trophy, Calendar } from 'lucide-react'
import { PlanificadorCanchas } from './planificador'

export function TorneoTabs({ 
  torneo, 
  partidos, 
  courts,
  FixtureView,
  isReadOnly = false
}: { 
  torneo: any, 
  partidos: any[], 
  courts: any[],
  FixtureView: React.ReactNode,
  isReadOnly?: boolean
}) {
  const [activeTab, setActiveTab] = useState<'fixture' | 'planificador'>('fixture')

  return (
    <div className="lg:col-span-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {activeTab === 'fixture' ? (
            <><Trophy className="h-5 w-5 text-primary" /> Cuadro de Partidos</>
          ) : (
            <><Calendar className="h-5 w-5 text-primary" /> Planificador de Canchas</>
          )}
        </h2>
        
        {torneo.status !== 'OPEN' && (
          <div className="flex bg-muted/50 p-1 rounded-md border">
            <button 
              onClick={() => setActiveTab('fixture')}
              className={`px-3 py-1.5 text-sm rounded-sm font-medium transition-colors ${activeTab === 'fixture' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Resultados
            </button>
            <button 
              onClick={() => setActiveTab('planificador')}
              className={`px-3 py-1.5 text-sm rounded-sm font-medium transition-colors ${activeTab === 'planificador' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Planificador
            </button>
          </div>
        )}
      </div>
      
      {activeTab === 'fixture' ? (
        FixtureView
      ) : (
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

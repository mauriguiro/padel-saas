'use client'

import React, { useState } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { 
  SortableContext, 
  arrayMove, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { SortableMatchCard } from './sortable-match-card'
import { CourtColumn } from './court-column'
import { updateMatchPosition } from './actions'

type Court = { id: string, name: string }
type Match = { 
  id: string, 
  court_id: string | null, 
  turn_order: number, 
  round_name: string,
  team1: any,
  team2: any
}

export function PlanificadorCanchas({ 
  initialMatches, 
  courts,
  tournamentId,
  isReadOnly = false,
  scheduleConfig = [],
  matchDuration = 90
}: { 
  initialMatches: Match[], 
  courts: Court[],
  tournamentId: string,
  isReadOnly?: boolean,
  scheduleConfig?: any[],
  matchDuration?: number
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (isReadOnly) return;
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isReadOnly) return;
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeMatchId = active.id as string
    const overId = over.id as string

    // Find the court we dropped into (if dropped on empty column, over.id is the court_id)
    // If dropped on another match, over.id is that match's id
    let targetCourtId: string | null = null
    const overMatch = matches.find(m => m.id === overId)
    
    if (overMatch) {
      targetCourtId = overMatch.court_id
    } else if (courts.some(c => c.id === overId)) {
      targetCourtId = overId
    } else if (overId === 'unassigned') {
      targetCourtId = null
    } else {
      return
    }

    const activeMatch = matches.find(m => m.id === activeMatchId)
    if (!activeMatch) return

    let newMatches = [...matches]

    // Mover dentro de la misma columna
    if (activeMatch.court_id === targetCourtId && overMatch) {
      const activeIndex = matches.findIndex(m => m.id === activeMatchId)
      const overIndex = matches.findIndex(m => m.id === overId)
      
      newMatches = arrayMove(matches, activeIndex, overIndex)
      
      // Actualizar turn_order
      const courtMatches = newMatches.filter(m => m.court_id === targetCourtId)
      courtMatches.forEach((m, idx) => m.turn_order = idx)
      
    } else {
      // Mover a otra columna
      const activeIndex = matches.findIndex(m => m.id === activeMatchId)
      newMatches[activeIndex].court_id = targetCourtId
      
      // Si soltó sobre otro partido, insertar ahí. Si soltó en la columna vacía, ir al final
      const oldCourtMatches = newMatches.filter(m => m.court_id === activeMatch.court_id && m.id !== activeMatchId)
      oldCourtMatches.forEach((m, idx) => m.turn_order = idx)

      const targetCourtMatches = newMatches.filter(m => m.court_id === targetCourtId && m.id !== activeMatchId)
      
      if (overMatch) {
        const overIndexInTarget = targetCourtMatches.findIndex(m => m.id === overId)
        targetCourtMatches.splice(overIndexInTarget, 0, newMatches[activeIndex])
      } else {
        targetCourtMatches.push(newMatches[activeIndex])
      }

      targetCourtMatches.forEach((m, idx) => m.turn_order = idx)
    }

    setMatches(newMatches)

    // Guardar en backend (silencioso)
    const matchToUpdate = newMatches.find(m => m.id === activeMatchId)
    if (matchToUpdate) {
      await updateMatchPosition(matchToUpdate.id, matchToUpdate.court_id, matchToUpdate.turn_order, tournamentId)
    }
  }

  const unassignedMatches = matches.filter(m => m.court_id === null).sort((a,b) => a.turn_order - b.turn_order)

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-8 h-[70vh]">
        
        {/* Columna: Sin Asignar */}
        <CourtColumn 
          id="unassigned" 
          title="Partidos Pendientes" 
          isUnassigned={true}
          isReadOnly={isReadOnly}
          matches={matches.filter(m => m.court_id === null).sort((a,b) => a.turn_order - b.turn_order)}
          scheduleConfig={scheduleConfig}
          matchDuration={matchDuration}
        />

        {/* Columnas de Canchas */}
        {courts.map(court => (
          <CourtColumn 
            key={court.id} 
            id={court.id} 
            title={court.name}
            isReadOnly={isReadOnly}
            matches={matches.filter(m => m.court_id === court.id).sort((a,b) => a.turn_order - b.turn_order)}
            scheduleConfig={scheduleConfig}
            matchDuration={matchDuration}
          />
        ))}

      </div>
      
      {!isReadOnly && (
        <DragOverlay>
          {activeId ? (
            <SortableMatchCard 
              match={matches.find(m => m.id === activeId)!} 
              isOverlay 
              scheduleConfig={scheduleConfig}
              matchDuration={matchDuration}
            />
          ) : null}
        </DragOverlay>
      )}
    </DndContext>
  )
}

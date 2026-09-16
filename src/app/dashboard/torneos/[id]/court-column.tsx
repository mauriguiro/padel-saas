'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableMatchCard } from './sortable-match-card'

export function CourtColumn({ 
  id, 
  title, 
  matches,
  isUnassigned 
}: { 
  id: string, 
  title: string, 
  matches: any[],
  isUnassigned?: boolean,
  isReadOnly?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div 
      className={`flex flex-col min-w-[280px] max-w-[280px] rounded-lg border bg-muted/30 shadow-sm ${
        isUnassigned ? 'border-dashed border-2' : ''
      } ${isOver ? 'ring-2 ring-primary bg-primary/5' : ''}`}
    >
      <div className={`p-3 border-b font-semibold text-sm ${isUnassigned ? 'bg-muted/50' : 'bg-card text-center'}`}>
        {title} ({matches.length})
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-2 flex flex-col gap-2 min-h-[150px] overflow-y-auto"
      >
        <SortableContext 
          items={matches.map(m => m.id)} 
          strategy={verticalListSortingStrategy}
        >
          {matches.map(match => (
            <SortableMatchCard key={match.id} match={match} disabled={isReadOnly} />
          ))}
        </SortableContext>
        
        {matches.length === 0 && (
          <div className="text-center text-xs text-muted-foreground p-4 border border-dashed rounded-md m-2 opacity-50">
            Arrastra partidos aquí
          </div>
        )}
      </div>
    </div>
  )
}

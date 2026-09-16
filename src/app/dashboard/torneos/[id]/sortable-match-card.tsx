'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function SortableMatchCard({ match, isOverlay }: { match: any, isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: match.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  // Si es un overlay (cuando se arrastra), no queremos la opacidad en 0.4
  const finalStyle = isOverlay ? {
    ...style,
    opacity: 1,
    transform: undefined,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  } : style

  return (
    <div
      ref={setNodeRef}
      style={finalStyle}
      {...attributes}
      {...listeners}
      className={`bg-card p-3 rounded-md border shadow-sm cursor-grab active:cursor-grabbing text-sm flex flex-col gap-2
        ${isOverlay ? 'scale-105 rotate-2 z-50 ring-2 ring-primary' : ''}
      `}
    >
      <div className="flex justify-between items-center text-xs text-muted-foreground border-b pb-1">
        <span className="font-semibold">{match.round_name || 'Partido'}</span>
        <span>Turno {match.turn_order + 1}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="truncate">{match.team1?.player1?.last_name} / {match.team1?.player2?.last_name}</span>
        <span className="text-muted-foreground text-xs text-center">vs</span>
        <span className="truncate">{match.team2?.player1?.last_name} / {match.team2?.player2?.last_name}</span>
      </div>
    </div>
  )
}

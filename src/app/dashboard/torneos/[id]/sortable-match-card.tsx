'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function SortableMatchCard({ 
  match, 
  isOverlay,
  disabled,
  scheduleConfig = [],
  matchDuration = 90
}: { 
  match: any, 
  isOverlay?: boolean,
  disabled?: boolean,
  scheduleConfig?: any[],
  matchDuration?: number
}) {
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

  // Calcular la hora del partido
  let matchTimeStr = `Turno ${match.turn_order + 1}`
  if (match.court_id && scheduleConfig.length > 0) {
    const sortedDays = [...scheduleConfig].sort((a, b) => a.date.localeCompare(b.date))
    let currentDayIdx = 0
    let currentDay = sortedDays[currentDayIdx]
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number)
      return h * 60 + m
    }
    let currentTime = parseTime(currentDay.startTime)
    let endTime = parseTime(currentDay.lastMatchTime)
    
    for (let i = 0; i < match.turn_order; i++) {
      currentTime += matchDuration
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
    <div
      ref={setNodeRef}
      style={finalStyle}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      className={`bg-card p-3 rounded-md border shadow-sm text-sm flex flex-col gap-2
        ${!disabled ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isOverlay ? 'scale-105 rotate-2 z-50 ring-2 ring-primary' : ''}
      `}
    >
      <div className="flex justify-between items-center text-xs text-muted-foreground border-b pb-1">
        <span className="font-semibold">{match.round_name || 'Partido'}</span>
        <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded-sm">{matchTimeStr}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="truncate">{match.team1?.player1?.last_name} / {match.team1?.player2?.last_name}</span>
        <span className="text-muted-foreground text-xs text-center">vs</span>
        <span className="truncate">{match.team2?.player1?.last_name} / {match.team2?.player2?.last_name}</span>
      </div>
    </div>
  )
}

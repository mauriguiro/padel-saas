'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock } from 'lucide-react'

type DayConfig = {
  date: string
  dateLabel: string
  startTime: string
  lastMatchTime: string
}

export type AvailabilityStatus = 'TODO_EL_DIA' | 'NO_PUEDE' | 'RANGO'

export type TeamDayAvailability = {
  date: string
  status: AvailabilityStatus
  startTime?: string
  endTime?: string
}

export function TeamAvailabilityConfig({ 
  scheduleConfig = [], 
  initialAvailability = [] 
}: { 
  scheduleConfig: DayConfig[]
  initialAvailability?: TeamDayAvailability[]
}) {
  const [availability, setAvailability] = useState<TeamDayAvailability[]>([])

  useEffect(() => {
    // Inicializar disponibilidad para cada día del torneo
    const initial = scheduleConfig.map(day => {
      const existing = initialAvailability.find(a => a.date === day.date)
      if (existing) {
        // Migración de datos antiguos si existen
        let status = existing.status as string;
        if (status === 'ALL_DAY') status = 'TODO_EL_DIA';
        if (status === 'RANGE') status = 'RANGO';
        if (status === 'UNAVAILABLE') status = 'NO_PUEDE';
        return { ...existing, status: status as AvailabilityStatus };
      }
      
      return {
        date: day.date,
        status: 'TODO_EL_DIA' as AvailabilityStatus,
        startTime: day.startTime,
        endTime: day.lastMatchTime
      }
    })
    setAvailability(initial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleConfig])

  const handleStatusChange = (date: string, status: AvailabilityStatus) => {
    setAvailability(prev => prev.map(a => {
      if (a.date !== date) return a
      
      const dayConf = scheduleConfig.find(d => d.date === date)
      return {
        ...a,
        status,
        // Reset times if they switch back to range or all day
        startTime: status === 'RANGO' ? (a.startTime || dayConf?.startTime) : undefined,
        endTime: status === 'RANGO' ? (a.endTime || dayConf?.lastMatchTime) : undefined
      }
    }))
  }

  const handleTimeChange = (date: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => prev.map(a => a.date === date ? { ...a, [field]: value } : a))
  }

  if (!scheduleConfig || scheduleConfig.length === 0) {
    return (
      <div className="p-3 border border-dashed rounded-md text-xs text-muted-foreground bg-muted/20">
        El cronograma del torneo no está configurado. No se pueden definir restricciones horarias.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="availability" value={JSON.stringify(availability)} />
      
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Label className="font-semibold text-foreground">Disponibilidad en Fase de Grupos</Label>
      </div>

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
        {scheduleConfig.map((day) => {
          const dayAv = availability.find(a => a.date === day.date)
          if (!dayAv) return null

          return (
            <div key={day.date} className="flex flex-col gap-2 p-3 border rounded-lg bg-background shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground whitespace-nowrap">{day.dateLabel}</span>
                <Select 
                  value={dayAv.status} 
                  onValueChange={(val: string) => handleStatusChange(day.date, val as AvailabilityStatus)}
                >
                  <SelectTrigger className="h-8 w-full sm:w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO_EL_DIA">Todo el día</SelectItem>
                    <SelectItem value="RANGO">En cierto horario...</SelectItem>
                    <SelectItem value="NO_PUEDE">No puede jugar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dayAv.status === 'RANGO' && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label className="text-[10px] text-muted-foreground">Desde</Label>
                    <Input 
                      type="time" 
                      value={dayAv.startTime || ''}
                      onChange={e => handleTimeChange(day.date, 'startTime', e.target.value)}
                      className="h-8 text-xs"
                      min={day.startTime}
                      max={day.lastMatchTime}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label className="text-[10px] text-muted-foreground">Hasta</Label>
                    <Input 
                      type="time" 
                      value={dayAv.endTime || ''}
                      onChange={e => handleTimeChange(day.date, 'endTime', e.target.value)}
                      className="h-8 text-xs"
                      min={day.startTime}
                      max={day.lastMatchTime}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

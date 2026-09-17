'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, MapPin, CalendarDays } from 'lucide-react'

type Court = {
  id: string
  name: string
}

type DayConfig = {
  date: string
  dateLabel: string
  startTime: string
  lastMatchTime: string
}

export function ScheduleConfig({ courts }: { courts: Court[] }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState('90')
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  
  const [days, setDays] = useState<DayConfig[]>([])

  // Format date to YYYY-MM-DD reliably
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const formatDayName = (date: Date) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return `${dias[date.getDay()]} ${date.getDate()}`
  }

  // Effect to generate days when dates change
  useEffect(() => {
    if (!startDate || !endDate) {
      setDays([])
      return
    }

    const startParts = startDate.split('-').map(Number)
    const endParts = endDate.split('-').map(Number)
    
    let dt = new Date(startParts[0], startParts[1] - 1, startParts[2])
    const endDt = new Date(endParts[0], endParts[1] - 1, endParts[2])

    // Prevent infinite loop if end < start
    if (endDt < dt) {
      setDays([])
      return
    }

    // Limit to max 14 days to prevent UI overload
    const newDays: DayConfig[] = []
    let i = 0
    while (dt <= endDt && i < 14) {
      const dStr = formatDate(dt)
      
      // Keep existing times if they were already set for this date
      const existingDay = days.find(d => d.date === dStr)
      
      newDays.push({
        date: dStr,
        dateLabel: formatDayName(dt),
        startTime: existingDay?.startTime || '09:00',
        lastMatchTime: existingDay?.lastMatchTime || '23:00'
      })
      
      dt.setDate(dt.getDate() + 1)
      i++
    }
    setDays(newDays)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const handleDayTimeChange = (index: number, field: 'startTime' | 'lastMatchTime', value: string) => {
    const newDays = [...days]
    newDays[index][field] = value
    setDays(newDays)
  }

  const toggleCourt = (courtId: string) => {
    if (selectedCourts.includes(courtId)) {
      setSelectedCourts(selectedCourts.filter(id => id !== courtId))
    } else {
      setSelectedCourts([...selectedCourts, courtId])
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Hidden inputs to pass data to server action */}
      <input type="hidden" name="start_date" value={startDate} />
      <input type="hidden" name="end_date" value={endDate} />
      <input type="hidden" name="match_duration_minutes" value={duration} />
      <input type="hidden" name="available_courts" value={JSON.stringify(selectedCourts)} />
      <input type="hidden" name="schedule_config" value={JSON.stringify(days)} />

      {/* Dates & Duration Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Fechas y Duración
          </CardTitle>
          <CardDescription>Define la fecha de inicio, fin y cuánto duran los turnos.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 grid gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ui_start" className="text-sm font-semibold text-muted-foreground">Fecha de Inicio</Label>
              <Input 
                id="ui_start"
                type="date" 
                required 
                className="h-10" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ui_end" className="text-sm font-semibold text-muted-foreground">Fecha de Fin</Label>
              <Input 
                id="ui_end"
                type="date" 
                required 
                className="h-10" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ui_dur" className="text-sm font-semibold text-muted-foreground">Minutos por Partido</Label>
              <Input 
                id="ui_dur"
                type="number" 
                required 
                className="h-10" 
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Ej: 90 minutos para calcular horarios.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Schedule Card */}
      {days.length > 0 && (
        <Card className="shadow-sm border-primary/20 overflow-hidden">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Horarios por Día
            </CardTitle>
            <CardDescription>Indica a qué hora empieza la jornada y cuál es el tope horario para arrancar el último partido.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid gap-4 bg-muted/10">
            {days.map((day, idx) => (
              <div key={day.date} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-xl bg-background shadow-sm hover:border-primary/30 transition-colors">
                <div className="sm:w-32 font-bold text-sm text-foreground">
                  {day.dateLabel}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Horario de Comienzo</Label>
                    <Input 
                      type="time" 
                      required 
                      className="h-9"
                      value={day.startTime}
                      onChange={e => handleDayTimeChange(idx, 'startTime', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Horario Último Partido</Label>
                    <Input 
                      type="time" 
                      required 
                      className="h-9"
                      value={day.lastMatchTime}
                      onChange={e => handleDayTimeChange(idx, 'lastMatchTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Courts Selection Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Canchas Disponibles
          </CardTitle>
          <CardDescription>Selecciona las pistas físicas que se utilizarán para este torneo.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {courts.length === 0 ? (
            <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground">
              No tienes canchas registradas en tu club. Ve a &quot;Canchas&quot; en el panel principal para agregarlas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {courts.map(court => (
                <label key={court.id} className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${selectedCourts.includes(court.id) ? 'border-primary bg-primary/5' : ''}`}>
                  <input 
                    type="checkbox"
                    checked={selectedCourts.includes(court.id)}
                    onChange={() => toggleCourt(court.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{court.name}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

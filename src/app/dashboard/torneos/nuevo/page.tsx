import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { ArrowLeft, Trophy, Calendar, Settings2, Users, Info, Medal } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ZonalSearch } from '@/components/zonal-search'
import { PriceInput } from '@/components/price-input'

import { ScheduleConfig } from './schedule-config'

export default async function NuevoTorneoPage() {
  const outerSupabase = createClient()
  const { data: { user } } = await outerSupabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: courts } = await outerSupabase
    .from('courts')
    .select('id, name')
    .eq('club_id', user.id)
    .order('name', { ascending: true })

  const crearTorneo = async (formData: FormData) => {
    'use server'
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const name = (formData.get('name') as string)?.toUpperCase() || ''
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const matchDurationMinutes = parseInt(formData.get('match_duration_minutes') as string) || 90
    
    // Parse arrays
    let availableCourts: string[] = []
    let scheduleConfig: any[] = []
    try {
      availableCourts = JSON.parse(formData.get('available_courts') as string || '[]')
      scheduleConfig = JSON.parse(formData.get('schedule_config') as string || '[]')
    } catch (e) {
      console.error(e)
    }

    const category = (formData.get('category') as string)?.toUpperCase() || ''
    const gender = formData.get('gender') as string || 'Masculino'
    const price = parseInt(formData.get('price') as string) || 0
    const registrationType = formData.get('registration_type') as string
    const tournamentFormat = formData.get('tournament_format') as string
    const scoringFormat = formData.get('scoring_format') as string
    const hasSeededTeams = formData.get('has_seeded_teams') === 'on'

    const isZonal = formData.get('is_zonal') === 'true'
    const coHostId = formData.get('co_host_id') as string | null

    const pointsWinner = parseInt(formData.get('points_winner') as string) || 100
    const pointsRunnerUp = parseInt(formData.get('points_runner_up') as string) || 90
    const pointsSemi = parseInt(formData.get('points_semi') as string) || 80
    const pointsQuarter = parseInt(formData.get('points_quarter') as string) || 60
    const pointsEighths = parseInt(formData.get('points_eighths') as string) || 40
    const pointsZone = parseInt(formData.get('points_zone') as string) || 10

    const { error } = await supabase.from('tournaments').insert({
      club_id: user.id,
      name,
      start_date: startDate,
      end_date: endDate,
      match_duration_minutes: matchDurationMinutes,
      available_courts: availableCourts,
      schedule_config: scheduleConfig,
      category,
      gender,
      price_per_player: price,
      registration_type: registrationType,
      tournament_format: tournamentFormat,
      scoring_format: scoringFormat,
      has_seeded_teams: hasSeededTeams,
      status: 'OPEN',
      is_zonal: isZonal,
      co_host_id: isZonal ? coHostId : null,
      zonal_status: isZonal && coHostId ? 'PENDING' : 'NONE',
      points_winner: pointsWinner,
      points_runner_up: pointsRunnerUp,
      points_semi: pointsSemi,
      points_quarter: pointsQuarter,
      points_eighths: pointsEighths,
      points_zone: pointsZone
    })

    if (error) {
      console.error(error)
      return redirect('/dashboard/torneos/nuevo?error=true')
    }

    redirect('/dashboard')
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-3 hover:bg-accent rounded-full transition-colors border shadow-sm bg-background">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="font-bold text-3xl text-foreground">Organizar Nuevo Torneo</h1>
          <p className="text-muted-foreground mt-1">Configura los parámetros para abrir las inscripciones.</p>
        </div>
      </div>

      <form action={crearTorneo} className="flex flex-col gap-5">
        
        {/* Tarjeta 1: Datos Principales */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Datos Principales
            </CardTitle>
            <CardDescription>Información pública que verán los jugadores.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground">Nombre del Torneo</Label>
                <Input name="name" required placeholder="Ej: Copa de Verano Padel Club" className="h-10 uppercase" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category" className="text-sm font-semibold text-muted-foreground">Categorías incluidas</Label>
                <Input 
                  id="category" 
                  name="category" 
                  list="categorias-torneo" 
                  placeholder="Ej. 5ta Caballeros" 
                  required 
                  className="h-10 uppercase"
                />
                <datalist id="categorias-torneo">
                  <option value="Principiantes" />
                  <option value="8va" />
                  <option value="7ma" />
                  <option value="6ta" />
                  <option value="5ta" />
                  <option value="4ta" />
                  <option value="3ra" />
                  <option value="2da" />
                  <option value="1ra" />
                  <option value="Suma 13" />
                  <option value="Suma 11" />
                  <option value="Suma 9" />
                  <option value="Libre" />
                </datalist>
                <p className="text-[11px] text-muted-foreground mt-0.5">Escribe libremente o elige una de la lista.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gender" className="text-sm font-semibold text-muted-foreground">Rama / Género</Label>
                <Select name="gender" defaultValue="Masculino">
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino (Caballeros)</SelectItem>
                    <SelectItem value="Femenino">Femenino (Damas)</SelectItem>
                    <SelectItem value="Mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price" className="text-sm font-semibold text-muted-foreground">Precio Inscripción (Por Pareja)</Label>
                <PriceInput />
                <p className="text-xs text-muted-foreground">
                  El sistema calculará automáticamente que cada jugador debe pagar la mitad.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ScheduleConfig courts={courts || []} />

        {/* Tarjeta 2: Reglas del Motor */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Formato y Reglas
            </CardTitle>
            <CardDescription>Estos ajustes definirán cómo el sistema sortea el cuadro matemáticamente.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid gap-5">
            
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registration_type" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Forma de Inscripción
              </Label>
              <Select name="registration_type" defaultValue="POR_PAREJAS">
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POR_PAREJAS">Por Pareja (Las parejas se anotan juntas)</SelectItem>
                  <SelectItem value="INDIVIDUAL">Individual (El sistema sortea las parejas al azar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tournament_format" className="text-sm font-semibold text-foreground">Formato del Torneo</Label>
              <Select name="tournament_format" defaultValue="ZONAS_Y_PLAYOFFS">
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZONAS_Y_PLAYOFFS">Zonas (Grupos) + Cuadro de Eliminación</SelectItem>
                  <SelectItem value="ELIMINACION_SIMPLE">Eliminación Simple (Pierde y sale directo)</SelectItem>
                  <SelectItem value="DOBLE_ELIMINACION">Doble Eliminación (Con Ronda de Perdedores)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scoring_format" className="text-sm font-semibold text-foreground">Formato de Partido</Label>
              <Select name="scoring_format" defaultValue="2_SETS_Y_SUPER_TIEBREAK">
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2_SETS_Y_SUPER_TIEBREAK">Al mejor de 2 Sets + Súper Tie Break a 10</SelectItem>
                  <SelectItem value="3_SETS">Al mejor de 3 Sets Completos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 p-4 border-2 border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 shadow-sm transition-all hover:border-amber-300">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐️</span>
                    <Label htmlFor="has_seeded_teams" className="text-base font-bold text-amber-900 dark:text-amber-500 cursor-pointer">
                      Permitir Cabezas de Serie
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    Activa esta opción para poder marcar a las parejas favoritas. El sistema armará el cuadro separándolas automáticamente para evitar que se eliminen en las primeras rondas.
                  </p>
                </div>
                <div className="pt-2 shrink-0">
                  <Switch id="has_seeded_teams" name="has_seeded_teams" value="on" className="data-[state=checked]:bg-amber-500" />
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
        {/* Tarjeta 3: Puntuación para Ranking */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Medal className="h-5 w-5 text-primary" />
              Puntos para el Ranking
            </CardTitle>
            <CardDescription>Establece cuántos puntos ganarán los jugadores al finalizar el torneo según la ronda que alcancen.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="points_winner" className="text-sm font-semibold text-muted-foreground">Campeones</Label>
                <Input name="points_winner" type="number" defaultValue={100} required className="h-10 text-center font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="points_runner_up" className="text-sm font-semibold text-muted-foreground">Subcampeones</Label>
                <Input name="points_runner_up" type="number" defaultValue={90} required className="h-10 text-center font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="points_semi" className="text-sm font-semibold text-muted-foreground">Semifinalistas</Label>
                <Input name="points_semi" type="number" defaultValue={80} required className="h-10 text-center font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="points_quarter" className="text-sm font-semibold text-muted-foreground">Cuartos de Final</Label>
                <Input name="points_quarter" type="number" defaultValue={60} required className="h-10 text-center font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="points_eighths" className="text-sm font-semibold text-muted-foreground">Octavos de Final</Label>
                <Input name="points_eighths" type="number" defaultValue={40} required className="h-10 text-center font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="points_zone" className="text-sm font-semibold text-muted-foreground">Fase de Grupos (Zonas)</Label>
                <Input name="points_zone" type="number" defaultValue={10} required className="h-10 text-center font-bold" />
              </div>
            </div>
            <p className="text-[11px] font-medium bg-primary/10 text-primary p-3 rounded-lg border border-primary/20 shadow-sm flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              * Estos puntos se repartirán automáticamente cuando presiones "Finalizar Torneo" en el panel de control.
            </p>
          </CardContent>
        </Card>

        {/* Buscador Zonal */}
        <ZonalSearch />

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 mt-2">
          <Link href="/dashboard" className="px-6 py-3 border border-input rounded-md hover:bg-accent font-medium transition-colors">
            Cancelar
          </Link>
          <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-bold shadow-md transition-all hover:-translate-y-0.5">
            Crear y Abrir Inscripciones
          </button>
        </div>

      </form>
    </div>
  )
}

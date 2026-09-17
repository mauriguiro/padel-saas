'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getFapBracket } from '@/lib/fap-rules'

export async function updateMatchPosition(matchId: string, courtId: string | null, turnOrder: number, tournamentId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('matches')
    .update({ 
      court_id: courtId,
      turn_order: turnOrder
    })
    .eq('id', matchId)
  
  if (error) {
    console.error(error)
    return { error: 'Error al actualizar posición' }
  }
  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

export async function toggleSeeded(teamId: string, isSeeded: boolean, tournamentId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tournament_teams')
    .update({ is_seeded: isSeeded })
    .eq('id', teamId)
  
  if (error) {
    console.error(error)
    return { error: 'Error al cambiar el estado de cabeza de serie' }
  }
  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

export async function actualizarPareja(teamId: string, tournamentId: string, data: { time_availability?: string, availability?: any }) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tournament_teams')
    .update({ 
      time_availability: data.time_availability,
      availability: data.availability
    })
    .eq('id', teamId)
  
  if (error) {
    console.error('Error al actualizar pareja:', error)
    return { error: 'Error al actualizar los datos de la pareja' }
  }
  
  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

export async function eliminarInscripcion(teamId: string, tournamentId: string) {
  const supabase = createClient()
  
  // Verificamos si el torneo no ha empezado
  const { data: torneo } = await supabase.from('tournaments').select('status').eq('id', tournamentId).single()
  
  if (torneo?.status !== 'OPEN') {
    throw new Error('No se pueden eliminar inscripciones de un torneo que ya comenzó.')
  }

  const { error } = await supabase.from('tournament_teams').delete().eq('id', teamId)
  
  if (error) {
    console.error('Error al eliminar inscripción:', error)
    throw new Error('Error interno al eliminar.')
  }

  revalidatePath(`/dashboard/torneos/${tournamentId}`)
}

export async function inscribirPareja(formData: FormData) {
  const supabase = createClient()
  
  const tournamentId = formData.get('tournament_id') as string
  const player1Id = formData.get('player1_id') as string
  const player2Id = formData.get('player2_id') as string
  const availabilityStr = formData.get('availability') as string
  let parsedAvailability = null
  try {
    if (availabilityStr) parsedAvailability = JSON.parse(availabilityStr)
  } catch (e) {}

  if (!tournamentId || !player1Id || !player2Id) {
    return { error: 'Faltan datos' }
  }

  if (player1Id === player2Id) {
    return { error: 'No puedes elegir al mismo jugador dos veces' }
  }

  // 1. Validar duplicados en el mismo torneo
  const { data: existingTeams } = await supabase
    .from('tournament_teams')
    .select('player1_id, player2_id')
    .eq('tournament_id', tournamentId)
  
  if (existingTeams) {
    for (const t of existingTeams) {
      if (t.player1_id === player1Id || t.player2_id === player1Id) {
        return { error: 'El Jugador 1 ya está inscripto en este torneo en otra pareja.' }
      }
      if (t.player1_id === player2Id || t.player2_id === player2Id) {
        return { error: 'El Jugador 2 ya está inscripto en este torneo en otra pareja.' }
      }
    }
  }

  // 2. Obtener los datos del torneo
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('category')
    .eq('id', tournamentId)
    .single()
  
  if (!tournament) return { error: 'Torneo no encontrado' }

  // 3. Obtener los jugadores
  const { data: p1 } = await supabase.from('players').select('category, gender, first_name').eq('id', player1Id).single()
  const { data: p2 } = await supabase.from('players').select('category, gender, first_name').eq('id', player2Id).single()

  if (!p1 || !p2) return { error: 'Jugadores no encontrados en la base de datos.' }

  const tCat = tournament.category.toUpperCase()

  // 4. Validar Género (Sexo)
  if (tCat.includes('CABALLERO') || tCat.includes('MASCULINO')) {
    if (p1.gender !== 'Masculino') return { error: `${p1.first_name} no tiene perfil Masculino.` }
    if (p2.gender !== 'Masculino') return { error: `${p2.first_name} no tiene perfil Masculino.` }
  } else if (tCat.includes('DAMA') || tCat.includes('FEMENINO')) {
    if (p1.gender !== 'Femenino') return { error: `${p1.first_name} no tiene perfil Femenino.` }
    if (p2.gender !== 'Femenino') return { error: `${p2.first_name} no tiene perfil Femenino.` }
  } else if (tCat.includes('MIXTO')) {
    const genders = [p1.gender, p2.gender]
    if (!genders.includes('Masculino') || !genders.includes('Femenino')) {
      return { error: 'Los torneos mixtos requieren estrictamente un hombre y una mujer.' }
    }
  }

  // Función auxiliar para extraer el nivel numérico de la categoría (ej: "6TA" -> 6)
  const getCatNum = (cat: string) => {
    const match = cat.match(/(\d)/)
    if (match) return parseInt(match[1])
    if (cat.toUpperCase().includes('PRINCIPIANTE')) return 9
    return 0 // Desconocido (no validamos)
  }

  const p1Num = getCatNum(p1.category || '')
  const p2Num = getCatNum(p2.category || '')

  // 5. Validar Categoría y "Sumas"
  if (tCat.includes('SUMA')) {
    const sumMatch = tCat.match(/SUMA\s*(\d+)/)
    if (sumMatch && p1Num > 0 && p2Num > 0) {
      const targetSum = parseInt(sumMatch[1])
      const realSum = p1Num + p2Num
      if (realSum < targetSum) {
        return { error: `La pareja suma ${realSum} (${p1Num} + ${p2Num}). La suma de las categorías debe dar ${targetSum} o más.` }
      }
    }
  } else {
    // Categoría regular, ej: "6TA CABALLEROS"
    const tNum = getCatNum(tCat)
    if (tNum > 0) {
      // Si el número del jugador es MENOR que el del torneo, juega mejor. (Ej: 5ta < 6ta)
      if (p1Num > 0 && p1Num < tNum) {
        return { error: `${p1.first_name} es de ${p1.category}, no puede jugar en un torneo de ${tCat}.` }
      }
      if (p2Num > 0 && p2Num < tNum) {
        return { error: `${p2.first_name} es de ${p2.category}, no puede jugar en un torneo de ${tCat}.` }
      }
    }
  }

  const { error } = await supabase
    .from('tournament_teams')
    .insert({
      tournament_id: tournamentId,
      player1_id: player1Id,
      player2_id: player2Id,
      availability: parsedAvailability
    })

  if (error) {
    console.error(error)
    return { error: 'Error al inscribir la pareja' }
  }

  // Refresca la página en tiempo real
  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  
  return { success: true }
}

export async function generarFixture(formData: FormData) {
  const supabase = createClient()
  const tournamentId = formData.get('tournament_id') as string

  if (!tournamentId) return { error: 'ID de torneo no válido' }

  // Obtener formato de torneo
  const { data: tournament } = await supabase.from('tournaments').select('tournament_format').eq('id', tournamentId).single()

  // 1. Obtener los equipos inscriptos
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('id, is_seeded')
    .eq('tournament_id', tournamentId)

  if (!teams || teams.length < 2) {
    return { error: 'Se necesitan al menos 2 parejas para sortear' }
  }

  const isZonas = tournament?.tournament_format === 'ZONAS_Y_PLAYOFFS'
  const matchesToInsert = []

  if (isZonas) {
    // Lógica ZONAS_Y_PLAYOFFS
    const fapConfig = getFapBracket(teams.length)
    if (!fapConfig) {
      return { error: `La estructura de la Federación Argentina de Padel para ${teams.length} parejas no está implementada o no existe. (Configurado hasta 48 parejas)` }
    }

    const seededTeams = teams.filter(t => t.is_seeded).sort(() => Math.random() - 0.5)
    const unseededTeams = teams.filter(t => !t.is_seeded).sort(() => Math.random() - 0.5)
    
    // Crear las zonas exactas según FAP
    const zones: { name: string, teams: string[], targetSize: number }[] = fapConfig.zones.map((size, i) => ({
      name: `Zona ${String.fromCharCode(65 + i)}`, // Zona A, Zona B...
      teams: [],
      targetSize: size
    }))

    if (seededTeams.length > zones.length) {
      return { error: `Has marcado ${seededTeams.length} cabezas de serie, pero el formato de ${teams.length} parejas solo tiene ${zones.length} zonas. Para asegurar que no se enfrenten en fase de grupos, no puedes tener más cabezas de serie que la cantidad de zonas.` }
    }

    // Repartir Cabezas de Serie (1 por zona)
    let currentZoneIdx = 0
    seededTeams.forEach(team => {
      // Find next available zone
      while (zones[currentZoneIdx].teams.length >= zones[currentZoneIdx].targetSize) {
        currentZoneIdx = (currentZoneIdx + 1) % zones.length
      }
      zones[currentZoneIdx].teams.push(team.id)
      currentZoneIdx = (currentZoneIdx + 1) % zones.length
    })

    // Repartir el resto
    unseededTeams.forEach((team) => {
      // Encontrar la primera zona que no esté llena
      const availableZone = zones.find(z => z.teams.length < z.targetSize)
      if (availableZone) {
        availableZone.teams.push(team.id)
      }
    })

    // Guardar los group_name en los equipos (Actualizar BD)
    for (const zone of zones) {
      await supabase.from('tournament_teams')
        .update({ group_name: zone.name })
        .in('id', zone.teams)
        
      // Generar Round Robin (Todos vs Todos) para esta zona
      const zTeams = zone.teams
      for (let i = 0; i < zTeams.length; i++) {
        for (let j = i + 1; j < zTeams.length; j++) {
          matchesToInsert.push({
            tournament_id: tournamentId,
            team1_id: zTeams[i],
            team2_id: zTeams[j],
            stage: 'ZONAS',
            round_name: zone.name,
            status: 'SCHEDULED'
          })
        }
      }
    }
  } else {
    // Lógica ELIMINACION SIMPLE
    const shuffled = teams.sort(() => Math.random() - 0.5)
    let matchNumber = 1
    for (let i = 0; i < shuffled.length; i += 2) {
      const team1 = shuffled[i]
      const team2 = shuffled[i + 1]
      matchesToInsert.push({
        tournament_id: tournamentId,
        team1_id: team1.id,
        team2_id: team2 ? team2.id : null,
        stage: 'PLAYOFF',
        round_name: `Cruce ${matchNumber}`,
        status: 'SCHEDULED'
      })
      matchNumber++
    }
  }

  // Guardar los partidos en la base de datos
  const { error: matchError } = await supabase
    .from('matches')
    .insert(matchesToInsert)

  if (matchError) {
    console.error(matchError)
    return { error: 'Error al generar los partidos' }
  }

  // Cambiar el estado del torneo a IN_PROGRESS
  await supabase
    .from('tournaments')
    .update({ status: 'IN_PROGRESS' })
    .eq('id', tournamentId)

  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}
export async function guardarResultado(formData: FormData) {
  const supabase = createClient()
  
  const matchId = formData.get('match_id') as string
  const tournamentId = formData.get('tournament_id') as string
  const isSuperTieBreak = formData.get('is_super_tiebreak') === 'on'

  if (!matchId || !tournamentId) {
    return { error: 'Faltan datos de identificación del partido.' }
  }

  const t1s1 = parseInt(formData.get('t1_s1') as string)
  const t2s1 = parseInt(formData.get('t2_s1') as string)
  const t1s2 = parseInt(formData.get('t1_s2') as string)
  const t2s2 = parseInt(formData.get('t2_s2') as string)
  const t1s3Str = formData.get('t1_s3') as string
  const t2s3Str = formData.get('t2_s3') as string

  if (isNaN(t1s1) || isNaN(t2s1) || isNaN(t1s2) || isNaN(t2s2)) {
    return { error: 'Debes completar los primeros 2 sets con números válidos.' }
  }

  let team1SetsWon = 0
  let team2SetsWon = 0
  
  const setsData = []

  // Validar Set 1
  if (Math.max(t1s1, t2s1) < 6) return { error: 'El Set 1 no está cerrado. Al menos un equipo debe tener 6 o más.' }
  if (t1s1 > t2s1) team1SetsWon++
  else if (t2s1 > t1s1) team2SetsWon++
  else return { error: 'El Set 1 no puede ser un empate.' }
  
  setsData.push({ t1: t1s1, t2: t2s1 })

  // Validar Set 2
  if (Math.max(t1s2, t2s2) < 6) return { error: 'El Set 2 no está cerrado. Al menos un equipo debe tener 6 o más.' }
  if (t1s2 > t2s2) team1SetsWon++
  else if (t2s2 > t1s2) team2SetsWon++
  else return { error: 'El Set 2 no puede ser un empate.' }

  setsData.push({ t1: t1s2, t2: t2s2 })

  // Validar Set 3 si existe
  const hasThirdSet = t1s3Str.trim() !== '' && t2s3Str.trim() !== ''
  
  if (hasThirdSet) {
    const t1s3 = parseInt(t1s3Str)
    const t2s3 = parseInt(t2s3Str)
    
    if (isNaN(t1s3) || isNaN(t2s3)) {
      return { error: 'Los valores del tercer set son inválidos.' }
    }
    
    if (Math.max(t1s3, t2s3) < 6) {
      return { error: 'El 3er Set no está cerrado. El ganador debe alcanzar al menos 6 puntos/games.' }
    }

    if (t1s3 > t2s3) team1SetsWon++
    else if (t2s3 > t1s3) team2SetsWon++
    else return { error: 'El Set 3 no puede ser un empate.' }

    setsData.push({ t1: t1s3, t2: t2s3, is_super_tiebreak: isSuperTieBreak })
  }

  if (team1SetsWon === team2SetsWon) {
    return { error: 'El partido está empatado en sets. Debes cargar un 3er set para desempatar.' }
  }

  // Obtener el partido actual para saber quién es team1_id y team2_id
  const { data: match } = await supabase.from('matches').select('team1_id, team2_id').eq('id', matchId).single()
  if (!match) return { error: 'Partido no encontrado en la base de datos.' }

  const winnerId = team1SetsWon > team2SetsWon ? match.team1_id : match.team2_id

  // Crear el string del resultado (Para compatibilidad visual)
  let scoreString = `${t1s1}-${t2s1}, ${t1s2}-${t2s2}`
  if (hasThirdSet) {
    scoreString += `, ${t1s3Str}-${t2s3Str}`
  }

  // Guardar en base de datos
  const { error } = await supabase
    .from('matches')
    .update({ 
      score: scoreString,
      winner_id: winnerId,
      sets_data: setsData
    })
    .eq('id', matchId)

  if (error) {
    console.error(error)
    return { error: 'Error al guardar el resultado. Asegúrate de haber ejecutado el script de migración SQL en Supabase.' }
  }

  // MAGIA: Verificar si terminaron todos los partidos de ZONAS
  const { data: allZonasMatches } = await supabase
    .from('matches')
    .select('id, winner_id')
    .eq('tournament_id', tournamentId)
    .eq('stage', 'ZONAS')

  if (allZonasMatches && allZonasMatches.length > 0) {
    const allCompleted = allZonasMatches.every(m => m.winner_id !== null)
    if (allCompleted) {
      // Ya terminó la fase de zonas, generar playoffs
      await generarPlayoffsDesdeZonas(tournamentId)
    }
  }

  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

async function calcularPosicionesZonas(tournamentId: string) {
  const supabase = createClient()
  
  // 1. Obtener Equipos y sus Zonas
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('id, group_name')
    .eq('tournament_id', tournamentId)
    .not('group_name', 'is', null)

  if (!teams || teams.length === 0) return null

  // 2. Obtener los Partidos de las Zonas con sus Sets
  const { data: matches } = await supabase
    .from('matches')
    .select('team1_id, team2_id, winner_id, sets_data')
    .eq('tournament_id', tournamentId)
    .eq('stage', 'ZONAS')

  if (!matches) return null

  // 3. Calcular Tabla de Posiciones
  const standings: Record<string, { pts: number, setsDiff: number, gamesDiff: number, group: string }> = {}
  
  teams.forEach(t => {
    standings[t.id] = { pts: 0, setsDiff: 0, gamesDiff: 0, group: t.group_name }
  })

  matches.forEach(m => {
    if (!m.winner_id || !m.sets_data || !Array.isArray(m.sets_data)) return

    // Puntos por partido ganado
    standings[m.winner_id].pts += 1

    let t1Sets = 0, t2Sets = 0
    let t1Games = 0, t2Games = 0

    m.sets_data.forEach((set: any) => {
      const s1 = Number(set.t1) || 0
      const s2 = Number(set.t2) || 0
      
      if (s1 > s2) t1Sets++
      else if (s2 > s1) t2Sets++

      // Si no es super tiebreak, sumamos games. Si lo es, sumamos como games igual para diferenciar
      t1Games += s1
      t2Games += s2
    })

    if (standings[m.team1_id]) {
      standings[m.team1_id].setsDiff += (t1Sets - t2Sets)
      standings[m.team1_id].gamesDiff += (t1Games - t2Games)
    }
    
    if (standings[m.team2_id]) {
      standings[m.team2_id].setsDiff += (t2Sets - t1Sets)
      standings[m.team2_id].gamesDiff += (t2Games - t1Games)
    }
  })

  // 4. Obtener posiciones de cada Zona
  const groups = Array.from(new Set(teams.map(t => t.group_name))).sort()
  const topTeamsByGroup: Record<string, string[]> = {}

  groups.forEach(g => {
    const groupTeams = teams.filter(t => t.group_name === g).map(t => t.id)
    
    groupTeams.sort((a, b) => {
      if (standings[a].pts !== standings[b].pts) return standings[b].pts - standings[a].pts
      if (standings[a].setsDiff !== standings[b].setsDiff) return standings[b].setsDiff - standings[a].setsDiff
      return standings[b].gamesDiff - standings[a].gamesDiff
    })

    topTeamsByGroup[g] = groupTeams
  })

  return topTeamsByGroup
}

export async function syncFapPlayoffs(tournamentId: string) {
  const supabase = createClient()
  
  // 1. Obtener inscriptos para saber el tamaño del torneo
  const { count } = await supabase.from('tournament_teams').select('*', { count: 'exact', head: true }).eq('tournament_id', tournamentId)
  if (!count) return

  const fapConfig = getFapBracket(count)
  if (!fapConfig) return // Si no hay config, ignoramos (podría caer en lógica genérica si queremos, pero FAP es prioridad)

  // 2. Obtener posiciones de las zonas
  const standings = await calcularPosicionesZonas(tournamentId)
  if (!standings) return

  // 3. Función auxiliar para resolver dependencias ('1A', '2B', 'W58')
  const { data: playoffMatches } = await supabase.from('matches').select('id, round_name, winner_id').eq('tournament_id', tournamentId).eq('stage', 'PLAYOFF')
  
  const resolveDependency = (dep: string): string | null => {
    if (dep.startsWith('W')) {
      const matchNum = dep.replace('W', '')
      const matchName = `FAP_${matchNum}`
      const match = playoffMatches?.find(m => m.round_name === matchName)
      return match?.winner_id || null
    } else {
      // Ej. '1A' -> position 1 (index 0), Zone A
      const pos = parseInt(dep[0]) - 1
      const zoneLetter = dep[1]
      const zoneName = `Zona ${zoneLetter}`
      return standings[zoneName] ? standings[zoneName][pos] || null : null
    }
  }

  // 4. Revisar qué partidos de FAP ya se pueden crear
  for (const fapMatch of fapConfig.matches) {
    const matchName = `FAP_${fapMatch.id}`
    
    // Verificar si ya existe
    if (playoffMatches?.some(m => m.round_name === matchName)) continue

    const team1Id = resolveDependency(fapMatch.team1)
    const team2Id = resolveDependency(fapMatch.team2)

    // Si ambos equipos están definidos, creamos el partido
    if (team1Id && team2Id) {
      await supabase.from('matches').insert({
        tournament_id: tournamentId,
        team1_id: team1Id,
        team2_id: team2Id,
        stage: 'PLAYOFF',
        round_name: matchName,
        status: 'SCHEDULED'
      })
    }
  }

  // 5. Checkear si ya se jugó la Final para declarar campeón
  const finalMatchConfig = fapConfig.matches.find(m => m.isFinal)
  if (finalMatchConfig) {
    const finalMatchDb = playoffMatches?.find(m => m.round_name === `FAP_${finalMatchConfig.id}`)
    if (finalMatchDb && finalMatchDb.winner_id) {
      // TENEMOS CAMPEÓN
      const championTeamId = finalMatchDb.winner_id
      await supabase.from('tournaments').update({ status: 'COMPLETED' }).eq('id', tournamentId)
      
      const { data: championTeam } = await supabase
        .from('tournament_teams')
        .select('player1_id, player2_id')
        .eq('id', championTeamId)
        .single()
        
      if (championTeam) {
        const p1 = championTeam.player1_id
        const p2 = championTeam.player2_id
        
        // Asignar 100 puntos en el historial
        await supabase.from('player_history').insert([
          { player_id: p1, tournament_id: tournamentId, stage_reached: 'Campeón', points_earned: 100 },
          ...(p2 ? [{ player_id: p2, tournament_id: tournamentId, stage_reached: 'Campeón', points_earned: 100 }] : [])
        ])
        
        // Actualizar tabla players
        const { data: playersToUpdate } = await supabase
          .from('players')
          .select('id, points')
          .in('id', [p1, p2].filter(Boolean))

        if (playersToUpdate) {
          for (const player of playersToUpdate) {
            await supabase.from('players')
              .update({ points: (player.points || 0) + 100 })
              .eq('id', player.id)
          }
        }
      }
    }
  }
}

async function generarPlayoffsDesdeZonas(tournamentId: string) {
  // Ahora simplemente delegamos en la función de sincronización FAP
  await syncFapPlayoffs(tournamentId)
}

export async function avanzarRonda(formData: FormData) {
  const tournamentId = formData.get('tournament_id') as string
  if (!tournamentId) return { error: 'ID inválido' }

  await syncFapPlayoffs(tournamentId)
  
  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

export async function togglePago(formData: FormData) {
  const supabase = createClient()
  const teamId = formData.get('team_id') as string
  const playerNum = formData.get('player_num') as string
  const currentStatus = formData.get('current_status') === 'true'
  const tournamentId = formData.get('tournament_id') as string

  if (!teamId || !playerNum) return { error: 'Datos inválidos' }

  const column = playerNum === '1' ? 'has_paid_p1' : 'has_paid_p2'

  const { error } = await supabase
    .from('tournament_teams')
    .update({ [column]: !currentStatus })
    .eq('id', teamId)

  if (error) {
    console.error(error)
    return { error: 'Error al actualizar pago' }
  }

  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

export async function toggleVerificado(matchId: string, isVerified: boolean, tournamentId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('matches')
    .update({ is_verified: isVerified })
    .eq('id', matchId)
    
  if (error) {
    console.error(error)
    return { error: 'Error al actualizar estado de verificación' }
  }
  
  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

export async function finalizarTorneo(formData: FormData) {
  const tournamentId = formData.get('tournament_id') as string
  if (!tournamentId) return { error: 'ID requerido' }

  const supabase = createClient()

  // 1. Obtener torneo
  const { data: torneo, error: errTorneo } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()

  if (errTorneo || !torneo) return { error: 'Torneo no encontrado' }
  if (torneo.status === 'COMPLETED') return { error: 'El torneo ya está finalizado' }

  // 2. Obtener partidos y equipos
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)

  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('id, player1_id, player2_id')
    .eq('tournament_id', tournamentId)

  if (!teams || !matches) return { error: 'Error al obtener datos' }

  const pointsMap = {
    winner: torneo.points_winner || 100,
    runnerUp: torneo.points_runner_up || 90,
    semi: torneo.points_semi || 80,
    quarter: torneo.points_quarter || 60,
    eighths: torneo.points_eighths || 40,
    zone: torneo.points_zone || 10
  }

  const playerPointsUpdates: Record<string, number> = {}

  teams.forEach(team => {
    const teamMatches = matches.filter(m => m.team1_id === team.id || m.team2_id === team.id)
    if (teamMatches.length === 0) return // No jugó
    
    let points = pointsMap.zone

    const playedFinal = teamMatches.find(m => m.round_name?.toLowerCase().trim() === 'final')
    const playedSemi = teamMatches.find(m => m.round_name?.toLowerCase().includes('semi'))
    const playedQuarter = teamMatches.find(m => m.round_name?.toLowerCase().includes('cuartos'))
    const playedEighths = teamMatches.find(m => m.round_name?.toLowerCase().includes('octavos'))

    if (playedFinal) {
      if (playedFinal.winner_id === team.id) {
        points = pointsMap.winner
      } else {
        points = pointsMap.runnerUp
      }
    } else if (playedSemi) {
      points = pointsMap.semi
    } else if (playedQuarter) {
      points = pointsMap.quarter
    } else if (playedEighths) {
      points = pointsMap.eighths
    }

    if (team.player1_id) {
      playerPointsUpdates[team.player1_id] = (playerPointsUpdates[team.player1_id] || 0) + points
    }
    if (team.player2_id) {
      playerPointsUpdates[team.player2_id] = (playerPointsUpdates[team.player2_id] || 0) + points
    }
  })

  // Actualizar puntos de jugadores
  const playerIds = Object.keys(playerPointsUpdates)
  if (playerIds.length > 0) {
    const { data: playersToUpdate } = await supabase
      .from('players')
      .select('id, ranking_points')
      .in('id', playerIds)

    if (playersToUpdate) {
      for (const player of playersToUpdate) {
        const newPoints = (player.ranking_points || 0) + playerPointsUpdates[player.id]
        await supabase
          .from('players')
          .update({ ranking_points: newPoints })
          .eq('id', player.id)
      }
    }
  }

  // Finalizar torneo
  await supabase
    .from('tournaments')
    .update({ status: 'COMPLETED' })
    .eq('id', tournamentId)

  revalidatePath(`/dashboard/torneos/${tournamentId}`)
  return { success: true }
}

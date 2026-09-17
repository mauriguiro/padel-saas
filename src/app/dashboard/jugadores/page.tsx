import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Search, Trophy, Medal, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PlayerDetailsModal } from './player-details-modal'

export default async function JugadoresPage({ searchParams }: { searchParams: { q?: string, sort?: string, order?: string, category?: string, page?: string, gender?: string } }) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const queryParams = searchParams || {}
  const searchQuery = queryParams.q || ''
  const sortBy = queryParams.sort || 'points'
  const sortOrder = queryParams.order || (sortBy === 'points' ? 'desc' : 'asc')
  const categoryFilter = queryParams.category || ''
  const genderFilter = queryParams.gender || ''

  const page = parseInt(queryParams.page || '1')
  const limit = 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Obtener jugadores y el conteo total
  let query = supabase.from('players').select('*', { count: 'exact' }).eq('club_id', user.id)

  if (searchQuery) {
    query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
  }

  if (categoryFilter) {
    query = query.ilike('category', categoryFilter)
  }

  if (genderFilter) {
    query = query.eq('gender', genderFilter)
  }

  // Ordenamiento
  if (sortBy === 'points') {
    query = query.order('points', { ascending: sortOrder === 'asc' }).order('last_name', { ascending: true })
  } else if (sortBy === 'name') {
    query = query.order('last_name', { ascending: sortOrder === 'asc' }).order('first_name', { ascending: sortOrder === 'asc' })
  } else if (sortBy === 'category') {
    query = query.order('category', { ascending: sortOrder === 'asc' }).order('last_name', { ascending: true })
  }

  query = query.range(from, to)

  const { data: jugadores, count } = await query
  const totalPages = count ? Math.ceil(count / limit) : 1

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-5 pb-10">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-5 rounded-lg border shadow-sm">
        <div>
          <h1 className="font-bold text-3xl">Jugadores</h1>
        </div>
        <Link 
          href="/dashboard/jugadores/nuevo" 
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-bold shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <PlusCircle className="h-5 w-5" />
          Agregar Jugador
        </Link>
      </div>

      {/* Controles: Buscador y Filtros */}
      <div className="flex flex-col mb-1 bg-muted/20 p-3 rounded-lg border">
        <form className="flex flex-col md:flex-row gap-3">
          {genderFilter && <input type="hidden" name="gender" value={genderFilter} />}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              name="q" 
              defaultValue={searchQuery}
              placeholder="Buscar por nombre o apellido..." 
              className="w-full pl-9 pr-4 py-2 border-2 border-b-[4px] border-muted-foreground/20 rounded-lg h-11 transition-all outline-none focus:border-primary/50"
            />
          </div>
          
          <select 
            name="category" 
            defaultValue={categoryFilter}
            className="border-2 border-b-[4px] border-muted-foreground/20 rounded-lg px-3 py-2 h-11 bg-background text-sm font-bold transition-all hover:bg-muted/50 active:border-b-2 active:translate-y-[2px] cursor-pointer outline-none focus:border-primary/50"
          >
            <option value="">Todas las categorías</option>
            <option value="1RA">1RA</option>
            <option value="2DA">2DA</option>
            <option value="3RA">3RA</option>
            <option value="4TA">4TA</option>
            <option value="5TA">5TA</option>
            <option value="6TA">6TA</option>
            <option value="7MA">7MA</option>
            <option value="8VA">8VA</option>
            <option value="PRINCIPIANTE">PRINCIPIANTE</option>
          </select>

          <select 
            name="sort" 
            defaultValue={sortBy}
            className="border-2 border-b-[4px] border-muted-foreground/20 rounded-lg px-3 py-2 h-11 bg-background text-sm font-bold transition-all hover:bg-muted/50 active:border-b-2 active:translate-y-[2px] cursor-pointer outline-none focus:border-primary/50"
          >
            <option value="points">Ordenar por Puntos</option>
            <option value="name">Ordenar por Nombre y Ap.</option>
            <option value="category">Ordenar por Categoría</option>
          </select>

          <select 
            name="order" 
            defaultValue={sortOrder}
            className="border-2 border-b-[4px] border-muted-foreground/20 rounded-lg px-3 py-2 h-11 bg-background text-sm font-bold transition-all hover:bg-muted/50 active:border-b-2 active:translate-y-[2px] cursor-pointer outline-none focus:border-primary/50"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>

          <button type="submit" className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-black tracking-wide border-2 border-primary border-b-[4px] hover:brightness-110 active:border-b-2 active:translate-y-[2px] transition-all h-11 whitespace-nowrap shadow-sm">
            Filtrar
          </button>
          
          {(searchQuery || categoryFilter || sortBy !== 'points' || sortOrder !== 'desc' || genderFilter) && (
            <Link href="/dashboard/jugadores" className="px-4 py-2 text-sm flex items-center justify-center text-muted-foreground hover:underline whitespace-nowrap h-10">
              Limpiar
            </Link>
          )}
        </form>
      </div>      {/* Botones de filtro por sexo con efecto 3D */}
      <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-2 w-full">
        <Link 
          href={`/dashboard/jugadores?q=${searchQuery}&sort=${sortBy}&order=${sortOrder}&category=${categoryFilter}`}
          className={`flex items-center justify-center text-center px-1 md:px-6 py-2.5 text-[11px] sm:text-xs md:text-sm font-black tracking-tighter md:tracking-wide rounded-full border-2 transition-all active:border-b-2 active:translate-y-[2px] ${!genderFilter ? 'bg-primary text-primary-foreground border-primary border-b-[4px] hover:brightness-110 shadow-sm' : 'bg-background text-muted-foreground border-muted-foreground/20 border-b-[4px] hover:bg-muted hover:border-muted-foreground/40'}`}
        >
          Todos
        </Link>
        <Link 
          href={`/dashboard/jugadores?q=${searchQuery}&sort=${sortBy}&order=${sortOrder}&category=${categoryFilter}&gender=Masculino`}
          className={`flex items-center justify-center text-center px-1 md:px-6 py-2.5 text-[11px] sm:text-xs md:text-sm font-black tracking-tighter md:tracking-wide rounded-full border-2 transition-all active:border-b-2 active:translate-y-[2px] ${genderFilter === 'Masculino' ? 'bg-blue-600 text-white border-blue-700 border-b-[4px] hover:brightness-110 shadow-sm' : 'bg-background text-muted-foreground border-muted-foreground/20 border-b-[4px] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:text-blue-400'}`}
        >
          Masculinos
        </Link>
        <Link 
          href={`/dashboard/jugadores?q=${searchQuery}&sort=${sortBy}&order=${sortOrder}&category=${categoryFilter}&gender=Femenino`}
          className={`flex items-center justify-center text-center px-1 md:px-6 py-2.5 text-[11px] sm:text-xs md:text-sm font-black tracking-tighter md:tracking-wide rounded-full border-2 transition-all active:border-b-2 active:translate-y-[2px] ${genderFilter === 'Femenino' ? 'bg-pink-600 text-white border-pink-700 border-b-[4px] hover:brightness-110 shadow-sm' : 'bg-background text-muted-foreground border-muted-foreground/20 border-b-[4px] hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 dark:hover:bg-pink-950 dark:hover:text-pink-400'}`}
        >
          Femeninos
        </Link>
      </div>

      {/* Lista de Jugadores (Ranking) */}
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardContent className="p-0">
          {jugadores && jugadores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-1 sm:px-2 md:px-4 py-3 font-semibold text-center w-10 sm:w-16">
                      <Link href={`?q=${searchQuery}&sort=points&order=${sortBy === 'points' && sortOrder === 'desc' ? 'asc' : 'desc'}${categoryFilter ? `&category=${categoryFilter}` : ''}${genderFilter ? `&gender=${genderFilter}` : ''}`} className="hover:text-primary hover:underline whitespace-nowrap">
                        Rank {sortBy === 'points' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </Link>
                    </th>
                    <th className="px-2 md:px-4 py-3 font-semibold">
                      <Link href={`?q=${searchQuery}&sort=name&order=${sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc'}${categoryFilter ? `&category=${categoryFilter}` : ''}${genderFilter ? `&gender=${genderFilter}` : ''}`} className="hover:text-primary hover:underline whitespace-nowrap">
                        Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                    <th className="px-1 sm:px-2 md:px-4 py-3 font-semibold text-center">
                      <Link href={`?q=${searchQuery}&sort=category&order=${sortBy === 'category' && sortOrder === 'asc' ? 'desc' : 'asc'}${categoryFilter ? `&category=${categoryFilter}` : ''}${genderFilter ? `&gender=${genderFilter}` : ''}`} className="hover:text-primary hover:underline whitespace-nowrap">
                        <span className="md:hidden">Cat.</span>
                        <span className="hidden md:inline">Categoría</span> {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                    <th className="px-1 sm:px-2 md:px-4 py-3 font-semibold text-center">Pts</th>
                    <th className="hidden sm:table-cell px-2 md:px-4 py-3 font-semibold">Teléfono</th>
                    <th className="hidden lg:table-cell px-4 py-3 font-semibold">DNI</th>
                    <th className="px-1 sm:px-2 md:px-4 py-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jugadores.map((jugador, index) => (
                    <tr key={jugador.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 font-bold text-center">
                        {sortBy === 'points' && sortOrder === 'desc' ? (
                          <>
                            {from + index === 0 && <span title="1er Lugar"><Medal className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mx-auto" /></span>}
                            {from + index === 1 && <span title="2do Lugar"><Medal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mx-auto" /></span>}
                            {from + index === 2 && <span title="3er Lugar"><Medal className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700 mx-auto" /></span>}
                            {from + index > 2 && <span className="text-muted-foreground">{from + index + 1}</span>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-2 md:px-4 py-2 sm:py-2.5">
                        <PlayerDetailsModal jugador={jugador}>
                          <div className="inline-flex items-center gap-2 font-bold text-xs sm:text-[15px] whitespace-nowrap text-ellipsis overflow-hidden max-w-[120px] sm:max-w-none bg-background hover:bg-muted border px-2.5 py-1.5 rounded-md shadow-sm transition-all active:scale-95 text-foreground hover:text-primary cursor-pointer">
                            <span>{jugador.last_name}, <span className="md:hidden">{jugador.first_name.charAt(0)}.</span><span className="hidden md:inline">{jugador.first_name}</span></span>
                          </div>
                        </PlayerDetailsModal>
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 text-center">
                        <span className="bg-secondary text-secondary-foreground px-1 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border">
                          {jugador.category}
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 text-center font-bold text-primary text-sm sm:text-base">
                        {jugador.points || 0}
                      </td>
                      <td className="hidden sm:table-cell px-2 md:px-4 py-2 sm:py-2.5 text-muted-foreground text-xs sm:text-sm">
                        {jugador.phone || '-'}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-2.5 text-muted-foreground text-sm">
                        {jugador.dni || '-'}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 text-right flex justify-end gap-1">
                        <Link 
                          href={`/dashboard/jugadores/${jugador.id}/editar`}
                          className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-600/10 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                        <form action={async (formData) => {
                          'use server'
                          const supabase = createClient()
                          await supabase.from('players').delete().eq('id', formData.get('id'))
                          import('next/cache').then(m => m.revalidatePath('/dashboard/jugadores'))
                        }}>
                          <input type="hidden" name="id" value={jugador.id} />
                          <button 
                            type="submit" 
                            className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-600/10 rounded-md transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-bold">No hay jugadores registrados</h3>
              <p className="text-muted-foreground mt-1 mb-6 text-sm max-w-sm">
                Agrega a los jugadores de tu club para comenzar a armar el Ranking Zonal.
              </p>
              <Link 
                href="/dashboard/jugadores/nuevo" 
                className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md font-bold transition-colors"
              >
                Crear mi primer jugador
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Mostrando <strong>{count === 0 ? 0 : from + 1}</strong> al <strong>{Math.min(to + 1, count || 0)}</strong> de <strong>{count}</strong> jugadores
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link 
                href={`/dashboard/jugadores?page=${page - 1}${searchQuery ? `&q=${searchQuery}` : ''}${sortBy ? `&sort=${sortBy}` : ''}${sortOrder ? `&order=${sortOrder}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}${genderFilter ? `&gender=${genderFilter}` : ''}`}
                className="px-4 py-2 border rounded-md hover:bg-accent text-sm font-medium"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`/dashboard/jugadores?page=${page + 1}${searchQuery ? `&q=${searchQuery}` : ''}${sortBy ? `&sort=${sortBy}` : ''}${sortOrder ? `&order=${sortOrder}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}${genderFilter ? `&gender=${genderFilter}` : ''}`}
                className="px-4 py-2 border rounded-md hover:bg-accent text-sm font-medium"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

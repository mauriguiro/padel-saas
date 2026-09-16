'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Search, CheckCircle } from 'lucide-react'

// Usamos el cliente anónimo (anon key) porque los perfiles (profiles) normalmente son legibles públicamente
// o se puede hacer una petición GET a una API route. Para agilizar, consultamos directo con la key anónima.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function ZonalSearch() {
  const [isZonal, setIsZonal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [clubs, setClubs] = useState<any[]>([])
  const [selectedClub, setSelectedClub] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchTerm.length < 2) {
      setClubs([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('role', 'ClubAdmin')
        .ilike('full_name', `%${searchTerm}%`)
        .limit(5)
      
      if (!error && data) {
        setClubs(data)
      }
      setIsSearching(false)
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  return (
    <Card className="mt-6 border-2 border-primary/20 shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h4 className="font-bold flex items-center gap-2 text-primary text-lg">
            <Building2 className="h-5 w-5" />
            Invitar Club (Torneo Zonal Combinado)
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Activa esta opción para invitar a otro club de la red y organizar el torneo en conjunto.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-background/50 p-2 rounded-lg border shadow-sm">
          {/* Un input oculto para pasar el is_zonal al Server Action */}
          <input type="hidden" name="is_zonal" value={isZonal ? "true" : "false"} />
          <Label htmlFor="zonal-switch" className="font-bold text-sm cursor-pointer">
            {isZonal ? 'Habilitado' : 'Deshabilitado'}
          </Label>
          <Switch 
            id="zonal-switch"
            checked={isZonal} 
            className="data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600 scale-125"
            onCheckedChange={(checked) => {
              setIsZonal(checked)
              if (!checked) {
                setSelectedClub(null)
                setSearchTerm('')
              }
            }} 
          />
        </div>
      </div>

      {isZonal && (
        <CardContent className="pt-6 bg-card border-t border-primary/10">
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-foreground">Buscar Club Anfitrión Adicional</Label>
            
            {selectedClub ? (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-4 rounded-md">
                <input type="hidden" name="co_host_id" value={selectedClub.id} />
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle className="h-6 w-6" />
                  <div>
                    <p className="font-bold text-base">{selectedClub.full_name}</p>
                    <p className="text-sm opacity-80">@{selectedClub.username}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedClub(null)}
                  className="text-sm text-destructive font-bold hover:underline"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Escribe el nombre del club para buscar..." 
                  className="pl-10 h-12 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Buscando...</span>}
                
                {clubs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-xl z-20 max-h-60 overflow-y-auto">
                    {clubs.map(club => (
                      <button
                        key={club.id}
                        type="button"
                        className="w-full text-left px-5 py-3 hover:bg-accent flex flex-col border-b last:border-0 transition-colors"
                        onClick={() => {
                          setSelectedClub(club)
                          setClubs([])
                          setSearchTerm('')
                        }}
                      >
                        <span className="font-bold text-base">{club.full_name}</span>
                        <span className="text-sm text-muted-foreground">@{club.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

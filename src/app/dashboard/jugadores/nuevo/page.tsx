import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Mail, Trophy, Medal, CreditCard, Calendar } from 'lucide-react'

export default function NuevoJugadorPage({
  searchParams,
}: {
  searchParams: { error?: string, name?: string }
}) {
  const crearJugador = async (formData: FormData) => {
    'use server'
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const dni = formData.get('dni') as string
    const birthDate = formData.get('birth_date') as string
    const category = (formData.get('category') as string)?.toUpperCase() || ''
    const gender = formData.get('gender') as string
    const points = parseInt(formData.get('points') as string) || 0

    // Control de DNI duplicado
    if (dni) {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('first_name, last_name')
        .eq('club_id', user.id)
        .eq('dni', dni)
        .single()

      if (existingPlayer) {
        return redirect(`/dashboard/jugadores/nuevo?error=duplicate_dni&name=${existingPlayer.first_name} ${existingPlayer.last_name}`)
      }
    }

    const { error } = await supabase.from('players').insert({
      club_id: user.id,
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      dni,
      birth_date: birthDate ? birthDate : null,
      category,
      gender,
      points
    })

    if (error) {
      console.error(error)
      return redirect('/dashboard/jugadores/nuevo?error=true')
    }

    redirect('/dashboard/jugadores')
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jugadores" className="p-3 hover:bg-accent rounded-full transition-colors border shadow-sm bg-background">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="font-bold text-3xl text-foreground">Agregar Nuevo Jugador</h1>
          <p className="text-muted-foreground mt-1">Completa el perfil para sumarlo a tu base de datos.</p>
        </div>
      </div>

      <form action={crearJugador} className="flex flex-col gap-6">
        
        {searchParams?.error === 'duplicate_dni' && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <strong>Atención:</strong> Ya existe un jugador registrado en tu club con ese DNI.
            {searchParams.name && <span> Su nombre es <strong>{searchParams.name}</strong>.</span>}
          </div>
        )}

        {searchParams?.error === 'true' && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            Ocurrió un error al guardar el jugador. Revisa los datos e intenta de nuevo.
          </div>
        )}

        {/* Sección Datos Personales */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor="first_name" className="text-sm font-semibold text-red-500">Nombre *</Label>
                <Input name="first_name" required placeholder="Ej: Juan" className="h-11" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="last_name" className="text-sm font-semibold text-red-500">Apellido *</Label>
                <Input name="last_name" required placeholder="Ej: Pérez" className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-red-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Teléfono / WhatsApp *
                </Label>
                <Input name="phone" required placeholder="+34 600 000 000" className="h-11" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Correo (Opcional)
                </Label>
                <Input name="email" type="email" placeholder="juan@correo.com" className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor="dni" className="text-sm font-semibold text-red-500 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> DNI *
                </Label>
                <Input name="dni" required placeholder="Ej: 30123456" className="h-11" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="birth_date" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Fecha de Nacimiento (Opcional)
                </Label>
                <Input name="birth_date" type="date" className="h-11" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección Datos Deportivos */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Datos Deportivos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-3">
                <Label htmlFor="category" className="text-sm font-semibold text-red-500">Categoría *</Label>
                <Input 
                  id="category" 
                  name="category" 
                  list="categorias-jugador"
                  placeholder="Ej. 7ma" 
                  required 
                  className="h-11 uppercase"
                />
                <datalist id="categorias-jugador">
                  <option value="1RA" />
                  <option value="2DA" />
                  <option value="3RA" />
                  <option value="4TA" />
                  <option value="5TA" />
                  <option value="6TA" />
                  <option value="7MA" />
                  <option value="8VA" />
                  <option value="PRINCIPIANTE" />
                </datalist>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="gender" className="text-sm font-semibold text-red-500">Rama *</Label>
                <Select name="gender" defaultValue="Masculino">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="points" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Medal className="h-4 w-4" /> Puntos Iniciales
                </Label>
                <Input name="points" type="number" defaultValue="0" min="0" className="h-11" />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 mt-2">
          <Link href="/dashboard/jugadores" className="px-6 py-3 border border-input rounded-md hover:bg-accent font-medium transition-colors">
            Cancelar
          </Link>
          <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-bold shadow-md transition-all hover:-translate-y-0.5">
            Guardar Jugador
          </button>
        </div>
      </form>
    </div>
  )
}

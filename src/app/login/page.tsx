import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PadelRacketLetterD, PadelRacketHit } from '@/components/logo-icons'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string, mode?: string }
}) {
  const isRegister = searchParams.mode === 'register';

  const signIn = async (formData: FormData) => {
    'use server'
    const identifier = formData.get('username') as string // Ahora puede ser usuario o email
    const password = formData.get('password') as string
    const supabase = createClient()

    let emailToUse = identifier

    // Si no tiene '@', asumimos que es un nombre de usuario y buscamos su correo real
    if (!identifier.includes('@')) {
      const { data: email, error: rpcError } = await supabase.rpc('get_email_by_username', {
        p_username: identifier
      });

      if (rpcError || !email) {
        return redirect('/login?message=Usuario o correo no encontrado')
      }
      emailToUse = email as string
    }

    // 2. Iniciar sesión con el email
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    })

    if (error) {
      return redirect('/login?message=Contraseña incorrecta')
    }

    return redirect('/dashboard')
  }

  const signUp = async (formData: FormData) => {
    'use server'
    const origin = headers().get('origin')
    const username = formData.get('username') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          username,
          full_name: fullName,
          phone,
        }
      },
    })

    if (error) {
      return redirect('/login?mode=register&message=Error al registrarse. Quizás el usuario ya existe.')
    }

    // Si Supabase requiere confirmación por email, mostramos mensaje. 
    // Si no la requiere, idealmente iniciaríamos sesión directo, pero forzaremos redirección al login.
    return redirect('/login?message=Registro exitoso. Ahora inicia sesión con tu usuario.')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center min-h-screen mx-auto py-12 overflow-y-auto">
      <Card className="shadow-lg my-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary flex items-center justify-center">
            {isRegister ? 'Registrar Club' : (
              <div className="flex items-center">
                <span className="font-bold tracking-tight flex items-center">
                  Pa<PadelRacketLetterD className="h-7 w-6 inline-block -ml-[1px] -mr-[1px] text-primary" />el SaaS
                </span>
                <PadelRacketHit className="h-7 w-7 ml-1.5 text-primary" />
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister ? 'Ingresa los datos para crear tu cuenta' : 'Inicia sesión con tu Usuario'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
            
            {/* CAMPOS DE REGISTRO (Solo visibles si mode=register) */}
            {isRegister && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Nombre Completo o Razón Social</Label>
                  <Input name="full_name" placeholder="Ej. Juan Pérez / Padel Pro" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                  <Input name="phone" placeholder="+34 600 000 000" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input name="email" type="email" placeholder="tu@correo.com" required />
                </div>
              </>
            )}

            {/* CAMPOS COMUNES */}
            <div className="grid gap-2">
              <Label htmlFor="username">{isRegister ? 'Elige un Nombre de Usuario' : 'Usuario o Correo Electrónico'}</Label>
              <Input name="username" placeholder={isRegister ? "ej. clubpadel" : "usuario o correo@ejemplo.com"} required />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                {!isRegister && (
                  <a href="/recuperar" className="text-xs text-primary hover:underline font-medium">
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <Input type="password" name="password" placeholder="••••••••" required />
            </div>

            {searchParams?.message && (
              <p className="mt-2 p-3 bg-destructive/10 text-destructive text-center text-sm rounded-md font-medium">
                {searchParams.message}
              </p>
            )}

            <div className="flex flex-col gap-3 mt-4">
              {isRegister ? (
                <>
                  <button formAction={signUp} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-semibold">
                    Crear Cuenta
                  </button>
                  <a href="/login" className="text-center text-sm text-muted-foreground hover:underline mt-2">
                    ¿Ya tienes cuenta? Inicia Sesión
                  </a>
                </>
              ) : (
                <>
                  <button formAction={signIn} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-semibold">
                    Entrar
                  </button>
                  <a href="/login?mode=register" className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-center flex items-center justify-center font-medium mt-2">
                    Registrar un nuevo Club
                  </a>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

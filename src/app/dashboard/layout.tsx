import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Menu, PlusCircle, UserPlus, LogOut, Trophy, Users, ShieldAlert, LayoutDashboard, Lightbulb, Phone, Mail, ChevronDown, Calendar, Grid2X2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ModeToggle } from '@/components/mode-toggle'
import { PadelRacketLetterD, PadelRacketHit } from '@/components/logo-icons'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. OBTENER EL PERFIL DEL USUARIO PARA VER SU ESTADO Y ROL
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  // 2. EL CANDADO: Si está pendiente, lo sacamos del dashboard
  if (profile?.status === 'PENDING' && profile?.role !== 'SuperAdmin') {
    redirect('/pendiente')
  }

  const signOut = async () => {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  // Extraemos el username de la metadata
  const username = user.user_metadata?.username || 'admin'
  const fullName = user.user_metadata?.full_name || 'Club'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar Superior con Menú Hamburguesa */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur px-4 md:px-8">
        <div className="flex h-16 items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="p-2 -ml-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[220px] px-3">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-xl text-primary">Menú Principal</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 py-6">
                  
                  <SheetClose asChild>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-md text-sm font-medium transition-colors">
                      <LayoutDashboard strokeWidth={1.5} className="h-5 w-5 text-green-500" />
                      Inicio (Resumen)
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link href="/dashboard/turnos" className="flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-md text-sm font-medium transition-colors">
                      <Calendar strokeWidth={1.5} className="h-5 w-5 text-green-500" />
                      Turnos
                    </Link>
                  </SheetClose>

                  <details className="py-0 group">
                    <summary className="flex items-center justify-between px-3 py-3 text-sm font-medium text-foreground cursor-pointer list-none hover:bg-accent rounded-md transition-colors [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center gap-3">
                        <Trophy strokeWidth={1.5} className="h-5 w-5 text-amber-500" />
                        Torneos
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="flex flex-col ml-9 border-l-2 border-border/60 pl-2 space-y-1 mt-1 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                      <SheetClose asChild>
                        <Link href="/dashboard/torneos" className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
                          Mis Torneos
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard/torneos/nuevo" className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
                          Crear Torneo
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard/torneos/historial" className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
                          Historial
                        </Link>
                      </SheetClose>
                    </div>
                  </details>

                  <SheetClose asChild>
                    <Link href="/dashboard/canchas" className="flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-md text-sm font-medium transition-colors">
                      <Grid2X2 strokeWidth={1.5} className="h-5 w-5 text-emerald-500" />
                      Mis Canchas
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Link href="/dashboard/jugadores" className="flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-md text-sm font-medium transition-colors">
                      <Users strokeWidth={1.5} className="h-5 w-5 text-rose-500" />
                      Jugadores
                    </Link>
                  </SheetClose>

                </div>
                  <div className="h-px bg-border my-2 mx-3" />
                  
                  <SheetClose asChild>
                    <Link href="/dashboard/contacto" className="flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-md text-sm font-medium transition-colors">
                      <Phone strokeWidth={1.5} className="h-5 w-5 text-slate-500" />
                      Soporte y Contacto
                    </Link>
                  </SheetClose>

                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                  <a 
                    href="mailto:soporte@tudominio.com?subject=Sugerencia%20de%20Mejora%20-%20Padel%20SaaS"
                    className="flex w-full items-center justify-center gap-2 bg-amber-50/50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-amber-200/50 dark:border-amber-500/20 shadow-sm"
                    title="¿Tienes alguna sugerencia para mejorar la app?"
                  >
                    <Lightbulb strokeWidth={1.5} className="h-4 w-4 opacity-70" />
                    Sugerencias
                  </a>
                  <form action={signOut}>
                    <button className="flex w-full items-center justify-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      <LogOut strokeWidth={1.5} className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center ml-2">
              <span className="font-bold text-xl text-primary tracking-tight flex items-center">
                Pa<PadelRacketLetterD className="h-6 w-5 inline-block -ml-[1px] -mr-[1px] text-primary" />el SaaS
              </span>
              <PadelRacketHit className="h-6 w-6 ml-1.5" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-foreground">@{username}</span>
              <span className="text-xs text-muted-foreground">{fullName}</span>
            </div>
            
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-muted/10">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

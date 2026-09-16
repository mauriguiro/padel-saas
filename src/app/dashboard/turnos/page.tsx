import { Hammer, CalendarClock } from 'lucide-react'

export default function TurnosPage() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-6 pb-10">
      <div className="bg-muted/30 p-12 rounded-3xl border shadow-sm flex flex-col items-center text-center max-w-2xl">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-background p-4 rounded-full border shadow-sm">
            <CalendarClock className="h-16 w-16 text-indigo-500" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-100 p-2 rounded-full border shadow-sm">
            <Hammer className="h-6 w-6 text-amber-600" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="font-black text-4xl mb-4 text-foreground">Módulo en Construcción</h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Estamos preparando el nuevo gestor de <strong className="text-foreground">Turnos Fijos y Ocasionales</strong>. 
          Muy pronto podrás administrar las reservas de tus canchas con una interfaz visual increíble.
        </p>

        <div className="flex gap-4">
          <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-full text-sm border border-indigo-200 dark:border-indigo-800">
            Próximamente
          </div>
        </div>
      </div>
    </div>
  )
}

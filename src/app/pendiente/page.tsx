import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function PendientePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full bg-background border rounded-lg p-8 shadow-sm text-center flex flex-col items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Cuenta en Revisión</h1>
        <p className="text-muted-foreground text-sm">
          Hemos recibido tu solicitud de registro. Para mantener la seguridad y calidad de nuestra plataforma, 
          aprobamos manualmente cada nuevo club.
        </p>
        <p className="text-muted-foreground text-sm font-medium">
          Te notificaremos en breve cuando tu cuenta haya sido activada para que puedas comenzar a organizar tus torneos.
        </p>
        
        <div className="flex flex-col gap-3 w-full mt-6">
          <a 
            href="https://wa.me/5493456437416?text=Hola!%20Acabo%20de%20registrar%20mi%20club%20en%20la%20plataforma%20y%20estoy%20a%20la%20espera%20de%20aprobación."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white hover:bg-[#20bd5a] px-4 py-3 rounded-md font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            Avisar por WhatsApp
          </a>

          <Link 
            href="/login" 
            className="text-sm font-semibold text-primary hover:underline mt-2"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

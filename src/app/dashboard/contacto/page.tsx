import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Clock, MapPin, Globe } from 'lucide-react'

export default function ContactoPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="font-extrabold text-3xl tracking-tight text-foreground">Soporte y Contacto</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          ¿Tienes dudas, sugerencias o necesitas asistencia técnica con el panel? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              WhatsApp
            </CardTitle>
            <CardDescription>Respuesta rápida para consultas urgentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-foreground font-medium">+54 9 11 0000-0000</p>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noreferrer"
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-center text-sm shadow-sm"
              >
                Abrir chat de WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Correo Electrónico
            </CardTitle>
            <CardDescription>Para consultas formales o reportar problemas técnicos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-foreground font-medium">soporte@tudominio.com</p>
              <a
                href="mailto:soporte@tudominio.com"
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center text-sm shadow-sm"
              >
                Enviar correo electrónico
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Horario de Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Soporte Online</p>
                  <p className="text-muted-foreground">Lunes a Viernes, 9:00 a 18:00 (GMT-3)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Ubicación</p>
                  <p className="text-muted-foreground">Buenos Aires, Argentina</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

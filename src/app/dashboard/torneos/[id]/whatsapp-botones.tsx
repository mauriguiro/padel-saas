'use client'

import { MessageCircle, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// 1. Botón para enviar recordatorio de pago a un jugador específico
export function BotonWhatsAppPago({ 
  playerName, 
  phone, 
  torneoName 
}: { 
  playerName: string, 
  phone?: string | null, 
  torneoName: string 
}) {
  const handleSend = () => {
    const mensaje = `Hola ${playerName}, te escribimos de la organización del torneo *${torneoName}*. Te recordamos que tienes pendiente abonar tu inscripción. ¡Muchas gracias! 🎾`
    
    if (phone) {
      // Limpiar el teléfono de espacios o guiones (ej: +54 9 11 1234-5678 -> 5491112345678)
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`, '_blank')
    } else {
      // Si no hay teléfono registrado, solo abre WhatsApp para que elijas el contacto
      window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank')
    }
  }

  return (
    <button 
      onClick={handleSend}
      title="Enviar recordatorio de pago por WhatsApp"
      className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
    >
      <MessageCircle className="h-4 w-4" />
    </button>
  )
}

// 2. Botón para compartir un partido al Grupo del Torneo o Jugadores
export function BotonWhatsAppPartido({
  torneoName,
  roundName,
  team1,
  team2
}: {
  torneoName: string,
  roundName: string,
  team1: any,
  team2: any
}) {
  const team1Name = `${team1.player1.first_name} ${team1.player1.last_name} / ${team1.player2 ? team1.player2.first_name + ' ' + team1.player2.last_name : ''}`
  const team2Name = team2 ? `${team2.player1.first_name} ${team2.player1.last_name} / ${team2.player2 ? team2.player2.first_name + ' ' + team2.player2.last_name : ''}` : 'BYE'
  
  const mensaje = `🏆 *${torneoName}* - ${roundName}\n\n🎾 *${team1Name}*\n🆚 *${team2Name}*\n\n📍 Confirmen horario en el club.`

  const handleSendGroup = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const handleSendPlayer = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const players = [
    { ...team1.player1, teamName: 'Pareja 1' },
    team1.player2 ? { ...team1.player2, teamName: 'Pareja 1' } : null,
    team2 ? { ...team2.player1, teamName: 'Pareja 2' } : null,
    team2 && team2.player2 ? { ...team2.player2, teamName: 'Pareja 2' } : null
  ].filter(Boolean)

  return (
    <Dialog>
      <DialogTrigger 
        type="button"
        title="Avisar por WhatsApp"
        className="flex-none flex items-center justify-center gap-1.5 text-xs font-semibold bg-green-500 text-white py-1.5 px-3 rounded-md hover:bg-green-600 shadow-sm transition-colors whitespace-nowrap"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Avisar
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs p-4">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Notificar Partido
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleSendGroup}
            className="flex items-center gap-3 bg-muted/50 hover:bg-muted p-2 rounded-lg text-sm text-left transition-colors border"
          >
            <div className="bg-background p-1.5 rounded-full border shadow-sm">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-bold">Avisar al Grupo</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Elegir un grupo genérico</p>
            </div>
          </button>
          
          <div className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">Mensaje Directo</div>
          <div className="flex flex-col gap-1.5">
            {players.map((p: any, i: number) => (
              <button
                key={i}
                onClick={() => p.phone ? handleSendPlayer(p.phone) : handleSendGroup()}
                className="flex items-center justify-between bg-green-50/50 hover:bg-green-100 p-2 rounded-lg text-sm text-left transition-colors border border-green-100 group"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-green-800 text-xs">{p.first_name} {p.last_name}</span>
                  <span className="text-[10px] text-green-600/70">{p.teamName}</span>
                </div>
                {p.phone ? (
                  <MessageCircle className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                ) : (
                  <span className="text-[9px] text-muted-foreground uppercase font-bold bg-background px-1.5 py-0.5 rounded border">Sin cel</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 3. Botón para promocionar el torneo
export function BotonWhatsAppPromo({ torneoName }: { torneoName: string }) {
  const handleSend = () => {
    const mensaje = `🔥 ¡Se abrieron las inscripciones para el torneo *${torneoName}*!\n\nNo te quedes sin tu cupo. Inscríbete en el club o respondiendo este mensaje. 🎾🏆`
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
    <button 
      onClick={handleSend}
      className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md font-bold shadow-md transition-transform hover:-translate-y-0.5"
    >
      <MessageCircle className="h-4 w-4" />
      Promocionar
    </button>
  )
}

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
        className="flex-none flex items-center justify-center gap-1.5 text-xs font-semibold bg-green-500 text-black py-1.5 px-3 rounded-md hover:bg-green-600 shadow-sm transition-colors whitespace-nowrap"
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

export function BotonWhatsAppPromo({ 
  torneoName, 
  jugadores 
}: { 
  torneoName: string, 
  jugadores: any[] 
}) {
  const mensaje = `🔥 ¡Se abrieron las inscripciones para el torneo *${torneoName}*!\n\nNo te quedes sin tu cupo. Inscríbete en el club o respondiendo este mensaje. 🎾🏆`
  
  const handleSendGeneric = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const handleSendPlayer = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
    <Dialog>
      <DialogTrigger 
        type="button"
        className="flex items-center gap-2 bg-green-600 text-black hover:bg-green-700 px-4 py-2 rounded-md font-bold shadow-md transition-transform hover:-translate-y-0.5"
      >
        <MessageCircle className="h-4 w-4" />
        Promocionar
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Promocionar Torneo
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 flex flex-col gap-4">
          <button 
            onClick={handleSendGeneric}
            className="flex items-center gap-3 bg-muted/50 hover:bg-muted p-3 rounded-lg text-sm text-left transition-colors border shadow-sm group"
          >
            <div className="bg-background p-2 rounded-full border shadow-sm group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-base">Elegir Contacto o Grupo</p>
              <p className="text-xs text-muted-foreground mt-0.5">Abre WhatsApp para seleccionar a quién enviar</p>
            </div>
          </button>
          
          <div className="flex flex-col">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Jugadores del Club</div>
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              {jugadores && jugadores.length > 0 ? (
                jugadores.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => p.phone ? handleSendPlayer(p.phone) : handleSendGeneric()}
                    className="flex items-center justify-between bg-green-50/30 hover:bg-green-100 p-2.5 rounded-lg text-sm text-left transition-colors border border-green-100/50 group"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-green-900 text-sm">{p.first_name} {p.last_name}</span>
                      <span className="text-xs text-green-700/70">{p.phone || 'Sin teléfono guardado'}</span>
                    </div>
                    {p.phone ? (
                      <MessageCircle className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold bg-background px-1.5 py-0.5 rounded border">Sin cel</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic p-4 text-center border rounded-lg bg-muted/20">
                  No hay jugadores agendados en el club.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
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
  const [selectedPhones, setSelectedPhones] = useState<string[]>([])
  const [sendingIndex, setSendingIndex] = useState<number>(-1)
  
  const mensaje = `🔥 ¡Se abrieron las inscripciones para el torneo *${torneoName}*!\n\nNo te quedes sin tu cupo. Inscríbete en el club o respondiendo este mensaje. 🎾🏆`
  
  const validJugadores = jugadores?.filter(p => p.phone) || []
  
  const handleSendGeneric = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const toggleSelect = (phone: string) => {
    setSelectedPhones(prev => 
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    )
  }

  const selectAll = () => {
    if (selectedPhones.length === validJugadores.length) {
      setSelectedPhones([])
    } else {
      setSelectedPhones(validJugadores.map(p => p.phone))
    }
  }

  const startSending = () => {
    if (selectedPhones.length === 0) return
    setSendingIndex(0)
    sendTo(selectedPhones[0])
  }
  
  const sendNext = () => {
    const nextIdx = sendingIndex + 1
    if (nextIdx < selectedPhones.length) {
      setSendingIndex(nextIdx)
      sendTo(selectedPhones[nextIdx])
    } else {
      setSendingIndex(-1) // Terminado
      setSelectedPhones([]) // Limpiar
    }
  }

  const sendTo = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        setSendingIndex(-1)
        setSelectedPhones([])
      }
    }}>
      <DialogTrigger className="flex items-center gap-2 bg-green-600 text-black hover:bg-green-700 px-4 py-2 rounded-md font-bold shadow-md transition-transform hover:-translate-y-0.5 outline-none">
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
              <p className="font-bold text-base">Reenviar a Contactos/Grupos</p>
              <p className="text-xs text-muted-foreground mt-0.5">Abre WhatsApp vacío para que elijas a quién reenviar</p>
            </div>
          </button>
          
          <div className="flex flex-col border rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center justify-between bg-muted/50 p-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">Jugadores del Club</span>
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {validJugadores.length}
                </span>
              </div>
              
              {validJugadores.length > 0 && (
                <button 
                  onClick={selectAll}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {selectedPhones.length === validJugadores.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                </button>
              )}
            </div>
            
            <div className="flex flex-col max-h-[250px] overflow-y-auto bg-background p-1">
              {jugadores && jugadores.length > 0 ? (
                jugadores.map((p: any) => {
                  const hasPhone = !!p.phone;
                  const isSelected = hasPhone && selectedPhones.includes(p.phone);
                  
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? 'bg-primary/5 border-primary/20' : 'border-transparent'} ${!hasPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input 
                        type="checkbox"
                        disabled={!hasPhone}
                        checked={isSelected}
                        onChange={() => hasPhone && toggleSelect(p.phone)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-sm flex items-center gap-2">
                          {p.first_name} {p.last_name}
                          <span className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md text-[10px] font-bold border">
                            {p.category}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                          {p.phone || 'Sin número registrado'}
                        </span>
                      </div>
                      {hasPhone && (
                        <MessageCircle className={`h-4 w-4 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/30'}`} />
                      )}
                    </label>
                  )
                })
              ) : (
                <div className="text-sm text-muted-foreground italic p-4 text-center">
                  No hay jugadores registrados con número.
                </div>
              )}
            </div>
            
            {/* Action Bar (Queue) */}
            {selectedPhones.length > 0 && (
              <div className="p-3 bg-muted border-t flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  {selectedPhones.length} {selectedPhones.length === 1 ? 'seleccionado' : 'seleccionados'}
                </span>
                
                {sendingIndex === -1 ? (
                  <button
                    onClick={startSending}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-bold hover:bg-primary/90 transition-transform active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar WhatsApp
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary">
                      {sendingIndex + 1} de {selectedPhones.length}
                    </span>
                    <button
                      onClick={sendNext}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-bold hover:bg-green-700 transition-transform active:scale-95"
                    >
                      {sendingIndex + 1 < selectedPhones.length ? 'Siguiente ->' : 'Finalizar'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

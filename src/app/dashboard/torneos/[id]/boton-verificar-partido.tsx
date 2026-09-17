'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle2, MessageCircle, Send, BadgeCheck } from 'lucide-react'
import { toggleVerificado } from './actions'

type Player = {
  first_name: string
  last_name: string
  phone: string | null
}

type Team = {
  id: string
  player1: Player
  player2: Player | null
}

export function BotonVerificarPartido({ 
  matchId, 
  tournamentId,
  torneoName,
  roundName,
  winner,
  loser,
  isVerified = false,
  setsData = []
}: { 
  matchId: string, 
  tournamentId: string,
  torneoName: string,
  roundName: string,
  winner: Team,
  loser: Team,
  isVerified?: boolean,
  setsData?: any[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleVerified = async () => {
    setLoading(true)
    await toggleVerificado(matchId, !isVerified, tournamentId)
    setLoading(false)
    setOpen(false)
  }

  const generateWaLink = (phone: string, playerName: string) => {
    if (!phone) return '#'
    
    // Formatear el resultado de los sets
    let setsText = ''
    if (setsData && setsData.length > 0) {
      setsText = setsData.map(s => {
        // Asumiendo que s.t1 es de team1 y s.t2 es de team2.
        // Necesitamos saber los puntos del ganador y del perdedor.
        // Como no tenemos el detalle de quién es team1 y team2 aquí, lo simplificamos:
        return `${s.t1}-${s.t2}`
      }).join(' / ')
    }

    const winnerName = `${winner.player1.first_name} ${winner.player1.last_name}` + (winner.player2 ? ` y ${winner.player2.first_name} ${winner.player2.last_name}` : '')
    
    let text = `Hola ${playerName}! Se cargó el resultado de tu partido de ${roundName || 'Fase de Grupos'} en el torneo *${torneoName}*.\n\n`
    text += `Ganaron *${winnerName}*`
    if (setsText) {
      text += ` por ${setsText}`
    }
    text += `.\n\n¿Me confirmas si este resultado es correcto?`
    
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        type="button"
        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 px-2 rounded-md transition-all border shadow-sm ${
          isVerified 
          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800' 
          : 'bg-background text-muted-foreground border-muted-foreground/30 hover:bg-muted hover:text-foreground'
        }`}
      >
        {isVerified ? (
          <>
            <BadgeCheck className="h-4 w-4" />
            Verificado
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Verificar
          </>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Verificar Resultado
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 mt-2">
          
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Solicitar confirmación por WhatsApp a los perdedores:</p>
            <div className="grid grid-cols-1 gap-2">
              <a 
                href={generateWaLink(loser.player1.phone || '', loser.player1.first_name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (!loser.player1.phone) {
                    alert('Este jugador no tiene teléfono registrado')
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-md border ${loser.player1.phone ? 'hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer group' : 'bg-muted/50 opacity-60 cursor-not-allowed'}`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{loser.player1.first_name} {loser.player1.last_name}</span>
                  <span className="text-xs text-muted-foreground">{loser.player1.phone || 'Sin teléfono'}</span>
                </div>
                <MessageCircle className={`h-5 w-5 ${loser.player1.phone ? 'text-green-600 group-hover:scale-110 transition-transform' : 'text-muted-foreground'}`} />
              </a>

              {loser.player2 && (
                <a 
                  href={generateWaLink(loser.player2.phone || '', loser.player2.first_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (!loser.player2.phone) {
                      alert('Este jugador no tiene teléfono registrado')
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-md border ${loser.player2.phone ? 'hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer group' : 'bg-muted/50 opacity-60 cursor-not-allowed'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{loser.player2.first_name} {loser.player2.last_name}</span>
                    <span className="text-xs text-muted-foreground">{loser.player2.phone || 'Sin teléfono'}</span>
                  </div>
                  <MessageCircle className={`h-5 w-5 ${loser.player2.phone ? 'text-green-600 group-hover:scale-110 transition-transform' : 'text-muted-foreground'}`} />
                </a>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <button 
              onClick={handleToggleVerified}
              disabled={loading}
              className={`w-full py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                isVerified 
                ? 'bg-muted text-foreground hover:bg-muted/80' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              <BadgeCheck className="h-5 w-5" />
              {isVerified ? 'Quitar Marca de Verificado' : 'Marcar como Verificado Manualmente'}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Haz clic aquí si los jugadores confirmaron en persona o ya te respondieron el mensaje.
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

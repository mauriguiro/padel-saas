'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Phone, Mail, IdCard, Trophy } from 'lucide-react'

export function PlayerDetailsModal({ 
  jugador, 
  children 
}: { 
  jugador: any, 
  children: React.ReactNode 
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-left outline-none w-full max-w-full">
          {children}
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary">
            {jugador.first_name} {jugador.last_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-2">
          {/* Categoría y Género */}
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Categoría</span>
              <span className="font-bold">{jugador.category}</span>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Rama</span>
              <span className="font-bold">{jugador.gender}</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg text-primary">Puntos:</span>
            </div>
            <span className="font-black text-2xl text-primary">{jugador.points || 0}</span>
          </div>

          {/* Datos Personales */}
          <div className="flex flex-col gap-3 p-3 bg-muted/20 border rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Teléfono</span>
                <span className="text-sm font-semibold">{jugador.phone || 'No registrado'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <IdCard className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">DNI</span>
                <span className="text-sm font-semibold">{jugador.dni || 'No registrado'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Email</span>
                <span className="text-sm font-semibold">{jugador.email || 'No registrado'}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

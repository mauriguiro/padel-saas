'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ActualizarClavePage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Supabase parsea automáticamente el token de la URL (#access_token=...) y crea la sesión en el navegador
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Listo para cambiar
      }
    })
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Hubo un error al actualizar la contraseña. El enlace podría haber caducado.')
    } else {
      setMessage('¡Contraseña actualizada exitosamente! Ya puedes ir al Inicio.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-500">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-foreground">Elige tu Nueva Contraseña</CardTitle>
          <CardDescription>
            Escribe una contraseña segura que puedas recordar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium text-sm">
                {message}
              </div>
              <a href="/dashboard" className="text-primary font-bold hover:underline bg-primary/10 py-2 rounded-md">
                Ir al Panel de Control
              </a>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  minLength={6}
                />
              </div>

              {error && (
                <p className="p-3 bg-destructive/10 text-destructive text-center text-sm rounded-md font-medium">
                  {error}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 text-white hover:bg-green-700 py-2.5 rounded-md font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

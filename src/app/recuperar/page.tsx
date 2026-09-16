import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RecuperarPage({
  searchParams,
}: {
  searchParams: { message: string, success?: string }
}) {
  const sendRecoveryEmail = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/actualizar-clave`,
    })

    if (error) {
      return redirect('/recuperar?message=No pudimos enviar el correo. Revisa que esté bien escrito.')
    }

    return redirect('/recuperar?success=Te hemos enviado un correo con el enlace para restablecer tu contraseña.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-foreground">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace seguro para crear una nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.success ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium text-sm">
                {searchParams.success}
              </div>
              <a href="/login" className="text-primary font-bold hover:underline">Volver a Iniciar Sesión</a>
            </div>
          ) : (
            <form action={sendRecoveryEmail} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input name="email" type="email" placeholder="tu@correo.com" required />
              </div>

              {searchParams?.message && (
                <p className="p-3 bg-destructive/10 text-destructive text-center text-sm rounded-md font-medium">
                  {searchParams.message}
                </p>
              )}

              <div className="flex flex-col gap-3 mt-2">
                <button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-md font-bold shadow-sm transition-colors">
                  Enviar Correo de Recuperación
                </button>
                <a href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
                  Volver atrás
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

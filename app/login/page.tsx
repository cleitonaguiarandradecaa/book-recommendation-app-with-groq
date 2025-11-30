"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")
  const { login, register } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("El email es requerido")
      return
    }

    if (isRegister && !name.trim()) {
      setError("El nombre es requerido")
      return
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido")
      return
    }

    try {
      if (isRegister) {
        register(email, name)
      } else {
        // Para login, verificar se o usuário existe
        const userData = localStorage.getItem("lector_user_data")
        if (!userData) {
          setError("No existe una cuenta con este email. Por favor regístrate.")
          return
        }
        login(email, name || "Usuario")
      }

      // Redirigir al onboarding o home según corresponda
      router.push("/")
    } catch (err) {
      setError("Ocurrió un error. Por favor intenta de nuevo.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-10 w-10 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {isRegister ? "Crear cuenta" : "Iniciar sesión"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isRegister
                ? "Comienza tu viaje literario"
                : "Bienvenido de vuelta a Lector"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full rounded-full">
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </Button>
        </form>

        {/* Toggle Register/Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError("")
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isRegister
              ? "¿Ya tienes una cuenta? Inicia sesión"
              : "¿No tienes una cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Sparkles } from "lucide-react"

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Bienvenido a Lector</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Tu asistente personal para descubrir libros increíbles y crear hábitos de lectura
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-3 rounded-2xl bg-card p-4 text-left shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-medium text-card-foreground">Recomendaciones personalizadas</h3>
              <p className="text-sm text-muted-foreground">Libros adaptados a tus gustos e intereses</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-card p-4 text-left shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
              <BookOpen className="h-5 w-5 text-[color:var(--success)]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-medium text-card-foreground">Planes de lectura inteligentes</h3>
              <p className="text-sm text-muted-foreground">Organiza tu tiempo y alcanza tus metas</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Button onClick={onNext} size="lg" className="w-full rounded-full text-base font-medium shadow-lg">
            Comenzar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">Solo te tomará un minuto configurar tu perfil</p>
      </div>
    </div>
  )
}

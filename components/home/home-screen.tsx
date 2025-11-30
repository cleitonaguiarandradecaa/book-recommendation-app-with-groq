"use client"
import { BookOpen, MessageSquare, Target, User, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"

export function HomeScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Lector</h1>
            <p className="text-sm text-muted-foreground">¡Buen día, Ana!</p>
          </div>
          <Link href="/profile">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
              <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Assistant Card */}
          <Link href="/chat">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-success/10 p-6 transition-all hover:shadow-lg">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-sm">
                  <Sparkles className="h-7 w-7 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-semibold">¿Qué te gustaría leer hoy?</h2>
                  <p className="text-sm text-muted-foreground">
                    Pregúntame cualquier cosa sobre libros o pídeme recomendaciones personalizadas
                  </p>
                  <div className="flex gap-2 pt-2">
                    <div className="rounded-full bg-background/60 px-3 py-1 text-xs font-medium">Recomendaciones</div>
                    <div className="rounded-full bg-background/60 px-3 py-1 text-xs font-medium">Planes de lectura</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/recommendations">
              <button className="flex flex-col items-start gap-3 rounded-2xl bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:scale-[0.98]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold">Recomendaciones</h3>
                  <p className="text-xs text-muted-foreground">Ver sugerencias</p>
                </div>
              </button>
            </Link>

            <Link href="/reading-plan">
              <button className="flex flex-col items-start gap-3 rounded-2xl bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:scale-[0.98]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Target className="h-6 w-6 text-[color:var(--success)]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold">Plan de Lectura</h3>
                  <p className="text-xs text-muted-foreground">Ver progreso</p>
                </div>
              </button>
            </Link>
          </div>

          {/* Reading Progress */}
          <div className="space-y-4 rounded-3xl bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tu progreso de lectura</h3>
              <TrendingUp className="h-5 w-5 text-success" strokeWidth={1.5} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Esta semana</span>
                <span className="font-medium">2 de 5 días</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[40%] rounded-full bg-success transition-all" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">3</p>
                  <p className="text-xs text-muted-foreground">Libros este mes</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">47</p>
                  <p className="text-xs text-muted-foreground">Páginas hoy</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">8h</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Reading */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leyendo ahora</h3>
            <div className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm">
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src="/fantasy-book-cover.png" alt="Portada del libro" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-semibold">El Nombre del Viento</h4>
                  <p className="text-sm text-muted-foreground">Patrick Rothfuss</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">234/722 páginas</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[32%] rounded-full bg-primary transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t bg-background">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button className="flex flex-col items-center gap-1 rounded-xl py-3 bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">Inicio</span>
          </button>
          <Link
            href="/chat"
            className="flex flex-col items-center gap-1 rounded-xl py-3 text-muted-foreground hover:bg-muted transition-colors"
          >
            <MessageSquare className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">Chat</span>
          </Link>
          <Link
            href="/reading-plan"
            className="flex flex-col items-center gap-1 rounded-xl py-3 text-muted-foreground hover:bg-muted transition-colors"
          >
            <Target className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">Plan</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 rounded-xl py-3 text-muted-foreground hover:bg-muted transition-colors"
          >
            <User className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

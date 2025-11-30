"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Edit3, BookOpen, Target, Heart, Settings, ChevronRight, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const stats = [
  { label: "Libros leídos", value: "47", icon: BookOpen, color: "text-primary" },
  { label: "Racha actual", value: "12 días", icon: Target, color: "text-success" },
  { label: "Favoritos", value: "23", icon: Heart, color: "text-[color:var(--chart-4)]" },
]

const preferences = [
  { label: "Fantasía", selected: true },
  { label: "Ciencia Ficción", selected: true },
  { label: "Misterio", selected: true },
  { label: "Romance", selected: false },
  { label: "Psicología", selected: true },
]

export default function ProfilePage() {
  const { user, onboarding, logout } = useAuth()
  const router = useRouter()
  const userName = user?.name || "Usuario"
  const userInitial = userName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold">Perfil</h1>
          <Link href="/settings">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <Settings className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl">
          {/* Profile Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-success/10 px-6 py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-semibold shadow-lg">
                {userInitial}
              </div>
              <h2 className="text-2xl font-bold">{userName}</h2>
              <p className="mt-1 text-muted-foreground">{user?.email}</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Edit3 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Editar perfil
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="rounded-2xl bg-card p-4 text-center shadow-sm">
                    <Icon className={`mx-auto mb-2 h-6 w-6 ${stat.color}`} strokeWidth={1.5} />
                    <p className="text-xl font-semibold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Reading Preferences */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preferencias Literarias</h3>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Edit3 className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {preferences.map((pref, index) => (
                  <span
                    key={index}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      pref.selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pref.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Reading Info */}
            <div className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
              <h3 className="font-semibold">Información de Lectura</h3>
              <div className="space-y-3">
                {onboarding ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tiempo disponible</span>
                      <span className="text-sm font-medium">{onboarding.readingTime} min/día</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Nivel de lectura</span>
                      <span className="text-sm font-medium">
                        {onboarding.readerLevel === "beginner"
                          ? "Principiante"
                          : onboarding.readerLevel === "intermediate"
                            ? "Intermedio"
                            : "Avanzado"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Géneros favoritos</span>
                      <span className="text-sm font-medium">{onboarding.interests.length} géneros</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Completa el onboarding para ver tu información</p>
                )}
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full rounded-full bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Cerrar sesión
              </Button>
            </div>

            {/* Saved Books */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Libros Guardados</h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <button
                    key={i}
                    className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={`/abstract-book-cover.png?height=128&width=96&query=book cover ${i}`}
                        alt="Book cover"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Libro guardado {i}</h4>
                      <p className="text-sm text-muted-foreground">Autor del libro</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>

            {/* Books Read */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Libros Completados</h3>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="overflow-hidden rounded-lg bg-muted shadow-sm">
                    <img
                      src={`/open-book-library.png?height=160&width=120&query=book ${i}`}
                      alt="Book cover"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full rounded-full bg-transparent">
                Ver todos los libros leídos
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

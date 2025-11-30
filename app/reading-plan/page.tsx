"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, TrendingUp, Target, Edit3, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import type { ReadingPlan } from "@/lib/auth"

export default function ReadingPlanPage() {
  const { readingPlans } = useAuth()
  const [plans, setPlans] = useState<ReadingPlan[]>([])

  useEffect(() => {
    setPlans(readingPlans || [])
  }, [readingPlans])

  // Calcular estatísticas gerais
  const totalProgress = plans.length > 0
    ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length)
    : 0
  const totalPagesRead = plans.reduce((sum, p) => sum + p.currentPage, 0)
  const totalBooks = plans.length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Plan de Lectura</h1>
              <p className="text-xs text-muted-foreground">
                {totalBooks} {totalBooks === 1 ? "libro activo" : "libros activos"}
              </p>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
            <Edit3 className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Overall Progress */}
          <div className="rounded-3xl bg-gradient-to-br from-success/10 to-primary/10 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Progreso General</h2>
              <TrendingUp className="h-5 w-5 text-success" strokeWidth={1.5} />
            </div>

            {/* Circular Progress */}
            <div className="flex items-center justify-between">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - totalProgress / 100)}`}
                    className="text-success transition-all"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{totalProgress}%</span>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-2xl font-semibold">{totalBooks}</p>
                  <p className="text-sm text-muted-foreground">Libros activos</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalPagesRead}</p>
                  <p className="text-sm text-muted-foreground">Páginas leídas</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalProgress}%</p>
                  <p className="text-sm text-muted-foreground">Progreso general</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{plans.filter(p => p.progress === 100).length}</p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Books in Plan */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tus Libros</h2>
            {plans.length === 0 ? (
              <div className="rounded-3xl bg-card p-8 text-center shadow-sm">
                <p className="text-muted-foreground">No tienes libros en tu plan de lectura aún.</p>
                <Link href="/recommendations">
                  <Button variant="outline" className="mt-4">
                    Ver recomendaciones
                  </Button>
                </Link>
              </div>
            ) : (
              plans.map((plan) => (
                <Link key={plan.id} href={`/reading-plan/${plan.id}`}>
                  <div className="overflow-hidden rounded-3xl bg-card shadow-sm transition-all hover:shadow-md cursor-pointer">
                    <div className="flex gap-4 p-5">
                      {plan.cover && (
                        <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
                          <img
                            src={plan.cover}
                            alt={plan.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold leading-tight hover:text-primary transition-colors">
                            {plan.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{plan.author}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="font-medium">
                              {plan.currentPage}/{plan.totalPages || 0} páginas
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                          {plan.steps && (
                            <p className="text-xs text-muted-foreground">
                              {plan.steps.filter(s => s.completed).length} de {plan.steps.length} etapas completadas
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>


          {/* Reminder Settings */}
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <h3 className="mb-3 font-semibold">Recordatorios</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recordatorio diario</p>
                  <p className="text-xs text-muted-foreground">20:00</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

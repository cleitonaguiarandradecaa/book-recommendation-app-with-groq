"use client"
import { useEffect } from "react"
import { BookOpen, MessageSquare, Target, User, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function HomeScreen() {
  const { user, recommendations, readingPlans, isInReadingPlan, refreshReadingPlans } = useAuth()
  const userName = user?.name || "Usuario"
  const greeting = `¡Buen día, ${userName.split(" ")[0]}!`
  
  // Atualizar planos quando o componente montar
  useEffect(() => {
    refreshReadingPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Apenas na montagem inicial
  
  // IDs dos livros mock
  const MOCK_BOOK_IDS = ["1", "2", "3"]
  
  // Contar total de recomendações disponíveis (mock + do usuário, excluindo os que estão no plano)
  const mockRecommendations = MOCK_BOOK_IDS.filter((id) => !isInReadingPlan(id))
  const userRecommendations = (recommendations || []).filter((rec) => !isInReadingPlan(String(rec.id)))
  const totalRecommendations = mockRecommendations.length + userRecommendations.length

  // Filtrar livros do plano de leitura que não estão concluídos (progress < 100), ordenados por progresso (maior primeiro)
  const activeReadingPlans = (readingPlans || [])
    .filter((plan) => plan.progress < 100) // Apenas livros não concluídos (inclui progresso 0)
    .sort((a, b) => {
      // Ordenar por progresso (maior primeiro), mas se progresso for igual, ordenar por data de adição (mais recente primeiro)
      if (b.progress !== a.progress) {
        return b.progress - a.progress
      }
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    })
  
  const currentBook = activeReadingPlans.length > 0 ? activeReadingPlans[0] : null // Pegar o livro com maior progresso

  // Calcular estatísticas de progresso de leitura
  const totalBooks = readingPlans?.length || 0
  const totalPagesRead = readingPlans?.reduce((sum, plan) => sum + (plan.currentPage || 0), 0) || 0
  const completedBooks = readingPlans?.filter((plan) => plan.progress === 100).length || 0
  const averageProgress = readingPlans && readingPlans.length > 0
    ? Math.round(readingPlans.reduce((sum, plan) => sum + plan.progress, 0) / readingPlans.length)
    : 0

  // Calcular dias da semana atual com atividade de leitura (baseado em etapas completadas nesta semana)
  const getDaysThisWeek = () => {
    if (!readingPlans || readingPlans.length === 0) return 0
    
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo
    startOfWeek.setHours(0, 0, 0, 0)
    
    const daysWithActivity = new Set<string>()
    
    // Percorrer todos os planos e suas etapas
    readingPlans.forEach((plan) => {
      if (plan.steps) {
        plan.steps.forEach((step) => {
          if (step.completed && step.completedAt) {
            const completedDate = new Date(step.completedAt)
            // Verificar se foi completada nesta semana
            if (completedDate >= startOfWeek && completedDate <= today) {
              // Adicionar a data única (YYYY-MM-DD) para contar dias distintos
              const dateKey = completedDate.toISOString().split('T')[0]
              daysWithActivity.add(dateKey)
            }
          }
        })
      }
    })
    
    return daysWithActivity.size
  }
  
  const daysThisWeek = getDaysThisWeek()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Lector</h1>
            <p className="text-sm text-muted-foreground">{greeting}</p>
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
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            <Link href="/recommendations">
              <button className="flex flex-col items-start gap-3 rounded-2xl bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:scale-[0.98] relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Recomendaciones</h3>
                    {totalRecommendations > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                        {totalRecommendations}
                      </span>
                    )}
                  </div>
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
                <span className="font-medium">{daysThisWeek} de 7 días</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-success transition-all" 
                  style={{ width: `${Math.round((daysThisWeek / 7) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">{totalBooks}</p>
                  <p className="text-xs text-muted-foreground">Libros en plan</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">{totalPagesRead}</p>
                  <p className="text-xs text-muted-foreground">Páginas leídas</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">{completedBooks}</p>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Reading */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leyendo ahora</h3>
            {currentBook ? (
              <Link href={`/reading-plan/${currentBook.id}`}>
                <div className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md cursor-pointer">
                  {currentBook.cover ? (
                    <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img src={currentBook.cover} alt={currentBook.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold hover:text-primary transition-colors">{currentBook.title}</h4>
                      <p className="text-sm text-muted-foreground">{currentBook.author}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">
                          {currentBook.currentPage}/{currentBook.totalPages || 0} páginas ({currentBook.progress}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full rounded-full bg-primary transition-all" 
                          style={{ width: `${currentBook.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm">
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-muted-foreground">No hay libros en progreso</h4>
                    <p className="text-sm text-muted-foreground">Agrega un libro a tu plan de lectura para comenzar</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}

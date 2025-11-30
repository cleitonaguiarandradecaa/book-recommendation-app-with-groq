import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, TrendingUp, Target, Edit3 } from "lucide-react"
import Link from "next/link"

const planBooks = [
  {
    id: 1,
    title: "El Nombre del Viento",
    author: "Patrick Rothfuss",
    progress: 32,
    currentPage: 234,
    totalPages: 722,
    daysLeft: 12,
    cover: "/fantasy-book-red.jpg",
  },
  {
    id: 2,
    title: "El Marciano",
    author: "Andy Weir",
    progress: 0,
    currentPage: 0,
    totalPages: 384,
    daysLeft: 20,
    cover: "/scifi-book-orange.jpg",
  },
]

const schedule = [
  { day: "Lunes", pages: "30-60", completed: true },
  { day: "Martes", pages: "61-90", completed: true },
  { day: "Miércoles", pages: "91-120", completed: false },
  { day: "Jueves", pages: "121-150", completed: false },
  { day: "Viernes", pages: "151-180", completed: false },
]

export default function ReadingPlanPage() {
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
              <p className="text-xs text-muted-foreground">2 libros activos</p>
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
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.4)}`}
                    className="text-success transition-all"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">40%</span>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-2xl font-semibold">12</p>
                  <p className="text-sm text-muted-foreground">Días restantes</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">234</p>
                  <p className="text-sm text-muted-foreground">Páginas leídas</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">5/7</p>
                  <p className="text-sm text-muted-foreground">Días esta semana</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">47</p>
                  <p className="text-sm text-muted-foreground">Promedio/día</p>
                </div>
              </div>
            </div>
          </div>

          {/* Books in Plan */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tus Libros</h2>
            {planBooks.map((book) => (
              <div key={book.id} className="overflow-hidden rounded-3xl bg-card shadow-sm">
                <div className="flex gap-4 p-5">
                  <Link href={`/book/${book.id}`}>
                    <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 space-y-3">
                    <div>
                      <Link href={`/book/${book.id}`}>
                        <h3 className="font-semibold leading-tight hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">
                          {book.currentPage}/{book.totalPages} páginas
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{book.daysLeft} días restantes</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Cronograma Semanal</h2>
              <Calendar className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-2xl p-4 transition-all ${
                    item.completed ? "bg-success/10 border border-success/20" : "bg-card border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        item.completed ? "bg-success text-success-foreground" : "bg-muted"
                      }`}
                    >
                      {item.completed ? (
                        <Target className="h-5 w-5" strokeWidth={1.5} />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.day}</p>
                      <p className="text-sm text-muted-foreground">Páginas {item.pages}</p>
                    </div>
                  </div>
                  {!item.completed && (
                    <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                      Marcar como leído
                    </Button>
                  )}
                </div>
              ))}
            </div>
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

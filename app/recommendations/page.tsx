"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BookmarkPlus, Info, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"
import type { Recommendation } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Recomendaciones mock iniciais
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    title: "El Nombre del Viento",
    author: "Patrick Rothfuss",
    genre: "Fantasía",
    pages: 722,
    reason: "Porque te gustan las historias épicas y complejas",
    level: "Intermedio",
    cover: "/fantasy-book-cover-red.jpg",
  },
  {
    id: "2",
    title: "Cien Años de Soledad",
    author: "Gabriel García Márquez",
    genre: "Realismo mágico",
    pages: 471,
    reason: "Por tu interés en historias profundas con múltiples generaciones",
    level: "Avanzado",
    cover: "/classic-literature-book-cover-yellow.jpg",
  },
  {
    id: "3",
    title: "La Guía del Autoestopista Galáctico",
    author: "Douglas Adams",
    genre: "Ciencia ficción / Humor",
    pages: 384,
    reason: "Combina ciencia ficción con humor, ideal para tus gustos relajados",
    level: "Intermedio",
    cover: "/science-fiction-book-cover-orange.jpg",
  },
]

export default function RecommendationsPage() {
  const { user, recommendations, removeRecommendation, isInReadingPlan, readingPlans, addToReadingPlan, refreshReadingPlans } = useAuth()
  const [books, setBooks] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRecommendations = () => {
      try {
        // Combinar recomendações mock com as do usuário
        const allRecommendations = [
          ...MOCK_RECOMMENDATIONS,
          ...recommendations.map((r) => ({
            ...r,
            id: String(r.id),
          })),
        ]
        
        // Filtrar livros que já estão no plano de leitura
        const filteredRecommendations = allRecommendations.filter((book) => {
          return !isInReadingPlan(String(book.id))
        })
        
        setBooks(filteredRecommendations)
      } catch (e) {
        console.error(e)
        setError("No se pudieron cargar las recomendaciones.")
        // Em caso de erro, mostrar apenas as mock (também filtrando as que estão no plano)
        const filteredMock = MOCK_RECOMMENDATIONS.filter((book) => {
          return !isInReadingPlan(String(book.id))
        })
        setBooks(filteredMock)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, recommendations, readingPlans]) // Recarregar quando o usuário, recomendações ou planos mudarem

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Recomendaciones</h1>
            <p className="text-xs text-muted-foreground">Seleccionadas para ti</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {loading && (
            <p className="text-sm text-muted-foreground">Cargando recomendaciones...</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && !error && books.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay recomendaciones disponibles por el momento.
            </p>
          )}

          {books.map((book) => {
            // Verificar se é um livro mock (IDs "1", "2", "3") ou do usuário
            const isMockBook = ["1", "2", "3"].includes(String(book.id))
            const canRemove = !isMockBook

            return (
              <div key={book.id} className="overflow-hidden rounded-3xl bg-card shadow-sm">
                <div className="flex gap-4 p-4">
                  <Link href={`/book/${String(book.id)}`} className="shrink-0">
                    <div className="h-40 w-28 overflow-hidden rounded-xl bg-muted shadow-md transition-transform hover:scale-105">
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="space-y-2">
                      <Link href={`/book/${String(book.id)}`}>
                        <h3 className="font-semibold leading-tight hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {book.author} · {book.genre}{book.pages ? ` · ${book.pages} páginas` : ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {book.reason && (
                          <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs text-[color:var(--success)]">
                            {book.reason}
                          </span>
                        )}
                        {book.level && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            Nivel: {book.level}
                          </span>
                        )}
                        {book.price && (
                          <span className="inline-flex items-center rounded-full bg-[color:var(--chart-3)]/10 px-2 py-1 text-xs text-[color:var(--chart-3)]">
                            {new Intl.NumberFormat("es-ES", {
                              style: "currency",
                              currency: book.price.currency,
                            }).format(book.price.amount)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/book/${String(book.id)}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Info className="h-4 w-4" />
                          Ver detalles
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={isInReadingPlan(String(book.id))}
                        onClick={async () => {
                          try {
                            const added = addToReadingPlan(book)
                            if (added) {
                              // Atualizar o contexto
                              refreshReadingPlans()
                              // Remover o livro da lista local
                              setBooks((prev) => prev.filter((b) => b.id !== book.id))
                              toast({
                                title: "Agregado al plan",
                                description: `${book.title} ha sido agregado a tu plan de lectura`,
                              })
                            } else {
                              toast({
                                title: "Error",
                                description: "El libro ya está en tu plan de lectura o no se pudo agregar",
                                variant: "destructive",
                              })
                            }
                          } catch (error) {
                            console.error("Error agregando al plan:", error)
                            toast({
                              title: "Error",
                              description: "No se pudo agregar el libro al plan",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        {isInReadingPlan(String(book.id)) ? "Agregado al plan" : "Agregar al plan"}
                      </Button>
                      {book.buyLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(book.buyLink, "_blank")}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Comprar libro
                        </Button>
                      )}
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            const removed = removeRecommendation(String(book.id))
                            if (removed) {
                              // Atualizar lista local removendo o livro
                              setBooks((prev) => prev.filter((b) => b.id !== book.id))
                              toast({
                                title: "Libro removido",
                                description: `${book.title} ha sido removido de tus recomendaciones`,
                              })
                            } else {
                              toast({
                                title: "Error",
                                description: "No se pudo remover el libro",
                                variant: "destructive",
                              })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

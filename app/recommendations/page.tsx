"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BookmarkPlus, Info, ShoppingCart } from "lucide-react"
import Link from "next/link"
import type { Recommendation } from "@/app/api/recommendations/route"
import { toast } from "@/hooks/use-toast"

export default function RecommendationsPage() {
  const [books, setBooks] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await fetch("/api/recommendations")
        if (!res.ok) throw new Error("Error al cargar recomendaciones")
        const data = await res.json()
        setBooks(data.recommendations || [])
      } catch (e) {
        console.error(e)
        setError("No se pudieron cargar las recomendaciones.")
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [])

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

          {books.map((book) => (
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
                      onClick={() => {
                        toast({
                          title: "Agregado al plan",
                          description: `${book.title} ha sido agregado a tu plan de lectura`,
                        })
                      }}
                    >
                      <BookmarkPlus className="h-4 w-4" />
                      Agregar al plan
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

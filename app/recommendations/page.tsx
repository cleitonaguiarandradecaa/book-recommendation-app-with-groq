"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BookmarkPlus, Info, ShoppingCart, Trash2, Heart } from "lucide-react"
import Link from "next/link"
import type { Recommendation } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function RecommendationsPage() {
  const { user, recommendations, removeRecommendation, isInReadingPlan, readingPlans, addToReadingPlan, refreshReadingPlans, toggleFavorite, isBookFavorite } = useAuth()
  const [books, setBooks] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRecommendations = () => {
      try {
        // Usar apenas as recomendações do usuário
        const allRecommendations = recommendations.map((r) => ({
          ...r,
          id: String(r.id),
        }))
        
        // Filtrar livros que já estão no plano de leitura
        const filteredRecommendations = allRecommendations.filter((book) => {
          return !isInReadingPlan(String(book.id))
        })
        
        setBooks(filteredRecommendations)
      } catch (e) {
        console.error(e)
        setError("Não foi possível carregar as recomendações.")
        setBooks([])
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
            <h1 className="text-lg font-semibold">Recomendações</h1>
            <p className="text-xs text-muted-foreground">Selecionadas para você</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {loading && (
            <p className="text-sm text-muted-foreground">Carregando recomendações...</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && !error && books.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Não há recomendações disponíveis no momento.
            </p>
          )}

          {books.map((book) => {
            // Todos os livros podem ser removidos (não há mais livros mock)
            const canRemove = true

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
                            Nível: {book.level}
                          </span>
                        )}
                        {book.price && (
                          <span className="inline-flex items-center rounded-full bg-[color:var(--chart-3)]/10 px-2 py-1 text-xs text-[color:var(--chart-3)]">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: book.price.currency,
                            }).format(book.price.amount)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 ${isBookFavorite(String(book.id)) ? "text-destructive" : ""}`}
                        onClick={() => {
                          const newFavState = toggleFavorite(book)
                          toast({
                            title: newFavState ? "Adicionado aos favoritos" : "Removido dos favoritos",
                            description: newFavState
                              ? `${book.title} foi adicionado aos seus favoritos`
                              : `${book.title} foi removido dos seus favoritos`,
                          })
                        }}
                      >
                        <Heart className={`h-4 w-4 ${isBookFavorite(String(book.id)) ? "fill-current" : ""}`} />
                        {isBookFavorite(String(book.id)) ? "Nos favoritos" : "Favorito"}
                      </Button>
                      <Link href={`/book/${String(book.id)}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Info className="h-4 w-4" />
                          Ver detalhes
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
                                title: "Adicionado ao plano",
                                description: `${book.title} foi adicionado ao seu plano de leitura`,
                              })
                            } else {
                              toast({
                                title: "Erro",
                                description: "O livro já está no seu plano de leitura ou não foi possível adicionar",
                                variant: "destructive",
                              })
                            }
                          } catch (error) {
                            console.error("Erro ao adicionar ao plano:", error)
                            toast({
                              title: "Erro",
                              description: "Não foi possível adicionar o livro ao plano",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        {isInReadingPlan(String(book.id)) ? "Adicionado ao plano" : "Adicionar ao plano"}
                      </Button>
                      {book.buyLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(book.buyLink, "_blank")}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Comprar livro
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
                                title: "Livro removido",
                                description: `${book.title} foi removido das suas recomendações`,
                              })
                            } else {
                              toast({
                                title: "Erro",
                                description: "Não foi possível remover o livro",
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

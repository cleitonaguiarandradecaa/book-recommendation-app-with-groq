"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BookmarkPlus, ShoppingCart, Heart, Share2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { Recommendation } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

// Recomendaciones mock (mesmas da página de recomendações)
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

interface BookDetails extends Recommendation {
  rating?: number
  publishedDate?: string
  buyLink?: string
  previewLink?: string
}

export default function BookDetailPage() {
  const params = useParams()
  const bookId = params?.id as string
  const { recommendations, addToReadingPlan, isInReadingPlan } = useAuth()
  const [book, setBook] = useState<BookDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInPlan, setIsInPlan] = useState(false)

  useEffect(() => {
    const loadBookDetails = async () => {
      if (!bookId) return

      try {
        setLoading(true)
        setError(null)

        // Primeiro, tentar encontrar o livro nas recomendações mock
        const mockBook = MOCK_RECOMMENDATIONS.find((r) => String(r.id) === String(bookId))
        if (mockBook) {
          setBook(mockBook as BookDetails)
          setLoading(false)
          return
        }

        // Depois, tentar encontrar o livro nas recomendações do usuário
        const userBook = recommendations?.find((r) => String(r.id) === String(bookId))
        
        if (userBook) {
          // Se encontrou nas recomendações do usuário, usar esses dados
          setBook(userBook as BookDetails)
          setLoading(false)
          return
        }

        // Se não encontrou, buscar na API do Google Books
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
        
        if (!response.ok) {
          throw new Error("Libro no encontrado")
        }

        const data = await response.json()
        const volumeInfo = data.volumeInfo || {}
        const saleInfo = data.saleInfo || {}

        const imageLinks = volumeInfo.imageLinks || {}
        const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail
        const price = saleInfo.listPrice || saleInfo.retailPrice

        const bookData: BookDetails = {
          id: data.id,
          title: volumeInfo.title || "Sin título",
          author: (volumeInfo.authors || ["Autor desconocido"]).join(", "),
          description: volumeInfo.description,
          cover: cover?.replace("http://", "https://"),
          genre: volumeInfo.categories?.[0] || volumeInfo.categories?.join(", ") || "Sin categoría",
          pages: volumeInfo.pageCount,
          rating: volumeInfo.averageRating,
          publishedDate: volumeInfo.publishedDate,
          price: price ? {
            amount: price.amount,
            currency: price.currencyCode || "USD",
          } : undefined,
          buyLink: saleInfo.buyLink,
          previewLink: volumeInfo.previewLink || volumeInfo.infoLink,
          reason: "Recomendado para ti",
          level: "Intermedio",
        }

        setBook(bookData)
      } catch (err) {
        console.error("Error loading book:", err)
        setError("No se pudo cargar la información del libro")
      } finally {
        setLoading(false)
      }
    }

    loadBookDetails()
    
    // Verificar se o livro está no plano
    if (bookId) {
      setIsInPlan(isInReadingPlan(bookId))
    }
  }, [bookId, recommendations, isInReadingPlan])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando información del libro...</p>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
          <div className="flex items-center px-4 py-3">
            <Link href="/recommendations">
              <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg font-semibold">{error || "Libro no encontrado"}</p>
            <Link href="/recommendations">
              <Button variant="outline" className="mt-4">
                Volver a recomendaciones
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Calcular tempo de leitura estimado (assumindo 200 páginas por hora)
  const estimatedReadingTime = book.pages ? Math.round((book.pages / 200) * 10) / 10 : null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/recommendations">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <Share2 className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Book Cover Hero */}
        <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            {book.cover && (
              <div className="mx-auto mb-6 h-64 w-44 overflow-hidden rounded-2xl shadow-2xl">
                <img src={book.cover} alt={book.title} className="h-full w-full object-cover" />
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{book.author}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {book.genre && (
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {book.genre}
                </span>
              )}
              {book.pages && (
                <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
                  {book.pages} páginas
                </span>
              )}
              {book.level && (
                <span className="rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-[color:var(--success)]">
                  Nivel: {book.level}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
          {/* Personalized Recommendation */}
          {book.reason && (
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-success/10 p-6">
              <h2 className="mb-3 text-lg font-semibold">¿Por qué te recomendamos este libro?</h2>
              <p className="leading-relaxed text-foreground/90">{book.reason}</p>
            </div>
          )}

          {/* Synopsis */}
          {book.description && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Sinopsis</h2>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Reading Stats */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-card p-5 shadow-sm">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">
                {book.rating ? book.rating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Valoración</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-success">
                {estimatedReadingTime ? `~${estimatedReadingTime}h` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Tiempo lectura</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[color:var(--chart-3)]">
                {book.pages || "—"}
              </p>
              <p className="text-xs text-muted-foreground">Páginas</p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Actions */}
      <div className="border-t bg-background p-4 pb-24">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button 
            variant={isInPlan ? "default" : "outline"} 
            size="lg" 
            className={`flex-1 rounded-full ${isInPlan ? "" : "bg-transparent"}`}
            onClick={() => {
              if (!isInPlan && book) {
                const added = addToReadingPlan(book)
                if (added) {
                  setIsInPlan(true)
                  toast({
                    title: "Libro agregado",
                    description: `${book.title} ha sido agregado a tu plan de lectura`,
                  })
                } else {
                  toast({
                    title: "Error",
                    description: "No se pudo agregar el libro al plan",
                    variant: "destructive",
                  })
                }
              }
            }}
            disabled={isInPlan}
          >
            <BookmarkPlus className="mr-2 h-5 w-5" strokeWidth={1.5} />
            {isInPlan ? "Agregado a su plan" : "Agregar a mi plan"}
          </Button>
          {book.buyLink ? (
            <Button 
              size="lg" 
              className="flex-1 rounded-full"
              onClick={() => window.open(book.buyLink, "_blank")}
            >
              <ShoppingCart className="mr-2 h-5 w-5" strokeWidth={1.5} />
              {book.price 
                ? `Comprar ${new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: book.price.currency,
                  }).format(book.price.amount)}`
                : "Comprar libro"}
            </Button>
          ) : (
            <Button size="lg" className="flex-1 rounded-full" disabled>
              <ShoppingCart className="mr-2 h-5 w-5" strokeWidth={1.5} />
              No disponible
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

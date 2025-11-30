import { Button } from "@/components/ui/button"
import { ChevronLeft, BookmarkPlus, ShoppingCart, Heart, Share2 } from "lucide-react"
import Link from "next/link"

export default function BookDetailPage() {
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
            <div className="mx-auto mb-6 h-64 w-44 overflow-hidden rounded-2xl shadow-2xl">
              <img src="/fantasy-book-cover-epic.jpg" alt="El Nombre del Viento" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">El Nombre del Viento</h1>
            <p className="mt-2 text-lg text-muted-foreground">Patrick Rothfuss</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">Fantasía</span>
              <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
                722 páginas
              </span>
              <span className="rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-[color:var(--success)]">
                Nivel: Intermedio
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
          {/* Personalized Recommendation */}
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-success/10 p-6">
            <h2 className="mb-3 text-lg font-semibold">¿Por qué te recomendamos este libro?</h2>
            <p className="leading-relaxed text-foreground/90">
              Basándonos en tu amor por las <strong>historias épicas complejas</strong> y tu nivel de lectura{" "}
              <strong>intermedio</strong>, este libro es perfecto para ti. Combina una narrativa rica con personajes
              profundos que te mantendrán enganchado desde la primera página.
            </p>
          </div>

          {/* Synopsis */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Sinopsis</h2>
            <p className="leading-relaxed text-muted-foreground">
              En una posada en tierra de nadie, un hombre se dispone a relatar, por primera vez, la auténtica historia
              de su vida. Una historia que únicamente él conoce y que ha quedado diluida tras los rumores, las
              conjeturas y los cuentos de taberna que le han convertido en un personaje legendario a quien todos daban
              por muerto: Kvothe... músico, mendigo, ladrón, estudiante, mago, héroe y asesino.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Ahora va a revelar la verdad sobre sí mismo. Y para ello debe empezar por el principio: su infancia en una
              troupe de artistas itinerantes, los años malviviendo como un ladronzuelo en las calles de una gran ciudad
              y su llegada a una universidad donde esperaba encontrar todas las respuestas que había estado buscando.
            </p>
          </div>

          {/* Reading Stats */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-card p-5 shadow-sm">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">4.8</p>
              <p className="text-xs text-muted-foreground">Valoración</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-success">~24h</p>
              <p className="text-xs text-muted-foreground">Tiempo lectura</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[color:var(--chart-3)]">15K</p>
              <p className="text-xs text-muted-foreground">Lectores</p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Actions */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button variant="outline" size="lg" className="flex-1 rounded-full bg-transparent">
            <BookmarkPlus className="mr-2 h-5 w-5" strokeWidth={1.5} />
            Agregar a mi plan
          </Button>
          <Button size="lg" className="flex-1 rounded-full">
            <ShoppingCart className="mr-2 h-5 w-5" strokeWidth={1.5} />
            Comprar libro
          </Button>
        </div>
      </div>
    </div>
  )
}

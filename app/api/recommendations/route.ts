import { NextResponse } from "next/server"
import { getRecommendations } from "@/lib/recommendations-store"

export type Recommendation = {
  id: string | number
  title: string
  author: string
  genre: string
  pages?: number
  reason?: string
  level?: string
  cover?: string
  price?: {
    amount: number
    currency: string
  }
  buyLink?: string
  previewLink?: string
  description?: string
  rating?: number
}

// Recomendaciones mock iniciales
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1,
    title: "El Nombre del Viento",
    author: "Patrick Rothfuss",
    genre: "Fantasía",
    pages: 722,
    reason: "Porque te gustan las historias épicas y complejas",
    level: "Intermedio",
    cover: "/fantasy-book-cover-red.jpg",
  },
  {
    id: 2,
    title: "Cien Años de Soledad",
    author: "Gabriel García Márquez",
    genre: "Realismo mágico",
    pages: 471,
    reason: "Por tu interés en historias profundas con múltiples generaciones",
    level: "Avanzado",
    cover: "/classic-literature-book-cover-yellow.jpg",
  },
  {
    id: 3,
    title: "La Guía del Autoestopista Galáctico",
    author: "Douglas Adams",
    genre: "Ciencia ficción / Humor",
    pages: 384,
    reason: "Combina ciencia ficción con humor, ideal para tus gustos relajados",
    level: "Intermedio",
    cover: "/science-fiction-book-cover-orange.jpg",
  },
]

export async function GET() {
  try {
    // Obter recomendações armazenadas dinamicamente
    const storedRecommendations = getRecommendations()
    
    // Combinar recomendações mock com as armazenadas
    const allRecommendations = [
      ...MOCK_RECOMMENDATIONS,
      ...storedRecommendations.map((r) => ({
        ...r,
        id: r.id,
      })),
    ]

    return NextResponse.json({ recommendations: allRecommendations })
  } catch (error) {
    console.error("Error loading recommendations:", error)
    // Em caso de erro, retornar apenas as mock
    return NextResponse.json({ recommendations: MOCK_RECOMMENDATIONS })
  }
}

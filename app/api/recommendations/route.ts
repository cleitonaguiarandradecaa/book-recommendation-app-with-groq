import { NextResponse } from "next/server"
import type { Recommendation } from "@/lib/auth"

// Recomendaciones mock iniciales (apenas para demonstração)
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

export type { Recommendation }

export async function GET() {
  try {
    // Em produção, isso deveria buscar do banco de dados
    // Por enquanto, retornamos apenas as mock
    // O cliente carregará as recomendações do localStorage
    return NextResponse.json({ recommendations: MOCK_RECOMMENDATIONS })
  } catch (error) {
    console.error("Error loading recommendations:", error)
    return NextResponse.json({ recommendations: MOCK_RECOMMENDATIONS })
  }
}

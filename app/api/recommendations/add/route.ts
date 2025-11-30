import { NextResponse } from "next/server"
import { addRecommendation, getRecommendations, type Recommendation } from "@/lib/recommendations-store"

export type { Recommendation }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const book: Recommendation = body.book

    if (!book || !book.id || !book.title || !book.author) {
      return NextResponse.json(
        { error: "Book data is required with id, title, and author" },
        { status: 400 }
      )
    }

    // Adicionar o livro
    const added = addRecommendation(book)
    
    if (!added) {
      return NextResponse.json(
        { message: "El libro ya está en tus recomendaciones", book },
        { status: 200 }
      )
    }

    return NextResponse.json({ message: "Libro agregado a recomendaciones", book }, { status: 201 })
  } catch (error) {
    console.error("Error adding recommendation:", error)
    return NextResponse.json(
      { error: "Error al agregar el libro a recomendaciones" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ recommendations: getRecommendations() })
}


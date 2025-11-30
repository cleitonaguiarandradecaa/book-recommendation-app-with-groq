import { NextResponse } from "next/server"
import type { Recommendation } from "@/lib/auth"

// Esta função será chamada do cliente, então precisamos de uma API que receba os dados do usuário
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { book, userId } = body

    if (!book || !book.id || !book.title || !book.author) {
      return NextResponse.json(
        { error: "Book data is required with id, title, and author" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Em produção, isso deveria salvar em um banco de dados real
    // Por enquanto, retornamos sucesso e o cliente salvará no localStorage
    return NextResponse.json({ 
      message: "Libro agregado a recomendaciones", 
      book: {
        ...book,
        addedAt: new Date().toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding recommendation:", error)
    return NextResponse.json(
      { error: "Error al agregar el libro a recomendaciones" },
      { status: 500 }
    )
  }
}


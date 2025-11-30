import { NextResponse } from "next/server"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT = `
Eres un asistente literario conversacional.
- Hablas SIEMPRE en español neutro.
- Haces preguntas para entender gustos, intereses y nivel de lectura del usuario.
- Recomiendas libros con explicaciones claras y amables.
- Puedes proponer planes de lectura (por días o semanas) según el tiempo disponible.
- Si el usuario pide recomendaciones de libros, comprar libros, o buscar libros, debes responder normalmente pero el sistema buscará libros reais na API do Google Books.
- Cuando recomiendes libros, sé específico sobre títulos y autores para que el sistema pueda buscarlos.
No inventes APIs ni datos de pago. Solo habla de recomendaciones, lectura y organización.
`.trim()

// Función para detectar si o usuário está pedindo livros
function shouldSearchBooks(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  const keywords = [
    "recomendar",
    "recomendación",
    "recomendaciones",
    "buscar libro",
    "buscar libros",
    "comprar libro",
    "comprar libros",
    "libro sobre",
    "libros de",
    "libro de",
    "quiero leer",
    "me gusta",
    "género",
    "autor",
  ]
  return keywords.some((keyword) => lowerMessage.includes(keyword))
}

// Función para extrair termos de busca da mensagem
function extractSearchTerms(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Remover palavras comuns
  const stopWords = [
    "quiero",
    "me gusta",
    "buscar",
    "recomendar",
    "recomendación",
    "recomendaciones",
    "comprar",
    "libro",
    "libros",
    "sobre",
    "de",
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "por favor",
    "puedes",
    "podrías",
  ]
  
  let searchTerm = message
  stopWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    searchTerm = searchTerm.replace(regex, " ")
  })
  
  return searchTerm.trim().replace(/\s+/g, " ") || message
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = (body?.messages || []) as ChatMessage[]
    const lastMessage = messages[messages.length - 1]?.content || ""

    // Verificar se o usuário está pedindo livros
    const needsBookSearch = shouldSearchBooks(lastMessage)
    let books: any[] = []

    if (needsBookSearch) {
      try {
        const searchTerms = extractSearchTerms(lastMessage)
        
        // Buscar diretamente na Google Books API
        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&maxResults=5&langRestrict=es`
        const booksRes = await fetch(googleBooksUrl)
        
        if (booksRes.ok) {
          const data = await booksRes.json()
          
          // Transformar os resultados da Google Books
          books = (data.items || []).map((item: any) => {
            const volumeInfo = item.volumeInfo || {}
            const saleInfo = item.saleInfo || {}
            
            const imageLinks = volumeInfo.imageLinks || {}
            const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail
            
            const price = saleInfo.listPrice || saleInfo.retailPrice
            
            return {
              id: item.id,
              title: volumeInfo.title || "Sin título",
              author: (volumeInfo.authors || ["Autor desconocido"]).join(", "),
              description: volumeInfo.description,
              cover: cover?.replace("http://", "https://"),
              genre: volumeInfo.categories?.[0] || volumeInfo.categories?.join(", ") || "Sin categoría",
              pages: volumeInfo.pageCount,
              publishedDate: volumeInfo.publishedDate,
              rating: volumeInfo.averageRating,
              price: price ? {
                amount: price.amount,
                currency: price.currencyCode || "USD"
              } : undefined,
              buyLink: saleInfo.buyLink,
              previewLink: volumeInfo.previewLink || volumeInfo.infoLink,
            }
          })
        }
      } catch (error) {
        console.error("Error searching books:", error)
      }
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      console.error("Falta GROQ_API_KEY en las variables de entorno")
      return NextResponse.json(
        {
          error:
            "El servidor no está configurado con GROQ_API_KEY. Añádelo en el archivo .env.local.",
        },
        { status: 500 },
      )
    }

    const finalMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === "assistant" || m.role === "user" ? m.role : "user",
        content: m.content,
      })),
    ]

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: finalMessages,
        temperature: 0.7,
      }),
    })

    if (!groqRes.ok) {
      const errorText = await groqRes.text()
      console.error("Error de Groq:", groqRes.status, errorText)
      return NextResponse.json(
        { error: "Error al llamar al modelo Groq. Revisa los logs del servidor." },
        { status: 500 },
      )
    }

    const data = await groqRes.json()
    const reply =
      data?.choices?.[0]?.message?.content ??
      "No pude generar una respuesta en este momento. Intenta de nuevo."

    return NextResponse.json({ reply, books })
  } catch (error) {
    console.error("Error en /api/chat:", error)
    return NextResponse.json({ error: "Error interno en el asistente" }, { status: 500 })
  }
}

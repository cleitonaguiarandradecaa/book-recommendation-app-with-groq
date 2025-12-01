import { NextResponse } from "next/server"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

function getSystemPrompt(
  onboarding?: { interests: string[]; readingTime: number; readerLevel: string },
  isBookSearch: boolean = false
): string {
  let prompt = `
Eres un asistente literario conversacional.
- Hablas SIEMPRE en español neutro.
${isBookSearch
      ? `- CRÍTICO: El usuario está pidiendo libros específicos. El sistema YA ESTÁ BUSCANDO los libros en la API de Google Books.
- Responde ÚNICAMENTE con "." (punto) o una cadena vacía. NO escribas nada más.
- NO recomiendes libros, NO menciones títulos, NO des explicaciones. El sistema mostrará los resultados automáticamente.
- Tu respuesta será ignorada, solo responde con "."`
      : `- Recomiendas libros con explicaciones claras y amables.
- Puedes proponer planes de lectura (por días o semanas) según el tiempo disponible.
- Puedes responder preguntas sobre libros, géneros, autores, etc.`}
No inventes APIs ni datos de pago. Solo habla de recomendaciones, lectura y organización.
`.trim()

  if (onboarding) {
    const interestsText = onboarding.interests.join(", ")
    const levelText = onboarding.readerLevel === "beginner" ? "principiante"
      : onboarding.readerLevel === "intermediate" ? "intermedio"
        : "avanzado"

    prompt += `\n\nINFORMACIÓN DEL USUARIO:
- Géneros favoritos: ${interestsText}
- Tiempo de lectura diario: ${onboarding.readingTime} minutos
- Nivel de lectura: ${levelText}

Usa esta información para personalizar tus recomendaciones. Prioriza los géneros que le gustan al usuario y sugiere libros apropiados para su nivel de lectura.`
  } else {
    prompt += `\n\n- Haces preguntas para entender gustos, intereses y nivel de lectura del usuario si no los conoces.`
  }

  return prompt
}

// Función para detectar si o usuário está pedindo livros
function shouldSearchBooks(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  const keywords = [
    // Español
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
    "libros con",
    "libro con",
    "quiero leer",
    "quiero libros",
    "quiero un libro",
    "necesito libros",
    "necesito un libro",
    "dame libros",
    "muéstrame libros",
    "libros que",
    "libro que",
    "libros sobre",
    "me gusta",
    "género",
    "autor",
    // Português
    "quero livros",
    "quero um livro",
    "quero livro",
    "livros com",
    "livro com",
    "livros de",
    "livro de",
    "livros sobre",
    "livro sobre",
    "buscar livros",
    "buscar livro",
    "recomendar livros",
    "recomendar livro",
    "preciso de livros",
    "preciso de livro",
  ]
  return keywords.some((keyword) => lowerMessage.includes(keyword))
}

// Mapeamento de interesses para termos de busca
const interestToSearchTerm: Record<string, string> = {
  fantasy: "fantasía",
  scifi: "ciencia ficción",
  romance: "romance",
  mystery: "misterio",
  thriller: "thriller",
  history: "historia",
  biography: "biografía",
  psychology: "psicología",
  business: "negocios",
  selfhelp: "autoayuda",
  poetry: "poesía",
  adventure: "aventura",
}

// Función para extrair termos de busca usando Groq quando há características específicas
async function extractSearchTermsWithAI(
  message: string,
  onboarding?: { interests: string[]; readingTime: number; readerLevel: string },
  groqApiKey?: string
): Promise<string> {
  // Se não há API key, usar método simples
  if (!groqApiKey) {
    return extractSearchTermsSimple(message, onboarding)
  }

  // Verificar se a mensagem tem características específicas que justificam usar IA
  const lowerMessage = message.toLowerCase()
  const hasSpecificCharacteristics =
    lowerMessage.includes("con") ||
    lowerMessage.includes("com") || // Português
    lowerMessage.includes("que tenga") ||
    lowerMessage.includes("que tenha") || // Português
    lowerMessage.includes("que sea") ||
    lowerMessage.includes("sobre") ||
    lowerMessage.includes("temática") ||
    lowerMessage.includes("tema") ||
    lowerMessage.includes("com características") || // Português
    lowerMessage.includes("com dragões") || // Português
    lowerMessage.includes("com dragones") || // Espanhol
    message.length > 20 // Mensagens mais longas provavelmente têm mais detalhes

  // Se não tem características específicas, usar método simples
  if (!hasSpecificCharacteristics) {
    return extractSearchTermsSimple(message, onboarding)
  }

  try {
    // Usar Groq para extrair características e criar query de busca
    const extractionPrompt = `Analiza la siguiente solicitud del usuario y extrae las características específicas de los libros que busca. 
Responde SOLO con una query de búsqueda optimizada para la API de Google Books (máximo 10 palabras clave relevantes).
No incluyas palabras como "libro", "recomendar", "buscar" - solo términos de búsqueda.

Solicitud del usuario: "${message}"

${onboarding && onboarding.interests.length > 0
        ? `Géneros favoritos del usuario: ${onboarding.interests.map(i => interestToSearchTerm[i] || i).join(", ")}`
        : ""}

Ejemplos:
- "quiero un libro de ciencia ficción sobre viajes en el tiempo" → "ciencia ficción viajes tiempo"
- "libros de romance históricos ambientados en el siglo XIX" → "romance histórico siglo XIX"
- "novelas de misterio con protagonista femenino" → "misterio protagonista femenino"

Query de búsqueda:`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Eres un asistente que extrae términos de búsqueda de libros. Responde solo con los términos de búsqueda, sin explicaciones." },
          { role: "user", content: extractionPrompt }
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    })

    if (groqRes.ok) {
      const data = await groqRes.json()
      const extractedTerms = data?.choices?.[0]?.message?.content?.trim()

      if (extractedTerms && extractedTerms.length > 0) {
        console.log("API Chat: Termos extraídos pelo Groq:", extractedTerms)
        return extractedTerms
      }
    }
  } catch (error) {
    console.error("Error ao extrair termos com Groq:", error)
  }

  // Fallback para método simples
  return extractSearchTermsSimple(message, onboarding)
}

// Función simple para extrair termos de busca (fallback)
function extractSearchTermsSimple(message: string, onboarding?: { interests: string[]; readingTime: number; readerLevel: string }): string {
  const lowerMessage = message.toLowerCase()

  // Remover palavras comuns (espanhol e português)
  const stopWords = [
    // Español
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
    // Português
    "quero",
    "gosto",
    "gostaria",
    "preciso",
    "precisaria",
    "livro",
    "livros",
    "um",
    "uma",
    "por favor",
    "pode",
    "poderia",
    "desejo",
    "desejaria",
  ]

  let searchTerm = message
  stopWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    searchTerm = searchTerm.replace(regex, " ")
  })

  searchTerm = searchTerm.trim().replace(/\s+/g, " ")

  // Se o usuário não especificou um termo e tem interesses no onboarding, usar os interesses
  if (!searchTerm && onboarding && onboarding.interests.length > 0) {
    const interestTerms = onboarding.interests
      .map((interest) => interestToSearchTerm[interest])
      .filter(Boolean)
      .join(" OR ")
    return interestTerms
  }

  // Se o usuário especificou um termo mas tem interesses, combinar
  if (searchTerm && onboarding && onboarding.interests.length > 0) {
    const interestTerms = onboarding.interests
      .slice(0, 2) // Usar apenas os 2 primeiros interesses para não sobrecarregar
      .map((interest) => interestToSearchTerm[interest])
      .filter(Boolean)
      .join(" OR ")

    // Combinar termo do usuário com interesses
    return `${searchTerm} ${interestTerms}`
  }

  return searchTerm || message
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = (body?.messages || []) as ChatMessage[]
    const onboarding = body?.onboarding as { interests: string[]; readingTime: number; readerLevel: string } | undefined
    const userRecommendations = (body?.userRecommendations || []) as Array<{ id: string }>
    const lastMessage = messages[messages.length - 1]?.content || ""

    console.log("API Chat: Recebendo dados de onboarding", onboarding)
    console.log("API Chat: Recomendações do usuário", userRecommendations.length)

    // Verificar se o usuário está pedindo livros
    const needsBookSearch = shouldSearchBooks(lastMessage)
    let books: any[] = []
    let searchTerms: string = ""
    let hasMore = false
    let nextStartIndex = 0

    // Obter API key do Groq para extração de características
    const groqApiKey = process.env.GROQ_API_KEY

    if (needsBookSearch) {
      try {
        // Se o usuário pediu uma recomendação genérica, usar os interesses do onboarding
        const isGenericRequest = lastMessage.toLowerCase().includes("recomendar") ||
          lastMessage.toLowerCase().includes("recomendación") ||
          lastMessage.toLowerCase().includes("recomendaciones") ||
          lastMessage.toLowerCase().trim() === ""

        if (isGenericRequest && onboarding && onboarding.interests.length > 0) {
          // Usar apenas os interesses do onboarding para busca genérica
          const interestTerms = onboarding.interests
            .map((interest) => interestToSearchTerm[interest])
            .filter(Boolean)
            .join(" OR ")
          searchTerms = interestTerms
          console.log("API Chat: Buscando livros baseado nos interesses do onboarding", interestTerms)
        } else {
          // Extrair termos usando IA quando há características específicas
          searchTerms = await extractSearchTermsWithAI(lastMessage, onboarding, groqApiKey)
          console.log("API Chat: Termos de busca extraídos", searchTerms)
        }

        // Buscar diretamente na Google Books API (primeiros 5 resultados)
        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&startIndex=0&maxResults=10&langRestrict=es`
        const booksRes = await fetch(googleBooksUrl)

        if (booksRes.ok) {
          const data = await booksRes.json()
          const totalItems = data.totalItems || 0
          hasMore = totalItems > 5

          // Transformar os resultados da Google Books
          let allBooks = (data.items || []).map((item: any) => {
            const volumeInfo = item.volumeInfo || {}
            const saleInfo = item.saleInfo || {}

            const imageLinks = volumeInfo.imageLinks || {}
            const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail

            const price = saleInfo.listPrice || saleInfo.retailPrice

            // Verificar se o livro corresponde aos interesses do usuário
            const bookCategories = (volumeInfo.categories || []).map((cat: string) => cat.toLowerCase())
            let matchesInterests = false
            if (onboarding && onboarding.interests.length > 0) {
              const interestTerms = onboarding.interests.map(i => interestToSearchTerm[i]?.toLowerCase()).filter(Boolean)
              matchesInterests = bookCategories.some((cat: string) =>
                interestTerms.some((interest: string) => cat.includes(interest) || interest.includes(cat))
              )
            }

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
              matchesInterests, // Flag para indicar se corresponde aos interesses
            }
          })

          // Priorizar livros que correspondem aos interesses do usuário
          if (onboarding && onboarding.interests.length > 0) {
            allBooks.sort((a: any, b: any) => {
              if (a.matchesInterests && !b.matchesInterests) return -1
              if (!a.matchesInterests && b.matchesInterests) return 1
              return 0
            })
          }

          // Filtrar livros que já estão nas recomendações do usuário
          const recommendedBookIds = new Set(userRecommendations.map((r) => String(r.id)))
          const filteredBooks = allBooks.filter((book: any) => !recommendedBookIds.has(book.id))

          // Se não temos 5 livros após filtrar, buscar mais para completar
          const targetCount = 5
          let startIndex = 10 // Começar de onde paramos (já buscamos 10)
          let additionalFetches = 0
          const maxAdditionalFetches = 5 // Limitar tentativas adicionais

          while (filteredBooks.length < targetCount && startIndex < totalItems && additionalFetches < maxAdditionalFetches) {
            const additionalUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&startIndex=${startIndex}&maxResults=${targetCount * 2}&langRestrict=es`
            const additionalRes = await fetch(additionalUrl)

            if (additionalRes.ok) {
              const additionalData = await additionalRes.json()
              const additionalBooks = (additionalData.items || []).map((item: any) => {
                const volumeInfo = item.volumeInfo || {}
                const saleInfo = item.saleInfo || {}
                const imageLinks = volumeInfo.imageLinks || {}
                const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail
                const price = saleInfo.listPrice || saleInfo.retailPrice
                const bookCategories = (volumeInfo.categories || []).map((cat: string) => cat.toLowerCase())
                let matchesInterests = false
                if (onboarding && onboarding.interests.length > 0) {
                  const interestTerms = onboarding.interests.map(i => interestToSearchTerm[i]?.toLowerCase()).filter(Boolean)
                  matchesInterests = bookCategories.some((cat: string) =>
                    interestTerms.some((interest: string) => cat.includes(interest) || interest.includes(cat))
                  )
                }

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
                  matchesInterests,
                }
              })

              // Filtrar os novos livros também
              const newFilteredBooks = additionalBooks.filter((book: any) => !recommendedBookIds.has(book.id))
              filteredBooks.push(...newFilteredBooks)
              startIndex += additionalData.items?.length || 0
              additionalFetches++

              // Se não há mais itens, parar
              if (!additionalData.items || additionalData.items.length === 0) break
            } else {
              break
            }
          }

          // Limitar a 5 resultados iniciais
          books = filteredBooks.slice(0, targetCount)

          // Atualizar informações de paginação
          hasMore = totalItems > books.length || filteredBooks.length > targetCount
          nextStartIndex = books.length

          console.log("API Chat: Livros encontrados:", books.length)
          console.log("API Chat: Primeiro livro:", books[0]?.title)
        } else {
          console.log("API Chat: Nenhum livro encontrado na API do Google Books")
        }
      } catch (error) {
        console.error("Error searching books:", error)
      }
    } else {
      console.log("API Chat: Busca de livros não necessária ou searchTerms vazio")
    }

    // Verificar se há API key do Groq
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

    const systemPrompt = getSystemPrompt(onboarding, needsBookSearch)

    const finalMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
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
    let reply =
      data?.choices?.[0]?.message?.content ??
      "No pude generar una respuesta en este momento. Intenta de nuevo."

    // Se houver busca de livros, ajustar resposta e incluir informações de paginação
    let responseData: any = { reply, books: books || [] }

    if (needsBookSearch && searchTerms) {
      // Quando há busca de livros, sempre ignorar resposta do Groq e mostrar apenas os livros
      if (books && books.length > 0) {
        // Sempre usar mensagem vazia quando há livros - os livros serão exibidos diretamente
        responseData.reply = ""
        responseData.books = books // Garantir que os livros estão no array
        responseData.searchTerms = searchTerms
        responseData.hasMoreBooks = hasMore
        responseData.nextStartIndex = nextStartIndex
        console.log("API Chat: Retornando", books.length, "livros para exibição")
      } else {
        // Se não há livros, usar mensagem informativa
        responseData.reply = "No encontré libros que coincidan exactamente con tu búsqueda. Intenta con otros términos o características más específicas."
        responseData.books = []
      }
    } else if (needsBookSearch && !searchTerms) {
      // Se deveria buscar mas não há termos, manter resposta do Groq mas informar
      responseData.reply = reply
      responseData.books = []
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error en /api/chat:", error)
    return NextResponse.json({ error: "Error interno en el asistente" }, { status: 500 })
  }
}

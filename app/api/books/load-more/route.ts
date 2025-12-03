import { NextResponse } from "next/server"

// Função para verificar se um livro é adequado para o nível de leitor
function isBookAppropriateForLevel(
  book: { pages?: number; description?: string },
  readerLevel: "beginner" | "intermediate" | "advanced"
): boolean {
  const pages = book.pages || 0

  switch (readerLevel) {
    case "beginner":
      // Iniciantes: livros com até 300 páginas (preferencialmente mais curtos)
      // Se não houver informação de páginas, aceitar (mas priorizar os que têm)
      return pages === 0 || pages <= 300

    case "intermediate":
      // Intermediários: livros entre 150-600 páginas (margem flexível)
      // Se não houver informação de páginas, aceitar
      return pages === 0 || (pages >= 150 && pages <= 600)

    case "advanced":
      // Avançados: livros com 300+ páginas (podem ser mais longos e complexos)
      // Se não houver informação de páginas, aceitar
      return pages === 0 || pages >= 300

    default:
      // Se o nível não for reconhecido, aceitar todos
      return true
  }
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { searchTerms, startIndex, onboarding, userRecommendations = [], userReadingPlans = [] } = body

    if (!searchTerms) {
      return NextResponse.json({ error: "searchTerms is required" }, { status: 400 })
    }

    const start = startIndex || 0
    const maxResults = 5
    const recommendedBookIds = new Set(userRecommendations.map((r: { id: string }) => String(r.id)))
    const readingPlanBookIds = new Set(userReadingPlans.map((p: { bookId: string }) => String(p.bookId)))
    const excludedBookIds = new Set([...recommendedBookIds, ...readingPlanBookIds])

    // Buscar na Google Books API com paginação
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&startIndex=${start}&maxResults=${maxResults}&langRestrict=es`
    const booksRes = await fetch(googleBooksUrl)

    if (!booksRes.ok) {
      throw new Error(`Google Books API error: ${booksRes.status}`)
    }

    const data = await booksRes.json()
    const totalItems = data.totalItems || 0
    const hasMore = start + maxResults < totalItems

    // Transformar os resultados da Google Books
    let bookCategories = (data.items || []).map((item: any) => {
      const volumeInfo = item.volumeInfo || {}
      const saleInfo = item.saleInfo || {}

      const imageLinks = volumeInfo.imageLinks || {}
      const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail

      const price = saleInfo.listPrice || saleInfo.retailPrice

      // Verificar se o livro corresponde aos interesses do usuário
      const categories = (volumeInfo.categories || []).map((cat: string) => cat.toLowerCase())
      let matchesInterests = false
      if (onboarding && onboarding.interests && onboarding.interests.length > 0) {
        const interestTerms = onboarding.interests
          .map((i: string) => interestToSearchTerm[i]?.toLowerCase())
          .filter(Boolean)
        matchesInterests = categories.some((cat: string) =>
          interestTerms.some((interest: string) => cat.includes(interest) || interest.includes(cat))
        )
      }

      return {
        id: item.id,
        title: volumeInfo.title || "Sem título",
        author: (volumeInfo.authors || ["Autor desconhecido"]).join(", "),
        description: volumeInfo.description,
        cover: cover?.replace("http://", "https://"),
        genre: volumeInfo.categories?.[0] || volumeInfo.categories?.join(", ") || "Sem categoria",
        pages: volumeInfo.pageCount,
        publishedDate: volumeInfo.publishedDate,
        rating: volumeInfo.averageRating,
        price: price
          ? {
            amount: price.amount,
            currency: price.currencyCode || "USD",
          }
          : undefined,
        buyLink: saleInfo.buyLink,
        previewLink: volumeInfo.previewLink || volumeInfo.infoLink,
        matchesInterests,
      }
    })

    // Filtrar livros que já estão nas recomendações ou no plano de leitura
    bookCategories = bookCategories.filter((book: any) => !excludedBookIds.has(book.id))

    // Filtrar livros por nível de leitor (se onboarding estiver completo)
    if (onboarding && onboarding.readerLevel) {
      const beforeLevelFilter = bookCategories.length
      bookCategories = bookCategories.filter((book: any) =>
        isBookAppropriateForLevel(book, onboarding.readerLevel as "beginner" | "intermediate" | "advanced")
      )
      console.log(`API Load More: Filtro por nível (${onboarding.readerLevel}): ${beforeLevelFilter} -> ${bookCategories.length} livros`)
    }

    // Se não temos 5 livros após filtrar, buscar mais para completar
    const targetCount = 5
    let currentStartIndex = start + bookCategories.length
    let additionalFetches = 0
    const maxAdditionalFetches = 5 // Limitar tentativas adicionais

    while (bookCategories.length < targetCount && currentStartIndex < totalItems && additionalFetches < maxAdditionalFetches) {
      const additionalUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&startIndex=${currentStartIndex}&maxResults=${targetCount * 2}&langRestrict=es`
      const additionalRes = await fetch(additionalUrl)

      if (additionalRes.ok) {
        const additionalData = await additionalRes.json()
        const additionalBooks = (additionalData.items || []).map((item: any) => {
          const volumeInfo = item.volumeInfo || {}
          const saleInfo = item.saleInfo || {}
          const imageLinks = volumeInfo.imageLinks || {}
          const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail
          const price = saleInfo.listPrice || saleInfo.retailPrice
          const categories = (volumeInfo.categories || []).map((cat: string) => cat.toLowerCase())
          let matchesInterests = false
          if (onboarding && onboarding.interests && onboarding.interests.length > 0) {
            const interestTerms = onboarding.interests
              .map((i: string) => interestToSearchTerm[i]?.toLowerCase())
              .filter(Boolean)
            matchesInterests = categories.some((cat: string) =>
              interestTerms.some((interest: string) => cat.includes(interest) || interest.includes(cat))
            )
          }

          return {
            id: item.id,
            title: volumeInfo.title || "Sin título",
            author: (volumeInfo.authors || ["Autor desconocido"]).join(", "),
            description: volumeInfo.description,
            cover: cover?.replace("http://", "https://"),
            genre: volumeInfo.categories?.[0] || volumeInfo.categories?.join(", ") || "Sem categoria",
            pages: volumeInfo.pageCount,
            publishedDate: volumeInfo.publishedDate,
            rating: volumeInfo.averageRating,
            price: price
              ? {
                amount: price.amount,
                currency: price.currencyCode || "USD",
              }
              : undefined,
            buyLink: saleInfo.buyLink,
            previewLink: volumeInfo.previewLink || volumeInfo.infoLink,
            matchesInterests,
          }
        })

        // Filtrar os novos livros também (excluindo os que estão nas recomendações ou no plano de leitura)
        let newFilteredBooks = additionalBooks.filter((book: any) => !excludedBookIds.has(book.id))

        // Filtrar por nível de leitor também
        if (onboarding && onboarding.readerLevel) {
          newFilteredBooks = newFilteredBooks.filter((book: any) =>
            isBookAppropriateForLevel(book, onboarding.readerLevel as "beginner" | "intermediate" | "advanced")
          )
        }

        bookCategories.push(...newFilteredBooks)
        currentStartIndex += additionalData.items?.length || 0
        additionalFetches++

        // Se não há mais itens, parar
        if (!additionalData.items || additionalData.items.length === 0) break
      } else {
        break
      }
    }

    // Priorizar livros que correspondem aos interesses
    if (onboarding && onboarding.interests && onboarding.interests.length > 0) {
      bookCategories.sort((a: any, b: any) => {
        if (a.matchesInterests && !b.matchesInterests) return -1
        if (!a.matchesInterests && b.matchesInterests) return 1
        return 0
      })
    }

    return NextResponse.json({
      books: bookCategories,
      hasMore,
      totalItems,
      nextStartIndex: start + maxResults,
    })
  } catch (error) {
    console.error("Error loading more books:", error)
    return NextResponse.json({ error: "Erro ao carregar mais livros" }, { status: 500 })
  }
}



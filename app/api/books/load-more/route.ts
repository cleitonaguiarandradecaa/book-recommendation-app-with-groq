import { NextResponse } from "next/server"

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
    const { searchTerms, startIndex, onboarding } = body

    if (!searchTerms) {
      return NextResponse.json({ error: "searchTerms is required" }, { status: 400 })
    }

    const start = startIndex || 0
    const maxResults = 5

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
    const bookCategories = (data.items || []).map((item: any) => {
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
        title: volumeInfo.title || "Sin título",
        author: (volumeInfo.authors || ["Autor desconocido"]).join(", "),
        description: volumeInfo.description,
        cover: cover?.replace("http://", "https://"),
        genre: volumeInfo.categories?.[0] || volumeInfo.categories?.join(", ") || "Sin categoría",
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
    return NextResponse.json({ error: "Error al cargar más libros" }, { status: 500 })
  }
}



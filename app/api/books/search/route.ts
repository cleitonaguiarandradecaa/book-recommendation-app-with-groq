import { NextResponse } from "next/server"

export type GoogleBook = {
  id: string
  title: string
  authors?: string[]
  description?: string
  imageLinks?: {
    thumbnail?: string
    smallThumbnail?: string
    medium?: string
    large?: string
  }
  publishedDate?: string
  pageCount?: number
  categories?: string[]
  averageRating?: number
  ratingsCount?: number
  language?: string
  previewLink?: string
  infoLink?: string
  saleInfo?: {
    listPrice?: {
      amount: number
      currencyCode: string
    }
    retailPrice?: {
      amount: number
      currencyCode: string
    }
    buyLink?: string
  }
}

export type BookSearchResult = {
  id: string
  title: string
  author: string
  description?: string
  cover?: string
  genre?: string
  pages?: number
  publishedDate?: string
  rating?: number
  price?: {
    amount: number
    currency: string
  }
  buyLink?: string
  previewLink?: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const maxResults = parseInt(searchParams.get("maxResults") || "10")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    // Buscar na Google Books API
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=es`
    
    const response = await fetch(googleBooksUrl)
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`)
    }

    const data = await response.json()

    // Transformar os resultados da Google Books para o formato da aplicação
    const books: BookSearchResult[] = (data.items || []).map((item: any) => {
      const volumeInfo = item.volumeInfo || {}
      const saleInfo = item.saleInfo || {}
      
      // Obter melhor imagem disponível
      const imageLinks = volumeInfo.imageLinks || {}
      const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail
      
      // Obter preço
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

    return NextResponse.json({ books })
  } catch (error) {
    console.error("Error searching books:", error)
    return NextResponse.json(
      { error: "Error al buscar libros en Google Books" },
      { status: 500 }
    )
  }
}


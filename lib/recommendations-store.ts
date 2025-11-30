// Store compartilhado para recomendações
// Em produção, isso deveria ser substituído por um banco de dados

export type Recommendation = {
  id: string
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

let recommendationsStore: Recommendation[] = []

export function getRecommendations(): Recommendation[] {
  return recommendationsStore
}

export function addRecommendation(book: Recommendation): boolean {
  // Verificar se o livro já existe
  const exists = recommendationsStore.find((r) => r.id === book.id)
  if (exists) {
    return false
  }

  // Adicionar o livro
  recommendationsStore.push(book)
  return true
}

export function clearRecommendations() {
  recommendationsStore = []
}


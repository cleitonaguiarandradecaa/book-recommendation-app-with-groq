// Sistema de autenticação usando localStorage

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface OnboardingData {
  interests: string[]
  readingTime: number // minutos por dia
  readerLevel: "beginner" | "intermediate" | "advanced"
}

export interface Recommendation {
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
  addedAt?: string
}

export interface PlanStep {
  id: string
  title: string
  description?: string
  pages?: string
  completed: boolean
  completedAt?: string
}

export interface ReadingPlan {
  id: string
  bookId: string
  title: string
  author: string
  cover?: string
  totalPages?: number
  currentPage: number
  progress: number
  addedAt: string
  targetDate?: string
  daysLeft?: number
  steps?: PlanStep[]
  planGenerated?: boolean
  completedAt?: string // Data de conclusão do livro (quando progress === 100)
}

export interface Favorite {
  id: string
  title: string
  author: string
  genre?: string
  cover?: string
  addedAt: string
}

export interface UserData {
  user: User
  onboarding: OnboardingData | null
  recommendations?: Recommendation[]
  readingPlans?: ReadingPlan[]
  favorites?: Favorite[]
}

const STORAGE_KEY = "lector_user_data"
const SESSION_KEY = "lector_session_email"

function setItemSafe(key: string, value: string) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore storage errors (quota, private mode, etc.)
    }
  }
}

function removeItemSafe(key: string) {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  }
}

export function saveUserData(userData: UserData): void {
  setItemSafe(STORAGE_KEY, JSON.stringify(userData))
}

export function getUserData(): UserData | null {
  if (typeof window !== "undefined") {
    const data = window.localStorage.getItem(STORAGE_KEY)
    if (data) {
      try {
        return JSON.parse(data) as UserData
      } catch {
        return null
      }
    }
  }
  return null
}

export function getSessionEmail(): string | null {
  if (typeof window !== "undefined") {
    try {
      return window.localStorage.getItem(SESSION_KEY)
    } catch {
      return null
    }
  }
  return null
}

export function setSessionEmail(email: string): void {
  setItemSafe(SESSION_KEY, email)
}

export function clearSession(): void {
  removeItemSafe(SESSION_KEY)
}

export function isLoggedIn(): boolean {
  const data = getUserData()
  const sessionEmail = getSessionEmail()
  return data !== null && data.user !== null && !!sessionEmail && data.user.email === sessionEmail
}

export function hasCompletedOnboarding(): boolean {
  const data = getUserData()
  const sessionEmail = getSessionEmail()
  return (
    data !== null &&
    data.onboarding !== null &&
    !!sessionEmail &&
    data.user.email === sessionEmail
  )
}

export function saveOnboardingData(onboarding: OnboardingData): void {
  const userData = getUserData()
  if (userData) {
    userData.onboarding = onboarding
    saveUserData(userData)
  }
}

export function updateUserName(newName: string): boolean {
  const userData = getUserData()
  if (!userData || !userData.user) {
    return false
  }

  userData.user.name = newName
  saveUserData(userData)
  return true
}

export function addFavorite(book: Recommendation): boolean {
  const userData = getUserData()
  if (!userData) {
    return false
  }

  if (!userData.favorites) {
    userData.favorites = []
  }

  // Verificar se o livro já está nos favoritos
  const exists = userData.favorites.find((f) => f.id === book.id)
  if (exists) {
    return false
  }

  // Adicionar aos favoritos
  const favorite: Favorite = {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    cover: book.cover,
    addedAt: new Date().toISOString(),
  }

  userData.favorites.push(favorite)
  saveUserData(userData)
  return true
}

export function removeFavorite(bookId: string): boolean {
  const userData = getUserData()
  if (!userData || !userData.favorites) {
    return false
  }

  const index = userData.favorites.findIndex((f) => f.id === bookId)
  if (index === -1) {
    return false
  }

  userData.favorites.splice(index, 1)
  saveUserData(userData)
  return true
}

export function getFavorites(): Favorite[] {
  const userData = getUserData()
  return userData?.favorites || []
}

export function isFavorite(bookId: string): boolean {
  const userData = getUserData()
  if (!userData || !userData.favorites) {
    return false
  }
  return userData.favorites.some((f) => f.id === bookId)
}

export function logout(): void {
  // Não apagamos mais os dados do usuário ao sair, apenas limpamos a sessão atual.
  clearSession()
}

export function addRecommendationToUser(book: Recommendation): boolean {
  const userData = getUserData()
  if (!userData) {
    return false
  }

  if (!userData.recommendations) {
    userData.recommendations = []
  }

  // Verificar se o livro já existe
  const exists = userData.recommendations.find((r) => r.id === book.id)
  if (exists) {
    return false
  }

  // Adicionar data de adição
  book.addedAt = new Date().toISOString()

  // Adicionar o livro
  userData.recommendations.push(book)
  saveUserData(userData)
  return true
}

export function getUserRecommendations(): Recommendation[] {
  const userData = getUserData()
  return userData?.recommendations || []
}

export function removeRecommendation(bookId: string): boolean {
  const userData = getUserData()
  if (!userData || !userData.recommendations) {
    return false
  }

  const index = userData.recommendations.findIndex((r) => r.id === bookId)
  if (index === -1) {
    return false
  }

  userData.recommendations.splice(index, 1)
  saveUserData(userData)
  return true
}

export function registerUser(email: string, name: string): User {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    name,
    createdAt: new Date().toISOString(),
  }

  const userData: UserData = {
    user,
    onboarding: null,
    recommendations: [],
    readingPlans: [],
    favorites: [],
  }

  saveUserData(userData)
  return user
}

export function loginUser(email: string): User | null {
  const userData = getUserData()
  if (userData && userData.user.email === email) {
    return userData.user
  }
  return null
}

export function addBookToReadingPlan(book: Recommendation): boolean {
  const userData = getUserData()
  if (!userData) {
    return false
  }

  if (!userData.readingPlans) {
    userData.readingPlans = []
  }

  // Verificar se o livro já está no plano
  const exists = userData.readingPlans.find((p) => p.bookId === book.id)
  if (exists) {
    return false
  }

  // Criar novo plano
  const plan: ReadingPlan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bookId: book.id,
    title: book.title,
    author: book.author,
    cover: book.cover,
    totalPages: book.pages,
    currentPage: 0,
    progress: 0,
    addedAt: new Date().toISOString(),
  }

  userData.readingPlans.push(plan)
  saveUserData(userData)
  return true
}

export function getReadingPlans(): ReadingPlan[] {
  const userData = getUserData()
  return userData?.readingPlans || []
}

export function isBookInReadingPlan(bookId: string): boolean {
  const userData = getUserData()
  if (!userData || !userData.readingPlans) {
    return false
  }
  return userData.readingPlans.some((p) => p.bookId === bookId)
}

export function getReadingPlanByBookId(bookId: string): ReadingPlan | null {
  const userData = getUserData()
  if (!userData || !userData.readingPlans) {
    return null
  }
  return userData.readingPlans.find((p) => p.bookId === bookId) || null
}

export function updateReadingPlan(planId: string, updates: Partial<ReadingPlan>): boolean {
  const userData = getUserData()
  if (!userData || !userData.readingPlans) {
    return false
  }

  const index = userData.readingPlans.findIndex((p) => p.id === planId)
  if (index === -1) {
    return false
  }

  const plan = userData.readingPlans[index]
  const updatedPlan = { ...plan, ...updates }

  // Marcar data de conclusão se o progresso foi atualizado para 100%
  if (updatedPlan.progress === 100 && !updatedPlan.completedAt) {
    updatedPlan.completedAt = new Date().toISOString()
  } else if (updatedPlan.progress !== undefined && updatedPlan.progress < 100 && updatedPlan.completedAt) {
    // Se o progresso foi atualizado para menos de 100, remover a data de conclusão
    delete updatedPlan.completedAt
  }

  userData.readingPlans[index] = updatedPlan
  saveUserData(userData)
  return true
}

export function updatePlanStep(planId: string, stepId: string, completed: boolean): boolean {
  const userData = getUserData()
  if (!userData || !userData.readingPlans) {
    return false
  }

  const plan = userData.readingPlans.find((p) => p.id === planId)
  if (!plan || !plan.steps) {
    return false
  }

  const stepIndex = plan.steps.findIndex((s) => s.id === stepId)
  if (stepIndex === -1) {
    return false
  }

  plan.steps[stepIndex].completed = completed
  if (completed) {
    plan.steps[stepIndex].completedAt = new Date().toISOString()
  } else {
    delete plan.steps[stepIndex].completedAt
  }

  // Atualizar progresso geral
  const completedSteps = plan.steps.filter((s) => s.completed).length
  plan.progress = plan.steps.length > 0 ? Math.round((completedSteps / plan.steps.length) * 100) : 0

  // Atualizar página atual baseado nas etapas completadas e suas páginas
  if (plan.steps && plan.steps.length > 0) {
    // Tentar calcular baseado nas páginas das etapas completadas
    let calculatedPage = 0

    // Ordenar etapas por ordem (assumindo que estão em ordem sequencial)
    const sortedSteps = [...plan.steps].sort((a, b) => {
      // Extrair número inicial das páginas para ordenar
      const getPageStart = (pages: string | undefined) => {
        if (!pages) return 0
        const match = pages.match(/(\d+)/)
        return match ? parseInt(match[1]) : 0
      }
      return getPageStart(a.pages) - getPageStart(b.pages)
    })

    // Encontrar a última etapa completada
    let lastCompletedIndex = -1
    for (let i = 0; i < sortedSteps.length; i++) {
      if (sortedSteps[i].completed) {
        lastCompletedIndex = i
      }
    }

    if (lastCompletedIndex >= 0) {
      // Pegar a última etapa completada e extrair o número final de páginas
      const lastCompletedStep = sortedSteps[lastCompletedIndex]
      if (lastCompletedStep.pages) {
        const pageRange = lastCompletedStep.pages.match(/(\d+)\s*-\s*(\d+)/)
        if (pageRange) {
          calculatedPage = parseInt(pageRange[2]) // Página final da última etapa completada
        } else {
          // Se não houver range, tentar pegar o único número
          const singlePage = lastCompletedStep.pages.match(/(\d+)/)
          if (singlePage) {
            calculatedPage = parseInt(singlePage[1])
          }
        }
      }
    }

    // Se não conseguiu calcular pelas etapas, usar cálculo por progresso
    if (calculatedPage === 0 && plan.totalPages) {
      calculatedPage = Math.round((plan.progress / 100) * plan.totalPages)
    }

    plan.currentPage = calculatedPage
  } else if (plan.totalPages) {
    // Fallback: calcular baseado apenas no progresso se não houver etapas
    plan.currentPage = Math.round((plan.progress / 100) * plan.totalPages)
  }

  // Marcar data de conclusão se o livro foi completado
  if (plan.progress === 100 && !plan.completedAt) {
    plan.completedAt = new Date().toISOString()
  } else if (plan.progress < 100 && plan.completedAt) {
    // Se o progresso voltar a ser menor que 100, remover a data de conclusão
    delete plan.completedAt
  }

  saveUserData(userData)
  return true
}


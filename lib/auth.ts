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
}

export interface UserData {
  user: User
  onboarding: OnboardingData | null
  recommendations?: Recommendation[]
  readingPlans?: ReadingPlan[]
}

const STORAGE_KEY = "lector_user_data"

export function saveUserData(userData: UserData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }
}

export function getUserData(): UserData | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY)
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

export function isLoggedIn(): boolean {
  const data = getUserData()
  return data !== null && data.user !== null
}

export function hasCompletedOnboarding(): boolean {
  const data = getUserData()
  return data !== null && data.onboarding !== null
}

export function saveOnboardingData(onboarding: OnboardingData): void {
  const userData = getUserData()
  if (userData) {
    userData.onboarding = onboarding
    saveUserData(userData)
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
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

  userData.readingPlans[index] = { ...userData.readingPlans[index], ...updates }
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

  // Atualizar página atual baseado no progresso
  if (plan.totalPages) {
    plan.currentPage = Math.round((plan.progress / 100) * plan.totalPages)
  }

  saveUserData(userData)
  return true
}


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

export interface UserData {
  user: User
  onboarding: OnboardingData | null
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


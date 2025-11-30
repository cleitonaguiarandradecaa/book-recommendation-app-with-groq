"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import {
  User,
  UserData,
  OnboardingData,
  getUserData,
  saveUserData,
  saveOnboardingData,
  logout as logoutUser,
  isLoggedIn,
  hasCompletedOnboarding,
} from "@/lib/auth"

interface AuthContextType {
  user: User | null
  onboarding: OnboardingData | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingComplete: boolean
  login: (email: string, name: string) => void
  register: (email: string, name: string) => void
  logout: () => void
  updateOnboarding: (data: OnboardingData) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar dados do localStorage ao montar
    const userData = getUserData()
    if (userData) {
      setUser(userData.user)
      setOnboarding(userData.onboarding)
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, name: string) => {
    const userData = getUserData()
    if (userData && userData.user.email === email) {
      setUser(userData.user)
      setOnboarding(userData.onboarding)
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        createdAt: new Date().toISOString(),
      }

      const newUserData: UserData = {
        user: newUser,
        onboarding: null,
      }

      saveUserData(newUserData)
      setUser(newUser)
      setOnboarding(null)
    }
  }

  const register = (email: string, name: string) => {
    login(email, name) // Mesma lógica para registro
  }

  const logout = () => {
    logoutUser()
    setUser(null)
    setOnboarding(null)
  }

  const updateOnboarding = (data: OnboardingData) => {
    saveOnboardingData(data)
    setOnboarding(data)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        onboarding,
        isLoading,
        isAuthenticated: user !== null,
        onboardingComplete: onboarding !== null,
        login,
        register,
        logout,
        updateOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


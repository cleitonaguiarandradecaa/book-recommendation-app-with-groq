"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WelcomeScreen } from "@/components/onboarding/welcome-screen"
import { InterestsScreen } from "@/components/onboarding/interests-screen"
import { ReadingTimeScreen } from "@/components/onboarding/reading-time-screen"
import { ReaderLevelScreen } from "@/components/onboarding/reader-level-screen"
import { HomeScreen } from "@/components/home/home-screen"
import { useAuth } from "@/contexts/auth-context"
import type { OnboardingData } from "@/lib/auth"

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    interests: [],
    readingTime: 30,
    readerLevel: undefined,
  })
  const { isAuthenticated, onboardingComplete, isLoading, updateOnboarding } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const handleNext = () => {
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1)
    } else {
      // Finalizar onboarding
      console.log("Onboarding: Finalizando com dados", onboardingData)
      if (onboardingData.interests && onboardingData.readingTime && onboardingData.readerLevel) {
        const completeData: OnboardingData = {
          interests: onboardingData.interests,
          readingTime: onboardingData.readingTime,
          readerLevel: onboardingData.readerLevel,
        }
        console.log("Onboarding: Dados completos salvos", completeData)
        updateOnboarding(completeData)
      } else {
        console.error("Onboarding: Dados incompletos", onboardingData)
      }
    }
  }

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Será redirigido
  }

  if (onboardingComplete) {
    return <HomeScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 0 && <WelcomeScreen onNext={handleNext} />}
      {currentScreen === 1 && (
        <InterestsScreen
          onNext={handleNext}
          onBack={handleBack}
          onInterestsChange={(interests) => {
            console.log("Onboarding: Salvando interesses", interests)
            setOnboardingData((prev) => ({ ...prev, interests }))
          }}
        />
      )}
      {currentScreen === 2 && (
        <ReadingTimeScreen
          onNext={handleNext}
          onBack={handleBack}
          onReadingTimeChange={(readingTime) => setOnboardingData({ ...onboardingData, readingTime })}
        />
      )}
      {currentScreen === 3 && (
        <ReaderLevelScreen
          onNext={handleNext}
          onBack={handleBack}
          onLevelChange={(readerLevel) => setOnboardingData({ ...onboardingData, readerLevel })}
        />
      )}
    </div>
  )
}

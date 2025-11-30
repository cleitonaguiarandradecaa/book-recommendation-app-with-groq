"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/onboarding/welcome-screen"
import { InterestsScreen } from "@/components/onboarding/interests-screen"
import { ReadingTimeScreen } from "@/components/onboarding/reading-time-screen"
import { ReaderLevelScreen } from "@/components/onboarding/reader-level-screen"
import { HomeScreen } from "@/components/home/home-screen"

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  const handleNext = () => {
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1)
    } else {
      setOnboardingComplete(true)
    }
  }

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  if (onboardingComplete) {
    return <HomeScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 0 && <WelcomeScreen onNext={handleNext} />}
      {currentScreen === 1 && <InterestsScreen onNext={handleNext} onBack={handleBack} />}
      {currentScreen === 2 && <ReadingTimeScreen onNext={handleNext} onBack={handleBack} />}
      {currentScreen === 3 && <ReaderLevelScreen onNext={handleNext} onBack={handleBack} />}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface InterestsScreenProps {
  onNext: () => void
  onBack: () => void
  onInterestsChange?: (interests: string[]) => void
}

const interests = [
  { id: "fantasy", label: "Fantasía", emoji: "🧙" },
  { id: "scifi", label: "Ciencia Ficción", emoji: "🚀" },
  { id: "romance", label: "Romance", emoji: "💕" },
  { id: "mystery", label: "Misterio", emoji: "🔍" },
  { id: "thriller", label: "Thriller", emoji: "😱" },
  { id: "history", label: "Historia", emoji: "📜" },
  { id: "biography", label: "Biografías", emoji: "👤" },
  { id: "psychology", label: "Psicología", emoji: "🧠" },
  { id: "business", label: "Negocios", emoji: "💼" },
  { id: "selfhelp", label: "Autoayuda", emoji: "✨" },
  { id: "poetry", label: "Poesía", emoji: "📝" },
  { id: "adventure", label: "Aventura", emoji: "🗺️" },
]

export function InterestsScreen({ onNext, onBack, onInterestsChange }: InterestsScreenProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (id: string) => {
    const newInterests = selectedInterests.includes(id)
      ? selectedInterests.filter((i) => i !== id)
      : [...selectedInterests, id]
    setSelectedInterests(newInterests)
    onInterestsChange?.(newInterests)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          <div className="h-1.5 w-8 rounded-full bg-primary" />
          <div className="h-1.5 w-8 rounded-full bg-muted" />
          <div className="h-1.5 w-8 rounded-full bg-muted" />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">¿Qué te gusta leer?</h2>
            <p className="text-muted-foreground">Selecciona tus géneros favoritos. Puedes elegir varios.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
                  selectedInterests.includes(interest.id)
                    ? "bg-primary text-primary-foreground shadow-md scale-[0.98]"
                    : "bg-card text-card-foreground hover:bg-accent"
                }`}
              >
                <span className="text-3xl">{interest.emoji}</span>
                <span className="text-sm font-medium">{interest.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-background p-6">
        <div className="mx-auto max-w-md">
          <Button
            onClick={() => {
              // Garantir que os interesses sejam salvos antes de avançar
              onInterestsChange?.(selectedInterests)
              onNext()
            }}
            disabled={selectedInterests.length === 0}
            size="lg"
            className="w-full rounded-full text-base font-medium"
          >
            Continuar
          </Button>
          {selectedInterests.length > 0 && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {selectedInterests.length}{" "}
              {selectedInterests.length === 1 ? "género seleccionado" : "géneros seleccionados"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

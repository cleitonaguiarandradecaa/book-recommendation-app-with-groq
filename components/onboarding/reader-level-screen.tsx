"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BookmarkCheck, Zap, Trophy } from "lucide-react"

interface ReaderLevelScreenProps {
  onNext: () => void
  onBack: () => void
}

const levels = [
  {
    id: "beginner",
    label: "Principiante",
    icon: BookmarkCheck,
    description: "Estoy empezando mi aventura lectora",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: "intermediate",
    label: "Intermedio",
    icon: Zap,
    description: "Leo regularmente y busco nuevos desafíos",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "advanced",
    label: "Avanzado",
    icon: Trophy,
    description: "Soy un lector ávido y experimentado",
    color: "text-[color:var(--chart-3)]",
    bgColor: "bg-[color:var(--chart-3)]/10",
  },
]

export function ReaderLevelScreen({ onNext, onBack }: ReaderLevelScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

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
          <div className="h-1.5 w-8 rounded-full bg-primary" />
          <div className="h-1.5 w-8 rounded-full bg-primary" />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">¿Cuál es tu nivel de lectura?</h2>
            <p className="text-muted-foreground">Esto nos ayuda a sugerir libros con la complejidad adecuada</p>
          </div>

          <div className="space-y-3 pt-4">
            {levels.map((level) => {
              const Icon = level.icon
              const isSelected = selectedLevel === level.id

              return (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl p-5 text-left transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-[0.98]"
                      : "bg-card text-card-foreground hover:bg-accent"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      isSelected ? "bg-primary-foreground/20" : level.bgColor
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${isSelected ? "text-primary-foreground" : level.color}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{level.label}</h3>
                    <p className={`text-sm ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {level.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-background p-6">
        <div className="mx-auto max-w-md">
          <Button
            onClick={onNext}
            disabled={!selectedLevel}
            size="lg"
            className="w-full rounded-full text-base font-medium"
          >
            Finalizar configuración
          </Button>
        </div>
      </div>
    </div>
  )
}

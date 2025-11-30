"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface ReadingTimeScreenProps {
  onNext: () => void
  onBack: () => void
}

export function ReadingTimeScreen({ onNext, onBack }: ReadingTimeScreenProps) {
  const [minutes, setMinutes] = useState([30])

  const getReadingDescription = (mins: number) => {
    if (mins <= 15) return "Lecturas breves perfectas para ti"
    if (mins <= 30) return "Balance ideal entre historia y tiempo"
    if (mins <= 60) return "Tiempo suficiente para sumergirte"
    return "Sesiones inmersivas de lectura"
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
          <div className="h-1.5 w-8 rounded-full bg-primary" />
          <div className="h-1.5 w-8 rounded-full bg-muted" />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-md space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">¿Cuánto tiempo tienes para leer?</h2>
            <p className="text-muted-foreground">Esto nos ayuda a recomendarte libros que se ajusten a tu ritmo</p>
          </div>

          <div className="space-y-8 pt-8">
            {/* Visual Display */}
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-primary/10 to-success/10 p-8">
              <div className="text-6xl font-semibold text-primary">{minutes[0]}</div>
              <div className="text-lg font-medium text-foreground">minutos al día</div>
              <div className="text-sm text-muted-foreground text-center">{getReadingDescription(minutes[0])}</div>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <Slider value={minutes} onValueChange={setMinutes} min={5} max={120} step={5} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>30 min</span>
                <span>60 min</span>
                <span>120 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-background p-6">
        <div className="mx-auto max-w-md">
          <Button onClick={onNext} size="lg" className="w-full rounded-full text-base font-medium">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}

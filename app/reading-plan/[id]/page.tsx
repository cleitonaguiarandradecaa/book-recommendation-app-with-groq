"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CheckCircle2, Circle, Loader2, Target, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { updatePlanStep, updateReadingPlan, type PlanStep, type ReadingPlan } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

export default function ReadingPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params?.id as string
  const { onboarding, refreshReadingPlans, removeFromReadingPlan } = useAuth()
  const [plan, setPlan] = useState<ReadingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return

      try {
        setLoading(true)
        setError(null)

        // Buscar plano pelo ID
        const userData = JSON.parse(localStorage.getItem("lector_user_data") || "{}")
        const foundPlan = userData?.readingPlans?.find((p: ReadingPlan) => p.id === planId)

        if (!foundPlan) {
          setError("Plan no encontrado")
          setLoading(false)
          return
        }

        setPlan(foundPlan)

        // Se o plano não foi gerado ainda, gerar automaticamente
        if (!foundPlan.planGenerated && !foundPlan.steps) {
          await generatePlan(foundPlan)
        }
      } catch (err) {
        console.error("Error loading plan:", err)
        setError("No se pudo cargar el plan")
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [planId])

  const generatePlan = async (planData: ReadingPlan) => {
    try {
      setGenerating(true)

      const response = await fetch("/api/reading-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: {
            title: planData.title,
            author: planData.author,
            totalPages: planData.totalPages,
          },
          onboarding: onboarding || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al generar el plan")
      }

      const data = await response.json()
      const steps: PlanStep[] = (data.steps || []).map((step: any) => ({
        ...step,
        completed: false,
      }))

      // Atualizar plano com os steps
      const updated = updateReadingPlan(planId, {
        steps,
        planGenerated: true,
      })

      if (updated) {
        const userData = JSON.parse(localStorage.getItem("lector_user_data") || "{}")
        const updatedPlan = userData?.readingPlans?.find((p: ReadingPlan) => p.id === planId)
        setPlan(updatedPlan)
        toast({
          title: "Plan generado",
          description: "El plan de lectura ha sido creado exitosamente",
        })
      }
    } catch (err) {
      console.error("Error generating plan:", err)
      toast({
        title: "Error",
        description: "No se pudo generar el plan de lectura",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const toggleStep = (stepId: string) => {
    if (!plan) return

    const step = plan.steps?.find((s) => s.id === stepId)
    if (!step) return

    const newCompleted = !step.completed
    const updated = updatePlanStep(planId, stepId, newCompleted)

    if (updated) {
      // Recarregar plano atualizado
      const userData = JSON.parse(localStorage.getItem("lector_user_data") || "{}")
      const updatedPlan = userData?.readingPlans?.find((p: ReadingPlan) => p.id === planId)
      setPlan(updatedPlan)
      
      // Atualizar contexto
      refreshReadingPlans()

      toast({
        title: newCompleted ? "Etapa completada" : "Etapa desmarcada",
        description: step.title,
      })
    }
  }

  if (loading || generating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          {generating ? "Generando plan de lectura..." : "Cargando plan..."}
        </p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
          <div className="flex items-center px-4 py-3">
            <Link href="/reading-plan">
              <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg font-semibold">{error || "Plan no encontrado"}</p>
            <Link href="/reading-plan">
              <Button variant="outline" className="mt-4">
                Volver a planes
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const completedSteps = plan.steps?.filter((s) => s.completed).length || 0
  const totalSteps = plan.steps?.length || 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/reading-plan">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                {completedSteps}/{totalSteps} completadas
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                if (confirm(`Tem certeza que deseja remover "${plan.title}" do seu plano de leitura?`)) {
                  const removed = removeFromReadingPlan(plan.id)
                  if (removed) {
                    toast({
                      title: "Removido",
                      description: "O livro foi removido do seu plano de leitura.",
                    })
                    // Redirecionar para a página de planos
                    router.push("/reading-plan")
                  }
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Book Header */}
        <div className="bg-gradient-to-b from-primary/5 to-background px-6 py-8">
          <div className="mx-auto max-w-2xl">
            {plan.cover && (
              <div className="mb-4 h-48 w-32 overflow-hidden rounded-xl shadow-lg">
                <img src={plan.cover} alt={plan.title} className="h-full w-full object-cover" />
              </div>
            )}
            <h1 className="text-2xl font-bold">{plan.title}</h1>
            <p className="mt-1 text-muted-foreground">{plan.author}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{plan.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Steps */}
        <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
          <h2 className="text-xl font-semibold">Plan de Lectura</h2>
          
          {!plan.steps || plan.steps.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
              <p className="text-muted-foreground mb-4">No hay etapas en el plan aún.</p>
              <Button onClick={() => generatePlan(plan)} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Generar plan"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {plan.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    step.completed
                      ? "border-success/20 bg-success/5"
                      : "border-transparent bg-card"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                        step.completed
                          ? "bg-success text-success-foreground"
                          : "border-2 border-muted-foreground/30 bg-background hover:border-primary"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                      ) : (
                        <Circle className="h-5 w-5" strokeWidth={2} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                            {step.title}
                          </h3>
                          {step.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                          )}
                          {step.pages && (
                            <p className="mt-2 text-xs font-medium text-primary">Páginas: {step.pages}</p>
                          )}
                          {step.estimatedMinutes && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              ⏱️ Tempo estimado: {step.estimatedMinutes} min
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Etapa {index + 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


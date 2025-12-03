"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Edit3, BookOpen, Target, Heart, Settings, ChevronRight, LogOut, Save, X, BookmarkCheck, Zap, Trophy } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"
import type { OnboardingData } from "@/lib/auth"

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

const levels = [
  {
    id: "beginner",
    label: "Iniciante",
    icon: BookmarkCheck,
    description: "Estou começando minha aventura leitora",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: "intermediate",
    label: "Intermediário",
    icon: Zap,
    description: "Leio regularmente e busco novos desafios",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "advanced",
    label: "Avançado",
    icon: Trophy,
    description: "Sou um leitor ávido e experiente",
    color: "text-[color:var(--chart-3)]",
    bgColor: "bg-[color:var(--chart-3)]/10",
  },
]

export default function ProfilePage() {
  const { user, onboarding, logout, updateOnboarding, updateUser, readingPlans, favorites } = useAuth()
  const router = useRouter()
  const userName = user?.name || "Usuario"
  const userInitial = useMemo(() => userName.charAt(0).toUpperCase(), [userName])

  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingInterests, setIsEditingInterests] = useState(false)
  const [isEditingReadingTime, setIsEditingReadingTime] = useState(false)
  const [isEditingLevel, setIsEditingLevel] = useState(false)

  const [editedName, setEditedName] = useState(userName)
  const [editedInterests, setEditedInterests] = useState<string[]>(onboarding?.interests || [])
  const [editedReadingTime, setEditedReadingTime] = useState<number[]>([onboarding?.readingTime || 30])
  const [editedLevel, setEditedLevel] = useState<"beginner" | "intermediate" | "advanced" | null>(
    onboarding?.readerLevel || null
  )

  // Calcular estatísticas reais
  const stats = useMemo(() => {
    // Livros lidos: contar livros com progress === 100
    const booksRead = readingPlans.filter((plan) => plan.progress === 100).length

    // Racha atual: calcular dias consecutivos de leitura
    const calculateStreak = () => {
      if (!readingPlans || readingPlans.length === 0) return 0

      // Coletar todas as datas de conclusão de steps
      const allDates: string[] = []
      readingPlans.forEach((plan) => {
        if (plan.steps) {
          plan.steps.forEach((step) => {
            if (step.completed && step.completedAt) {
              allDates.push(step.completedAt)
            }
          })
        }
      })

      if (allDates.length === 0) return 0

      // Converter para objetos Date e remover duplicatas por dia
      const formatDateKey = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const uniqueDates = Array.from(
        new Set(
          allDates.map((dateStr) => {
            const date = new Date(dateStr)
            return formatDateKey(date)
          })
        )
      ).sort()

      if (uniqueDates.length === 0) return 0

      // Verificar racha a partir de hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let streak = 0
      let currentDate = new Date(today)

      // Verificar se há atividade hoje
      const todayStr = formatDateKey(currentDate)
      if (!uniqueDates.includes(todayStr)) {
        // Se não há atividade hoje, começar de ontem
        currentDate.setDate(currentDate.getDate() - 1)
      }

      // Contar dias consecutivos
      while (true) {
        const dateStr = formatDateKey(currentDate)
        if (uniqueDates.includes(dateStr)) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }

      return streak
    }

    const streak = calculateStreak()

    // Favoritos: contar favoritos
    const favoritesCount = favorites.length

    return [
      { label: "Livros lidos", value: booksRead.toString(), icon: BookOpen, color: "text-primary" },
      { label: "Racha atual", value: streak > 0 ? `${streak} ${streak === 1 ? "dia" : "dias"}` : "0 dias", icon: Target, color: "text-success" },
      { label: "Favoritos", value: favoritesCount.toString(), icon: Heart, color: "text-[color:var(--chart-4)]" },
    ]
  }, [readingPlans, favorites])

  // Livros concluídos (progresso 100%)
  const completedPlans = useMemo(
    () => readingPlans.filter((plan) => plan.progress === 100),
    [readingPlans],
  )

  // Sincronizar estados locais quando o onboarding ou user mudar
  useEffect(() => {
    if (onboarding) {
      setEditedInterests(onboarding.interests || [])
      setEditedReadingTime([onboarding.readingTime || 30])
      setEditedLevel(onboarding.readerLevel || null)
    }
    if (user) {
      setEditedName(user.name)
    }
  }, [onboarding, user])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSaveName = () => {
    if (!editedName.trim()) {
      toast({
        title: "Error",
        description: "O nome não pode estar vazio",
        variant: "destructive",
      })
      return
    }

    const updated = updateUser(editedName.trim())
    if (updated) {
      setIsEditingName(false)
      toast({
        title: "Salvo",
        description: "Nome atualizado corretamente",
      })
    } else {
      toast({
        title: "Error",
        description: "Não foi possível atualizar o nome",
        variant: "destructive",
      })
    }
  }

  const handleSaveInterests = () => {
    if (editedInterests.length === 0) {
      toast({
        title: "Error",
        description: "Selecione pelo menos um gênero",
        variant: "destructive",
      })
      return
    }

    if (!onboarding) {
      toast({
        title: "Erro",
        description: "Não há dados de onboarding para atualizar",
        variant: "destructive",
      })
      return
    }

    const updatedOnboarding: OnboardingData = {
      ...onboarding,
      interests: editedInterests,
    }

    updateOnboarding(updatedOnboarding)
    setIsEditingInterests(false)
    toast({
      title: "Salvo",
      description: "Gêneros atualizados corretamente",
    })
  }

  const handleSaveReadingTime = () => {
    if (!onboarding) {
      toast({
        title: "Erro",
        description: "Não há dados de onboarding para atualizar",
        variant: "destructive",
      })
      return
    }

    const updatedOnboarding: OnboardingData = {
      ...onboarding,
      readingTime: editedReadingTime[0],
    }

    updateOnboarding(updatedOnboarding)
    setIsEditingReadingTime(false)
    toast({
      title: "Salvo",
      description: "Tempo de leitura atualizado corretamente",
    })
  }

  const handleSaveLevel = () => {
    if (!editedLevel) {
      toast({
        title: "Error",
        description: "Selecione um nível de leitura",
        variant: "destructive",
      })
      return
    }

    if (!onboarding) {
      toast({
        title: "Erro",
        description: "Não há dados de onboarding para atualizar",
        variant: "destructive",
      })
      return
    }

    const updatedOnboarding: OnboardingData = {
      ...onboarding,
      readerLevel: editedLevel,
    }

    updateOnboarding(updatedOnboarding)
    setIsEditingLevel(false)
    toast({
      title: "Salvo",
      description: "Nível de leitura atualizado corretamente",
    })
  }

  const toggleInterest = (id: string) => {
    setEditedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getInterestLabel = (id: string) => {
    return interests.find((i) => i.id === id)?.label || id
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold">Perfil</h1>
          <Link href="/settings">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <Settings className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="mx-auto max-w-2xl">
          {/* Profile Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-success/10 px-6 py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-semibold shadow-lg">
                {isEditingName ? editedName.charAt(0).toUpperCase() : userInitial}
              </div>
              {isEditingName ? (
                <div className="space-y-3">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-center text-2xl font-bold h-auto py-2"
                    placeholder="Nome"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setIsEditingName(false)
                        setEditedName(userName)
                      }}
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={handleSaveName}
                    >
                      <Save className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-2xl font-bold">{userName}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 rounded-full p-0"
                      onClick={() => {
                        setEditedName(userName)
                        setIsEditingName(true)
                      }}
                    >
                      <Edit3 className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                  </div>
                  <p className="mt-1 text-muted-foreground">{user?.email}</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="rounded-2xl bg-card p-4 text-center shadow-sm">
                    <Icon className={`mx-auto mb-2 h-6 w-6 ${stat.color}`} strokeWidth={1.5} />
                    <p className="text-xl font-semibold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Reading Preferences */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preferências Literárias</h3>
                {!isEditingInterests ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setEditedInterests(onboarding?.interests || [])
                      setIsEditingInterests(true)
                    }}
                  >
                    <Edit3 className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setIsEditingInterests(false)
                        setEditedInterests(onboarding?.interests || [])
                      }}
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={handleSaveInterests}
                    >
                      <Save className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                )}
              </div>

              {isEditingInterests ? (
                <div className="grid grid-cols-2 gap-3">
                  {interests.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
                        editedInterests.includes(interest.id)
                          ? "bg-primary text-primary-foreground shadow-md scale-[0.98]"
                          : "bg-card text-card-foreground hover:bg-accent"
                      }`}
                    >
                      <span className="text-3xl">{interest.emoji}</span>
                      <span className="text-sm font-medium">{interest.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {onboarding?.interests && onboarding.interests.length > 0 ? (
                    onboarding.interests.map((interestId) => (
                      <span
                        key={interestId}
                        className="rounded-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground"
                      >
                        {getInterestLabel(interestId)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Não há gêneros selecionados</span>
                  )}
                </div>
              )}
            </div>

            {/* Reading Info */}
            <div className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Informações de Leitura</h3>
              </div>
              <div className="space-y-4">
                {onboarding ? (
                  <>
                    {/* Reading Time */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tempo disponível</span>
                        {!isEditingReadingTime ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{onboarding.readingTime} min/dia</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={() => {
                                setEditedReadingTime([onboarding.readingTime])
                                setIsEditingReadingTime(true)
                              }}
                            >
                              <Edit3 className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={() => {
                                setIsEditingReadingTime(false)
                                setEditedReadingTime([onboarding.readingTime])
                              }}
                            >
                              <X className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={handleSaveReadingTime}
                            >
                              <Save className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                          </div>
                        )}
                      </div>
                      {isEditingReadingTime && (
                        <div className="space-y-4 pt-2">
                          <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-primary/10 to-success/10 p-4">
                            <div className="text-3xl font-semibold text-primary">{editedReadingTime[0]}</div>
                            <div className="text-sm font-medium text-foreground">minutos por dia</div>
                          </div>
                          <Slider
                            value={editedReadingTime}
                            onValueChange={setEditedReadingTime}
                            min={5}
                            max={120}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>5 min</span>
                            <span>30 min</span>
                            <span>60 min</span>
                            <span>120 min</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reading Level */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Nível de leitura</span>
                        {!isEditingLevel ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {onboarding.readerLevel === "beginner"
                                ? "Iniciante"
                                : onboarding.readerLevel === "intermediate"
                                  ? "Intermediário"
                                  : onboarding.readerLevel === "advanced"
                                    ? "Avançado"
                                    : "Não definido"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={() => {
                                setEditedLevel(onboarding.readerLevel || null)
                                setIsEditingLevel(true)
                              }}
                            >
                              <Edit3 className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={() => {
                                setIsEditingLevel(false)
                                setEditedLevel(onboarding.readerLevel || null)
                              }}
                            >
                              <X className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={handleSaveLevel}
                            >
                              <Save className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                          </div>
                        )}
                      </div>
                      {isEditingLevel && (
                        <div className="space-y-2 pt-2">
                          {levels.map((level) => {
                            const Icon = level.icon
                            const isSelected = editedLevel === level.id

                            return (
                              <button
                                key={level.id}
                                onClick={() => setEditedLevel(level.id as "beginner" | "intermediate" | "advanced")}
                                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground shadow-md scale-[0.98]"
                                    : "bg-muted text-card-foreground hover:bg-accent"
                                }`}
                              >
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                    isSelected ? "bg-primary-foreground/20" : level.bgColor
                                  }`}
                                >
                                  <Icon
                                    className={`h-5 w-5 ${isSelected ? "text-primary-foreground" : level.color}`}
                                    strokeWidth={1.5}
                                  />
                                </div>
                                <div className="flex-1 space-y-0.5">
                                  <h4 className="text-sm font-semibold">{level.label}</h4>
                                  <p className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                    {level.description}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Gêneros favoritos</span>
                      <span className="text-sm font-medium">{onboarding.interests.length} gêneros</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Complete o onboarding para ver suas informações</p>
                )}
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full rounded-full bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Fechar sessão
              </Button>
            </div>

            {/* Saved Books (favoritos reais) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Favoritos</h3>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Você ainda não salvou nenhum livro nos favoritos.
                </p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((fav) => (
                    <Link
                      key={fav.id}
                      href={`/book/${fav.id}`}
                      className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={
                            fav.cover ||
                            `/abstract-book-cover.png?height=128&width=96&query=${encodeURIComponent(
                              fav.title,
                            )}`
                          }
                          alt={fav.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold truncate">{fav.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {fav.author}
                        </p>
                      </div>
                      <ChevronRight
                        className="h-5 w-5 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Books Read (planos concluídos reais) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Livros concluídos</h3>
              {completedPlans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Você ainda não concluiu nenhum livro do seu plano de leitura.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    {completedPlans.slice(0, 8).map((plan) => (
                      <Link
                        key={plan.id}
                        href={`/reading-plan/${plan.id}`}
                        className="overflow-hidden rounded-lg bg-muted shadow-sm"
                      >
                        <img
                          src={
                            plan.cover ||
                            `/open-book-library.png?height=160&width=120&query=${encodeURIComponent(
                              plan.title,
                            )}`
                          }
                          alt={plan.title}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                    ))}
                  </div>
                  {completedPlans.length > 8 && (
                    <p className="text-xs text-muted-foreground">
                      +{completedPlans.length - 8} livros concluídos
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Calendar,
  TrendingUp,
  Target,
  Edit3,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { ReadingPlan } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function ReadingPlanPage() {
  const { readingPlans, refreshReadingPlans, removeFromReadingPlan } =
    useAuth();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [reminderTime, setReminderTime] = useState<string>(() => {
    if (typeof window === "undefined") return "20:00";
    try {
      const stored = window.localStorage.getItem("lector_reminder_time");
      return stored || "20:00";
    } catch {
      return "20:00";
    }
  });
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  // Recarregar planos quando o componente montar
  useEffect(() => {
    refreshReadingPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Apenas na montagem inicial

  useEffect(() => {
    // Ordenar planos: não concluídos primeiro, concluídos no final (ordenados por data de conclusão, mais recente primeiro)
    const sortedPlans = [...(readingPlans || [])].sort((a, b) => {
      const aCompleted = a.progress === 100;
      const bCompleted = b.progress === 100;

      // Se ambos são concluídos ou ambos não são concluídos
      if (aCompleted === bCompleted) {
        if (aCompleted && a.completedAt && b.completedAt) {
          // Ambos concluídos: ordenar por data de conclusão (mais recente primeiro)
          return (
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
          );
        }
        // Ambos não concluídos: manter ordem original
        return 0;
      }

      // Se apenas um é concluído, o não concluído vem primeiro
      return aCompleted ? 1 : -1;
    });

    setPlans(sortedPlans);
  }, [readingPlans]);

  // Atualizar horário atual a cada minuto para comparar com o lembrete
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const isReminderDue = reminderTime === currentTime;

  // Calcular estatísticas gerais
  const totalProgress =
    plans.length > 0
      ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length)
      : 0;
  const totalPagesRead = plans.reduce((sum, p) => sum + p.currentPage, 0);
  const totalBooks = plans.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Plano de Leitura</h1>
              <p className="text-xs text-muted-foreground">
                {totalBooks}{" "}
                {totalBooks === 1 ? "livro ativo" : "livros ativos"}
              </p>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
            <Edit3 className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Overall Progress */}
          <div className="rounded-3xl bg-gradient-to-br from-success/10 to-primary/10 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Progresso Geral</h2>
              <TrendingUp className="h-5 w-5 text-success" strokeWidth={1.5} />
            </div>

            {/* Circular Progress */}
            <div className="flex items-center justify-between">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 56 * (1 - totalProgress / 100)
                    }`}
                    className="text-success transition-all"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{totalProgress}%</span>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-2xl font-semibold">{totalBooks}</p>
                  <p className="text-sm text-muted-foreground">Livros ativos</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalPagesRead}</p>
                  <p className="text-sm text-muted-foreground">Páginas lidas</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalProgress}%</p>
                  <p className="text-sm text-muted-foreground">
                    Progresso geral
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {plans.filter((p) => p.progress === 100).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Books in Plan */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seus Livros</h2>
              <span className="text-sm text-muted-foreground">
                {totalBooks} {totalBooks === 1 ? "livro" : "livros"} no plano
              </span>
            </div>
            {plans.length === 0 ? (
              <div className="rounded-3xl bg-card p-8 text-center shadow-sm">
                <p className="text-muted-foreground">
                  Você ainda não tem livros no seu plano de leitura.
                </p>
                <Link href="/recommendations">
                  <Button variant="outline" className="mt-4">
                    Ver recomendações
                  </Button>
                </Link>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative overflow-hidden rounded-3xl bg-card shadow-sm transition-all hover:shadow-md"
                >
                  <Link href={`/reading-plan/${plan.id}`}>
                    <div className="flex gap-4 p-5 cursor-pointer">
                      {plan.cover && (
                        <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
                          <img
                            src={plan.cover}
                            alt={plan.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold leading-tight hover:text-primary transition-colors">
                            {plan.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.author}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progresso
                            </span>
                            <span className="font-medium">
                              {plan.currentPage}/{plan.totalPages || 0} páginas
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                          {plan.steps && (
                            <p className="text-xs text-muted-foreground">
                              {plan.steps.filter((s) => s.completed).length} de{" "}
                              {plan.steps.length} etapas completadas
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        confirm(
                          `Tem certeza que deseja remover "${plan.title}" do seu plano de leitura?`
                        )
                      ) {
                        const removed = removeFromReadingPlan(plan.id);
                        if (removed) {
                          toast({
                            title: "Removido",
                            description:
                              "O livro foi removido do seu plano de leitura.",
                          });
                          refreshReadingPlans();
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Reminder Settings */}
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <h3 className="mb-3 font-semibold">Recordatórios</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Lembrete diário</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Horário configurado: {reminderTime} · Horário atual:{" "}
                    {currentTime}
                  </p>
                  {isReminderDue && (
                    <p className="text-xs font-semibold text-[color:var(--success)]">
                      É hora de ler! O horário do seu lembrete chegou.
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-transparent"
                  disabled={isSavingReminder}
                  onClick={() => {
                    try {
                      setIsSavingReminder(true);
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(
                          "lector_reminder_time",
                          reminderTime || "20:00"
                        );
                      }
                      toast({
                        title: "Lembrete salvo",
                        description: `Seu lembrete diário foi configurado para ${
                          reminderTime || "20:00"
                        }.`,
                      });
                    } finally {
                      setIsSavingReminder(false);
                    }
                  }}
                >
                  {isSavingReminder ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

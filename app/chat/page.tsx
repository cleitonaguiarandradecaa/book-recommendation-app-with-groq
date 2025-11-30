"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Send,
  Sparkles,
  BookOpen,
  Target,
  ShoppingCart,
  Loader2,
  BookmarkPlus,
  Info,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover?: string;
  genre?: string;
  pages?: number;
  price?: {
    amount: number;
    currency: string;
  };
  buyLink?: string;
  previewLink?: string;
  rating?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  books?: Book[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente literario. Puedo ayudarte a encontrar el libro perfecto, crear un plan de lectura o responder cualquier pregunta sobre libros. ¿En qué te puedo ayudar hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    { icon: BookOpen, label: "Recomendar un libro", color: "text-primary" },
    { icon: Target, label: "Crear un plan", color: "text-success" },
    {
      icon: ShoppingCart,
      label: "Comprar libro",
      color: "text-[color:var(--chart-3)]",
    },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const content = input;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Error al llamar /api/chat");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply ?? "No pude generar una respuesta en este momento.",
        timestamp: new Date(),
        books: data.books || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "Ocurrió un error al conectar con el asistente. Verifica tu conexión o inténtalo nuevamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-semibold">Asistente Literario</h1>
              <p className="text-xs text-muted-foreground">
                Siempre disponible
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-3 ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-5 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {/* Exibir livros se houver */}
              {message.books && message.books.length > 0 && (
                <div className="max-w-[80%] space-y-3">
                  {message.books.map((book) => (
                    <div
                      key={book.id}
                      className="rounded-2xl bg-card border shadow-sm overflow-hidden"
                    >
                      <div className="flex gap-4 p-4">
                        {book.cover && (
                          <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h3 className="font-semibold text-sm leading-tight">
                              {book.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {book.author}
                            </p>
                            {book.genre && (
                              <p className="text-xs text-muted-foreground">
                                {book.genre}
                              </p>
                            )}
                            {book.price && (
                              <p className="text-sm font-medium text-primary mt-1">
                                {new Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: book.price.currency,
                                }).format(book.price.amount)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5"
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    "/api/recommendations/add",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        book: {
                                          ...book,
                                          reason: "Recomendado desde el chat",
                                          level: "Intermedio",
                                        },
                                      }),
                                    }
                                  );
                                  if (res.ok) {
                                    toast({
                                      title: "Libro agregado",
                                      description: `${book.title} ha sido agregado a tus recomendaciones`,
                                    });
                                  } else {
                                    throw new Error("Error al agregar");
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "No se pudo agregar el libro",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <BookmarkPlus className="h-3.5 w-3.5" />
                              Agregar
                            </Button>
                            {book.buyLink && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() =>
                                  window.open(book.buyLink, "_blank")
                                }
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Comprar
                              </Button>
                            )}
                            {book.previewLink && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() =>
                                  window.open(book.previewLink, "_blank")
                                }
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ver
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-3xl bg-card px-5 py-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Escribiendo...
                </span>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="space-y-3 pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Acciones rápidas
              </p>
              <div className="grid gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setInput(action.label)}
                      className="flex items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:shadow-md hover:scale-[0.98]"
                    >
                      <Icon
                        className={`h-5 w-5 ${action.color}`}
                        strokeWidth={1.5}
                      />
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <div className="flex-1 rounded-3xl bg-card shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="w-full resize-none bg-transparent px-5 py-4 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 shrink-0 rounded-full shadow-lg"
          >
            <Send className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}

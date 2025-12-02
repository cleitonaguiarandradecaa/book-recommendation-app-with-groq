"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Send,
  Sparkles,
  BookOpen,
  ShoppingCart,
  Loader2,
  BookmarkPlus,
  Info,
  ExternalLink,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

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
  matchesInterests?: boolean; // Se o livro corresponde aos interesses do onboarding
  recommendationReason?: string; // Descrição gerada pela IA explicando por que foi recomendado
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  books?: Book[];
  searchTerms?: string; // Termos de busca usados para esta mensagem
  hasMoreBooks?: boolean; // Se há mais livros disponíveis
  nextStartIndex?: number; // Próximo índice para carregar mais
  needsConfirmation?: boolean; // Se precisa de confirmação do usuário
  inferredTopic?: string; // Tema inferido da mensagem
}

// Mapeamento de interesses para nomes em português
const interestToPortuguese: Record<string, string> = {
  fantasy: "fantasia",
  scifi: "ficção científica",
  romance: "romance",
  mystery: "mistério",
  thriller: "thriller",
  history: "história",
  biography: "biografia",
  psychology: "psicologia",
  business: "negócios",
  selfhelp: "autoajuda",
  poetry: "poesia",
  adventure: "aventura",
}

export default function ChatPage() {
  const {
    isAuthenticated,
    onboarding,
    isLoading: authLoading,
    recommendations,
    readingPlans,
    addRecommendation,
    toggleFavorite,
    isBookFavorite,
  } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMoreBooks, setLoadingMoreBooks] = useState<string | null>(null); // ID da mensagem que está carregando mais livros

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Inicializar mensagem com contexto personalizado
    if (isAuthenticated && onboarding) {
      const interestsText = onboarding.interests.join(", ");
      const levelText =
        onboarding.readerLevel === "beginner"
          ? "iniciante"
          : onboarding.readerLevel === "intermediate"
          ? "intermediário"
          : "avançado";

      console.log("Chat: Carregando dados de onboarding", onboarding);

      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Olá! Sou seu assistente literário. Vejo que você gosta dos gêneros: ${interestsText}, você tem ${onboarding.readingTime} minutos por dia para ler e seu nível é ${levelText}. Posso ajudá-lo a encontrar o livro perfeito baseado em suas preferências. Em que posso ajudá-lo hoje?`,
          timestamp: new Date(),
        },
      ]);
    } else if (isAuthenticated) {
      console.log("Chat: Usuário autenticado mas sem dados de onboarding");
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Olá! Sou seu assistente literário. Posso ajudá-lo a encontrar o livro perfeito ou responder qualquer pergunta sobre livros. Em que posso ajudá-lo hoje?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isAuthenticated, onboarding, authLoading, router]);

  const quickActions = [
    { icon: BookOpen, label: "Recomendar um livro", color: "text-primary" },
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
      console.log("Chat: Enviando mensagem com onboarding", onboarding);

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
          onboarding: onboarding || undefined,
          userRecommendations: recommendations || [],
          userReadingPlans: readingPlans || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao chamar /api/chat");
      }

      const data = await response.json();

      // Se há livros, não mostrar mensagem de texto (apenas os cards)
      const hasBooks = data.books && data.books.length > 0
      const replyContent = hasBooks ? "" : (data.reply?.trim() || "Não consegui gerar uma resposta neste momento.")
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyContent,
        timestamp: new Date(),
        books: data.books || [],
        searchTerms: data.searchTerms, // Termos de busca usados
        hasMoreBooks: data.hasMoreBooks, // Se há mais livros
        nextStartIndex: data.nextStartIndex, // Próximo índice
        needsConfirmation: data.needsConfirmation, // Se precisa de confirmação
        inferredTopic: data.inferredTopic, // Tema inferido
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "Ocorreu um erro ao conectar com o assistente. Verifique sua conexão ou tente novamente.",
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
              <h1 className="font-semibold">Assistente Literário</h1>
              <p className="text-xs text-muted-foreground">Sempre disponível</p>
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
              {/* Exibir mensagem de texto apenas se não houver livros E se a mensagem não estiver vazia */}
              {(!message.books || message.books.length === 0) &&
                message.content &&
                message.content.trim() !== "" && (
                  <div
                    className={`max-w-[80%] rounded-3xl px-5 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                )}

              {/* Botões de confirmação Sim/Não */}
              {message.needsConfirmation && message.inferredTopic && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="rounded-full"
                    onClick={async () => {
                      const searchMessage = `livros sobre ${message.inferredTopic}`
                      // Enviar mensagem automaticamente
                      const userMessage: Message = {
                        id: Date.now().toString(),
                        role: "user",
                        content: searchMessage,
                        timestamp: new Date(),
                      }
                      setMessages((prev) => [...prev, userMessage])
                      setIsLoading(true)

                      try {
                        const response = await fetch("/api/chat", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            messages: [...messages, userMessage].map((m) => ({
                              role: m.role,
                              content: m.content,
                            })),
                            onboarding,
                            userRecommendations: recommendations,
                            userReadingPlans: readingPlans,
                          }),
                        })

                        if (!response.ok) {
                          throw new Error("Erro ao chamar /api/chat")
                        }

                        const data = await response.json()

                        const hasBooks = data.books && data.books.length > 0
                        const replyContent = hasBooks ? "" : (data.reply?.trim() || "Não consegui gerar uma resposta neste momento.")
                        
                        const assistantMessage: Message = {
                          id: (Date.now() + 1).toString(),
                          role: "assistant",
                          content: replyContent,
                          timestamp: new Date(),
                          books: data.books || [],
                          searchTerms: data.searchTerms,
                          hasMoreBooks: data.hasMoreBooks,
                          nextStartIndex: data.nextStartIndex,
                          needsConfirmation: data.needsConfirmation,
                          inferredTopic: data.inferredTopic,
                        }

                        setMessages((prev) => [...prev, assistantMessage])
                      } catch (error) {
                        console.error(error)
                        toast({
                          title: "Erro",
                          description: "Não foi possível processar sua mensagem",
                          variant: "destructive",
                        })
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                  >
                    Sim
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      // Manter apenas a primeira mensagem (mensagem inicial do assistente)
                      // Isso garante que messages.length === 1 e o botão "Recomendar um livro" apareça
                      setMessages((prev) => prev.slice(0, 1))
                    }}
                  >
                    Não
                  </Button>
                </div>
              )}

              {/* Exibir livros se houver */}
              {(message.books && message.books.length > 0) ||
              (message.hasMoreBooks && message.searchTerms) ? (
                <div className="max-w-[80%] space-y-3">
                  {message.books && message.books.length > 0 && (
                    <>
                      {message.books
                        .filter(
                          (book, index, self) =>
                            // Remover duplicatas baseado no ID do livro
                            index === self.findIndex((b) => b.id === book.id)
                        )
                        .map((book, index) => (
                          <div
                            key={`${message.id}-${book.id}-${index}`}
                            className="rounded-2xl bg-card border shadow-sm overflow-hidden"
                          >
                            <div className="flex gap-4 p-4">
                              {book.cover && (
                                <div className="h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
                                  <img
                                    src={book.cover}
                                    alt={book.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 space-y-3">
                                <div>
                                  <h3 className="font-bold text-base leading-tight mb-1">
                                    {book.title}
                                  </h3>
                                  <p className="text-sm text-foreground mb-1">
                                    {book.author}
                                  </p>
                                  {book.genre && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {book.genre}
                                    </p>
                                  )}
                                  {book.price && (
                                    <p className="text-base font-semibold text-primary">
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: book.price.currency,
                                      }).format(book.price.amount)}
                                    </p>
                                  )}
                                  {/* Seção de recomendação - mostrar para todos os livros que têm recommendationReason */}
                                  {book.recommendationReason && (
                                    <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                      <p className="text-sm font-semibold text-primary mb-1">
                                        Por que recomendamos este livro?
                                      </p>
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {book.recommendationReason}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 text-sm gap-2 ${
                                      isBookFavorite(book.id)
                                        ? "text-destructive"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      const bookForFavorite = {
                                        ...book,
                                        genre: book.genre || "Sem gênero",
                                      };
                                      const newFavState =
                                        toggleFavorite(bookForFavorite);
                                      toast({
                                        title: newFavState
                                          ? "Adicionado aos favoritos"
                                          : "Removido dos favoritos",
                                        description: newFavState
                                          ? `${book.title} foi adicionado aos seus favoritos`
                                          : `${book.title} foi removido dos seus favoritos`,
                                      });
                                    }}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        isBookFavorite(book.id)
                                          ? "fill-current"
                                          : ""
                                      }`}
                                    />
                                    {isBookFavorite(book.id)
                                      ? "Nos favoritos"
                                      : "Favorito"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-sm gap-2"
                                    onClick={async () => {
                                      try {
                                        // Salvar no localStorage do usuário via contexto
                                        // Usar a descrição gerada pela IA se disponível, senão criar uma genérica
                                        // Se o livro corresponde aos interesses mas não tem recommendationReason, gerar uma descrição básica
                                        let recommendationReason = book.recommendationReason
                                        
                                        if (!recommendationReason && book.matchesInterests && onboarding && onboarding.interests.length > 0) {
                                          const interestsText = onboarding.interests
                                            .map((interest) => interestToPortuguese[interest] || interest)
                                            .join(", ")
                                          recommendationReason = `Este livro combina perfeitamente com seus interesses de leitura: ${interestsText}. Uma escolha ideal para você!`
                                        }
                                        
                                        if (!recommendationReason) {
                                          recommendationReason = "Recomendado do chat"
                                        }

                                        const added = addRecommendation({
                                          ...book,
                                          genre: book.genre || "Sem gênero",
                                          reason: recommendationReason,
                                          level: onboarding?.readerLevel === "beginner" 
                                            ? "Iniciante" 
                                            : onboarding?.readerLevel === "intermediate" 
                                            ? "Intermediário" 
                                            : "Avançado",
                                        });

                                        if (added) {
                                          // Remover o livro da lista de livros da mensagem
                                          setMessages((prev) =>
                                            prev.map((m) =>
                                              m.id === message.id
                                                ? {
                                                    ...m,
                                                    books:
                                                      m.books?.filter(
                                                        (b) => b.id !== book.id
                                                      ) || [],
                                                  }
                                                : m
                                            )
                                          );

                                          toast({
                                            title: "Livro adicionado",
                                            description: `${book.title} foi adicionado às suas recomendações`,
                                          });
                                        } else {
                                          toast({
                                            title: "Já existe",
                                            description: `${book.title} já está nas suas recomendações`,
                                          });
                                        }
                                      } catch (error) {
                                        console.error(error);
                                        toast({
                                          title: "Erro",
                                          description:
                                            "Não foi possível adicionar o livro",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <BookmarkPlus className="h-4 w-4" />
                                    Agregar
                                  </Button>
                                  {book.buyLink ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 text-sm gap-2"
                                      onClick={() =>
                                        window.open(book.buyLink, "_blank")
                                      }
                                    >
                                      <ShoppingCart className="h-4 w-4" />
                                      Comprar
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 text-sm gap-2"
                                      disabled
                                    >
                                      <ShoppingCart className="h-4 w-4" />
                                      Comprar
                                    </Button>
                                  )}
                                  {book.previewLink ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 text-sm gap-2"
                                      onClick={() =>
                                        window.open(book.previewLink, "_blank")
                                      }
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      Ver
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 text-sm gap-2"
                                      disabled
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      Ver
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* Botão para carregar mais livros - sempre visível se houver mais livros disponíveis */}
                  {message.hasMoreBooks && message.searchTerms && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      disabled={loadingMoreBooks === message.id}
                      onClick={async () => {
                        setLoadingMoreBooks(message.id);
                        try {
                          const res = await fetch("/api/books/load-more", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              searchTerms: message.searchTerms,
                              startIndex: message.nextStartIndex || 5,
                              onboarding: onboarding || undefined,
                              userRecommendations: recommendations || [],
                              userReadingPlans: readingPlans || [],
                            }),
                          });

                          if (!res.ok)
                            throw new Error("Erro ao carregar mais livros");

                          const data = await res.json();

                          // Atualizar a mensagem com os novos livros, removendo duplicatas
                          setMessages((prev) =>
                            prev.map((m) => {
                              if (m.id === message.id) {
                                const existingBookIds = new Set(
                                  (m.books || []).map((b) => b.id)
                                );
                                const newBooks = data.books.filter(
                                  (book: Book) => !existingBookIds.has(book.id)
                                );
                                return {
                                  ...m,
                                  books: [...(m.books || []), ...newBooks],
                                  hasMoreBooks: data.hasMore,
                                  nextStartIndex: data.nextStartIndex,
                                };
                              }
                              return m;
                            })
                          );
                        } catch (error) {
                          console.error(error);
                          toast({
                            title: "Erro",
                            description:
                              "Não foi possível carregar mais livros",
                            variant: "destructive",
                          });
                        } finally {
                          setLoadingMoreBooks(null);
                        }
                      }}
                    >
                      {loadingMoreBooks === message.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        "Mostrar mais livros"
                      )}
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-3xl bg-card px-5 py-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Digitando...
                </span>
              </div>
            </div>
          )}

          {/* Mostrar quick actions apenas na abertura do chat (quando há apenas 1 mensagem) */}
          {messages.length === 1 && (
            <div className="space-y-3 pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Ações rápidas
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
              placeholder="Digite sua mensagem..."
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

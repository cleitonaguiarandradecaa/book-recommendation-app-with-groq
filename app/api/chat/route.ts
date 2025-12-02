import { NextResponse } from "next/server"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

function getSystemPrompt(
  onboarding?: { interests: string[]; readingTime: number; readerLevel: string },
  isBookSearch: boolean = false
): string {
  let prompt = `
Você é um assistente literário conversacional.
- Você fala SEMPRE em português brasileiro.
${isBookSearch
      ? `- CRÍTICO: O usuário está pedindo livros específicos. O sistema JÁ ESTÁ BUSCANDO os livros na API do Google Books.
- Responda APENAS com "." (ponto) ou uma string vazia. NÃO escreva mais nada.
- NÃO recomende livros, NÃO mencione títulos, NÃO dê explicações. O sistema mostrará os resultados automaticamente.
- Sua resposta será ignorada, apenas responda com "."`
      : `- Você recomenda livros com explicações claras e amigáveis.
- Você pode propor planos de leitura (por dias ou semanas) de acordo com o tempo disponível.
- Você pode responder perguntas sobre livros, gêneros, autores, etc.`}
Não invente APIs nem dados de pagamento. Apenas fale sobre recomendações, leitura e organização.
`.trim()

  if (onboarding) {
    const interestsText = onboarding.interests.join(", ")
    const levelText = onboarding.readerLevel === "beginner" ? "iniciante"
      : onboarding.readerLevel === "intermediate" ? "intermediário"
        : "avançado"

    prompt += `\n\nINFORMAÇÕES DO USUÁRIO:
- Gêneros favoritos: ${interestsText}
- Tempo de leitura diário: ${onboarding.readingTime} minutos
- Nível de leitura: ${levelText}

Use essas informações para personalizar suas recomendações. Priorize os gêneros que o usuário gosta e sugira livros apropriados para seu nível de leitura.`
  } else {
    prompt += `\n\n- Você faz perguntas para entender gostos, interesses e nível de leitura do usuário se não os conhece.`
  }

  return prompt
}

// Función para detectar si o usuário está pedindo livros
function shouldSearchBooks(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  const keywords = [
    // Español
    "recomendar",
    "recomendación",
    "recomendaciones",
    "buscar libro",
    "buscar libros",
    "comprar libro",
    "comprar libros",
    "libro sobre",
    "libros de",
    "libro de",
    "libros con",
    "libro con",
    "quiero leer",
    "quiero libros",
    "quiero un libro",
    "necesito libros",
    "necesito un libro",
    "dame libros",
    "muéstrame libros",
    "libros que",
    "libro que",
    "libros sobre",
    "me gusta",
    "género",
    "autor",
    // Português
    "quero livros",
    "quero um livro",
    "quero livro",
    "livros com",
    "livro com",
    "livros de",
    "livro de",
    "livros sobre",
    "livro sobre",
    "buscar livros",
    "buscar livro",
    "recomendar livros",
    "recomendar livro",
    "preciso de livros",
    "preciso de livro",
    "me mostre livros",
    "mostre livros",
    "me dê livros",
    "dê livros",
    "sugira livros",
    "sugira livro",
    "indique livros",
    "indique livro",
  ]
  return keywords.some((keyword) => lowerMessage.includes(keyword))
}

// Mapeamento de interesses para termos de busca
const interestToSearchTerm: Record<string, string> = {
  fantasy: "fantasía",
  scifi: "ciencia ficción",
  romance: "romance",
  mystery: "misterio",
  thriller: "thriller",
  history: "historia",
  biography: "biografía",
  psychology: "psicología",
  business: "negocios",
  selfhelp: "autoayuda",
  poetry: "poesía",
  adventure: "aventura",
}

// Mapeamento de interesses para português
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

// Função para gerar descrição de recomendação usando IA
async function generateRecommendationReason(
  book: { title: string; author: string; description?: string; genre?: string },
  userInterests: string[],
  groqApiKey?: string
): Promise<string> {
  if (!groqApiKey) {
    // Fallback sem IA
    const interestsText = userInterests
      .map((interest) => interestToPortuguese[interest] || interest)
      .join(", ")
    return `Recomendado porque corresponde aos seus interesses de leitura: ${interestsText}`
  }

  try {
    const interestsText = userInterests
      .map((interest) => interestToPortuguese[interest] || interest)
      .join(", ")

    // Verificar se o livro corresponde aos interesses (baseado no gênero)
    const bookGenreLower = (book.genre || "").toLowerCase()
    const matchesInterests = userInterests.some(interest => {
      const interestTerm = interestToSearchTerm[interest]?.toLowerCase() || ""
      return bookGenreLower.includes(interestTerm) || interestTerm.includes(bookGenreLower)
    })

    const prompt = matchesInterests
      ? `Você é um assistente literário. Crie uma frase curta e personalizada (máximo 2 linhas) explicando por que este livro foi recomendado para um leitor que gosta de: ${interestsText}.

Informações do livro:
- Título: ${book.title}
- Autor: ${book.author}
- Gênero: ${book.genre || "Não especificado"}
${book.description ? `- Sinopse: ${book.description.substring(0, 200)}...` : ""}

Crie uma frase natural e envolvente em português brasileiro que explique por que este livro combina perfeitamente com os interesses do leitor. Seja específico e evite frases genéricas como "Recomendado do chat".

Frase de recomendação:`
      : `Você é um assistente literário. Crie uma frase curta e personalizada (máximo 2 linhas) explicando por que este livro foi recomendado, mesmo que não corresponda diretamente aos interesses do leitor (${interestsText}).

Informações do livro:
- Título: ${book.title}
- Autor: ${book.author}
- Gênero: ${book.genre || "Não especificado"}
${book.description ? `- Sinopse: ${book.description.substring(0, 200)}...` : ""}

Crie uma frase natural e envolvente em português brasileiro que destaque os pontos fortes do livro e por que ele pode ser interessante. Seja específico e evite frases genéricas como "Recomendado do chat".

Frase de recomendação:`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Você é um assistente literário que cria descrições personalizadas de recomendações de livros em português brasileiro. Seja conciso e específico.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const generatedReason = data?.choices?.[0]?.message?.content?.trim() || ""
      if (generatedReason) {
        return generatedReason
      }
    }
  } catch (error) {
    console.error("Erro ao gerar descrição de recomendação:", error)
  }

  // Fallback se a IA falhar
  const interestsText = userInterests
    .map((interest) => interestToPortuguese[interest] || interest)
    .join(", ")
  return `Recomendado porque corresponde aos seus interesses de leitura: ${interestsText}`
}

// Función para extrair termos de busca usando Groq quando há características específicas
async function extractSearchTermsWithAI(
  message: string,
  onboarding?: { interests: string[]; readingTime: number; readerLevel: string },
  groqApiKey?: string,
  isSpecificSearch: boolean = true
): Promise<string> {
  // Verificar se a mensagem tem características específicas que justificam usar IA
  const lowerMessage = message.toLowerCase()
  const hasSpecificCharacteristics =
    lowerMessage.includes("con") ||
    lowerMessage.includes("com") || // Português
    lowerMessage.includes("que tenga") ||
    lowerMessage.includes("que tenha") || // Português
    lowerMessage.includes("que sea") ||
    lowerMessage.includes("sobre") ||
    lowerMessage.includes("temática") ||
    lowerMessage.includes("tema") ||
    lowerMessage.includes("com características") || // Português
    lowerMessage.includes("com dragões") || // Português
    lowerMessage.includes("com dragones") || // Espanhol
    lowerMessage.includes("dragões") || // Português
    lowerMessage.includes("dragones") || // Espanhol
    message.length > 20 // Mensagens mais longas provavelmente têm mais detalhes

  // Se não há API key, usar método simples (indicando se é busca específica)
  if (!groqApiKey) {
    return extractSearchTermsSimple(message, onboarding, hasSpecificCharacteristics || isSpecificSearch)
  }

  // Se não tem características específicas, usar método simples (sem combinar com interesses se for específica)
  if (!hasSpecificCharacteristics) {
    return extractSearchTermsSimple(message, onboarding, isSpecificSearch)
  }

  try {
    // Usar Groq para extrair características e criar query de busca
    // IMPORTANTE: Para buscas específicas, NÃO mencionar os interesses do onboarding no prompt
    const extractionPrompt = `Analise a seguinte solicitação do usuário e extraia as características específicas dos livros que ele busca. 
Responda APENAS com uma query de busca otimizada para a API do Google Books (máximo 10 palavras-chave relevantes).
Não inclua palavras como "livro", "recomendar", "buscar" - apenas termos de busca.

${isSpecificSearch
        ? `CRÍTICO: Esta é uma busca ESPECÍFICA. Você deve extrair APENAS os termos específicos mencionados pelo usuário.
NÃO inclua gêneros genéricos, NÃO use preferências do usuário, NÃO adicione informações adicionais.
Apenas extraia exatamente o que o usuário pediu.`
        : ""}

Solicitação do usuário: "${message}"

${!isSpecificSearch && onboarding && onboarding.interests.length > 0
        ? `Gêneros favoritos do usuário: ${onboarding.interests.map((i: string) => interestToSearchTerm[i] || i).join(", ")}`
        : ""}

Exemplos:
${isSpecificSearch
        ? `- "quero livros com dragões" → "dragões"
- "livros sobre viagens no tempo" → "viagens tempo"
- "romances com protagonista feminino" → "protagonista feminino"`
        : `- "quero um livro de ficção científica sobre viagens no tempo" → "ficção científica viagens tempo"
- "livros de romance históricos ambientados no século XIX" → "romance histórico século XIX"
- "romances de mistério com protagonista feminino" → "mistério protagonista feminino"`}

Query de busca:`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Você é um assistente que extrai termos de busca de livros. Responda apenas com os termos de busca, sem explicações." },
          { role: "user", content: extractionPrompt }
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    })

    if (groqRes.ok) {
      const data = await groqRes.json()
      let extractedTerms = data?.choices?.[0]?.message?.content?.trim()

      if (extractedTerms && extractedTerms.length > 0) {
        // Filtrar termos inválidos que não devem ser usados em buscas
        const invalidTerms = ["crítico", "critico", "crítico", "critical", "literary criticism", "literatura crítica"]
        const hasInvalidTerms = invalidTerms.some(term =>
          extractedTerms!.toLowerCase().includes(term.toLowerCase())
        )

        if (hasInvalidTerms) {
          console.log("API Chat: Termos inválidos detectados no resultado do Groq:", extractedTerms)
          // Se for uma busca genérica e tiver onboarding, usar apenas interesses
          if (!isSpecificSearch && onboarding && onboarding.interests.length > 0) {
            const interestTerms = onboarding.interests
              .map((interest) => interestToSearchTerm[interest])
              .filter(Boolean)
              .join(" OR ")
            console.log("API Chat: Usando interesses do onboarding em vez de termos inválidos")
            return interestTerms
          }
          // Para buscas específicas, remover apenas os termos inválidos
          invalidTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, "gi")
            extractedTerms = extractedTerms!.replace(regex, " ").trim()
          })
          extractedTerms = extractedTerms.replace(/\s+/g, " ").trim()
        }

        if (extractedTerms && extractedTerms.length > 0) {
          console.log("API Chat: Termos extraídos pelo Groq:", extractedTerms)
          return extractedTerms
        }
      }
    }
  } catch (error) {
    console.error("Error ao extrair termos com Groq:", error)
  }

  // Fallback para método simples (é busca específica, então não combinar com interesses)
  return extractSearchTermsSimple(message, onboarding, true)
}

// Función simple para extrair termos de busca (fallback)
function extractSearchTermsSimple(
  message: string,
  onboarding?: { interests: string[]; readingTime: number; readerLevel: string },
  isSpecificSearch: boolean = false
): string {
  const lowerMessage = message.toLowerCase()

  // Remover palavras comuns (espanhol e português)
  const stopWords = [
    // Español
    "quiero",
    "me gusta",
    "buscar",
    "recomendar",
    "recomendación",
    "recomendaciones",
    "comprar",
    "libro",
    "libros",
    "sobre",
    "de",
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "por favor",
    "puedes",
    "podrías",
    // Português
    "quero",
    "gosto",
    "gostaria",
    "preciso",
    "precisaria",
    "livro",
    "livros",
    "um",
    "uma",
    "por favor",
    "pode",
    "poderia",
    "desejo",
    "desejaria",
  ]

  let searchTerm = message
  stopWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    searchTerm = searchTerm.replace(regex, " ")
  })

  searchTerm = searchTerm.trim().replace(/\s+/g, " ")

  // Se é uma busca específica, retornar apenas o termo do usuário sem combinar com interesses
  if (isSpecificSearch) {
    return searchTerm || message
  }

  // Se o usuário não especificou um termo e tem interesses no onboarding, usar os interesses
  if (!searchTerm && onboarding && onboarding.interests.length > 0) {
    const interestTerms = onboarding.interests
      .map((interest) => interestToSearchTerm[interest])
      .filter(Boolean)
      .join(" OR ")
    return interestTerms
  }

  // Se o usuário especificou um termo mas tem interesses, combinar (apenas para buscas genéricas)
  if (searchTerm && onboarding && onboarding.interests.length > 0) {
    const interestTerms = onboarding.interests
      .slice(0, 2) // Usar apenas os 2 primeiros interesses para não sobrecarregar
      .map((interest) => interestToSearchTerm[interest])
      .filter(Boolean)
      .join(" OR ")

    // Combinar termo do usuário com interesses
    return `${searchTerm} ${interestTerms}`
  }

  return searchTerm || message
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = (body?.messages || []) as ChatMessage[]
    const onboarding = body?.onboarding as { interests: string[]; readingTime: number; readerLevel: string } | undefined
    const userRecommendations = (body?.userRecommendations || []) as Array<{ id: string }>
    const userReadingPlans = (body?.userReadingPlans || []) as Array<{ bookId: string }>
    const lastMessage = messages[messages.length - 1]?.content || ""

    console.log("API Chat: Recebendo dados de onboarding", onboarding)
    console.log("API Chat: Recomendações do usuário", userRecommendations.length)
    console.log("API Chat: Planos de leitura do usuário", userReadingPlans.length)

    // Verificar se o usuário está pedindo livros
    const needsBookSearch = shouldSearchBooks(lastMessage)
    let books: any[] = []
    let searchTerms: string = ""
    let hasMore = false
    let nextStartIndex = 0

    // Obter API key do Groq para extração de características
    const groqApiKey = process.env.GROQ_API_KEY

    // Tentar inferir contexto e perguntar se quer livros sobre o tema
    // Isso funciona para mensagens que não são busca de livros
    if (!needsBookSearch && groqApiKey) {
      try {
        // Usar Groq para extrair o termo principal/tema da mensagem
        // Remover palavras comuns de busca de livros para extrair apenas o tema
        const cleanedMessage = lastMessage
          .toLowerCase()
          .replace(/\b(livros?|libros?|recomendar|recomendaci[oó]n|buscar|comprar|sobre|de|com|um|uma|el|la|los|las)\b/gi, "")
          .trim()
        
        if (cleanedMessage.length > 0) {
          const contextPrompt = `Analise a seguinte mensagem do usuário e extraia o termo principal/tema sobre o qual ele está falando. 
Responda APENAS com o termo principal em 1-3 palavras, sem explicações.
Se não conseguir identificar um tema claro ou a mensagem for muito genérica, responda com "N/A".

Mensagem original: "${lastMessage}"
Mensagem limpa: "${cleanedMessage}"

Termo principal/tema:`

          const contextRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: "Você é um assistente que extrai termos principais de mensagens. Responda apenas com o termo em 1-3 palavras, ou 'N/A' se não conseguir identificar." },
                { role: "user", content: contextPrompt }
              ],
              temperature: 0.3,
              max_tokens: 20,
            }),
          })

          if (contextRes.ok) {
            const contextData = await contextRes.json()
            const inferredTopic = contextData?.choices?.[0]?.message?.content?.trim() || ""
            
            // Se conseguiu inferir um tema válido (não é "N/A" e tem conteúdo)
            if (inferredTopic && inferredTopic.toLowerCase() !== "n/a" && inferredTopic.length > 0 && inferredTopic.length < 50) {
              return NextResponse.json({
                reply: `Você gostaria de livros sobre ${inferredTopic}?`,
                books: [],
                needsConfirmation: true,
                inferredTopic: inferredTopic,
              })
            }
          }
        }
      } catch (error) {
        console.error("Erro ao inferir contexto:", error)
      }
    }

    if (needsBookSearch) {
      try {
        // Verificar se é uma recomendação genérica (sem características específicas)
        const lowerLastMessage = lastMessage.toLowerCase().trim()
        const trimmedMessage = lastMessage.trim()

        // Mensagens simples de recomendação que SEMPRE são genéricas
        const simpleRecommendationPatterns = [
          // Español
          /^recomendar\s+(un\s+)?libro(s)?\.?$/i,
          /^recomendaci[oó]n(es)?\.?$/i,
          /^recomendar\.?$/i,
          // Português
          /^recomendar\s+um\s+livro(s)?\.?$/i,
        ]

        const isSimpleRecommendation = simpleRecommendationPatterns.some(pattern =>
          pattern.test(trimmedMessage)
        )
        
        // Verificar se a mensagem contém "livros" mas é ambígua (ex: "livros dragon ball z")
        // NÃO perguntar se a mensagem já contém "livros sobre [tema]" - isso indica uma busca direta após confirmação
        const hasBookKeyword = /livros?|libros?/i.test(lastMessage)
        const isDirectSearchAfterConfirmation = /livros?\s+sobre/i.test(lastMessage)
        
        if (hasBookKeyword && !isSimpleRecommendation && !isDirectSearchAfterConfirmation && groqApiKey) {
          try {
            const cleanedMessage = lastMessage
              .toLowerCase()
              .replace(/\b(livros?|libros?|recomendar|recomendaci[oó]n|buscar|comprar|sobre|de|com|um|uma|el|la|los|las)\b/gi, "")
              .trim()
            
            if (cleanedMessage.length > 0) {
              const contextPrompt = `Extraia o termo principal/tema desta mensagem. Apenas o tema em 1-3 palavras, sem explicações.
Se não conseguir identificar, responda "N/A".

Mensagem: "${cleanedMessage}"

Termo:`
              
              const contextRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify({
                  model: "llama-3.1-8b-instant",
                  messages: [
                    { role: "system", content: "Você extrai termos principais. Responda apenas com o termo em 1-3 palavras ou 'N/A'." },
                    { role: "user", content: contextPrompt }
                  ],
                  temperature: 0.3,
                  max_tokens: 20,
                }),
              })

              if (contextRes.ok) {
                const contextData = await contextRes.json()
                const inferredTopic = contextData?.choices?.[0]?.message?.content?.trim() || ""
                
                if (inferredTopic && inferredTopic.toLowerCase() !== "n/a" && inferredTopic.length > 0 && inferredTopic.length < 50) {
                  // Retornar pergunta de confirmação
                  return NextResponse.json({
                    reply: `Você gostaria de livros sobre ${inferredTopic}?`,
                    books: [],
                    needsConfirmation: true,
                    inferredTopic: inferredTopic,
                  })
                }
              }
            }
          } catch (error) {
            console.error("Erro ao inferir tema de busca ambígua:", error)
            // Continuar com a busca normal se falhar
          }
        }

        // Verificar se tem características específicas (apenas se NÃO for recomendação simples)
        const hasSpecificCharacteristics = !isSimpleRecommendation && (
          lowerLastMessage.includes("con") ||
          lowerLastMessage.includes("com") ||
          lowerLastMessage.includes("sobre") ||
          lowerLastMessage.includes("que tenga") ||
          lowerLastMessage.includes("que tenha") ||
          lowerLastMessage.includes("que sea") ||
          lowerLastMessage.includes("temática") ||
          lowerLastMessage.includes("tema") ||
          lowerLastMessage.includes("características") ||
          lowerLastMessage.includes("dragões") ||
          lowerLastMessage.includes("dragones") ||
          trimmedMessage.length > 30 // Mensagens muito longas provavelmente têm especificações
        )

        // É genérica se for recomendação simples OU se contém "recomendar" sem características específicas
        const isGenericRequest = isSimpleRecommendation || (
          (lowerLastMessage.includes("recomendar") ||
            lowerLastMessage.includes("recomendación") ||
            lowerLastMessage.includes("recomendaciones")) &&
          !hasSpecificCharacteristics
        )

        console.log("API Chat: isGenericRequest:", isGenericRequest)
        console.log("API Chat: isSimpleRecommendation:", isSimpleRecommendation)
        console.log("API Chat: hasSpecificCharacteristics:", hasSpecificCharacteristics)
        console.log("API Chat: lastMessage:", lastMessage)
        console.log("API Chat: trimmedMessage:", trimmedMessage)
        console.log("API Chat: trimmedMessage.length:", trimmedMessage.length)

        // Se a mensagem é "livros sobre [tema]", extrair o tema diretamente
        if (isDirectSearchAfterConfirmation) {
          const match = lastMessage.match(/livros?\s+sobre\s+(.+)/i)
          if (match && match[1]) {
            searchTerms = match[1].trim()
            console.log("API Chat: Busca direta após confirmação, termo extraído:", searchTerms)
          } else {
            // Fallback: usar extractSearchTermsWithAI
            searchTerms = await extractSearchTermsWithAI(lastMessage, onboarding, groqApiKey, true)
            console.log("API Chat: Termos de busca extraídos (fallback):", searchTerms)
          }
        } else if (isGenericRequest && onboarding && onboarding.interests.length > 0) {
          // Usar apenas os interesses do onboarding para busca genérica
          const interestTerms = onboarding.interests
            .map((interest) => interestToSearchTerm[interest])
            .filter(Boolean)
            .join(" OR ")
          searchTerms = interestTerms
          console.log("API Chat: Buscando livros baseado nos interesses do onboarding", interestTerms)
        } else {
          // Extrair termos usando IA quando há características específicas
          // Passar true para isSpecificSearch para não usar interesses do onboarding
          console.log("API Chat: Busca específica detectada, não usando interesses do onboarding")
          searchTerms = await extractSearchTermsWithAI(lastMessage, onboarding, groqApiKey, true)
          console.log("API Chat: Termos de busca extraídos (sem interesses):", searchTerms)
        }

        // VALIDAÇÃO CRÍTICA: Para buscas genéricas, garantir que sempre use apenas interesses do onboarding
        // Se detectamos que é uma busca genérica mas searchTerms não contém os interesses, corrigir
        if (isGenericRequest && onboarding && onboarding.interests.length > 0) {
          const expectedTerms = onboarding.interests
            .map((interest) => interestToSearchTerm[interest])
            .filter(Boolean)

          // Verificar se searchTerms contém algum dos termos esperados
          const hasExpectedTerms = expectedTerms.some(term =>
            searchTerms.toLowerCase().includes(term.toLowerCase())
          )

          // Se não contém os termos esperados ou contém termos inválidos, usar apenas os interesses
          const invalidTerms = ["crítico", "critico", "crítico", "critical", "literary criticism"]
          const hasInvalidTerms = invalidTerms.some(term =>
            searchTerms.toLowerCase().includes(term.toLowerCase())
          )

          if (!hasExpectedTerms || hasInvalidTerms) {
            console.log("API Chat: CORREÇÃO - searchTerms inválido detectado, usando apenas interesses do onboarding")
            const interestTerms = onboarding.interests
              .map((interest) => interestToSearchTerm[interest])
              .filter(Boolean)
              .join(" OR ")
            searchTerms = interestTerms
            console.log("API Chat: Termos corrigidos:", searchTerms)
          }
        }

        // Buscar diretamente na Google Books API (primeiros 5 resultados)
        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&startIndex=0&maxResults=10&langRestrict=es`
        console.log("API Chat: URL da Google Books API:", googleBooksUrl)
        console.log("API Chat: Termos de busca (decodificado):", decodeURIComponent(searchTerms))

        const booksRes = await fetch(googleBooksUrl)

        if (booksRes.ok) {
          const data = await booksRes.json()
          const totalItems = data.totalItems || 0
          hasMore = totalItems > 5

          console.log("API Chat: Total de itens encontrados:", totalItems)
          console.log("API Chat: Itens retornados:", data.items?.length || 0)

          // Transformar os resultados da Google Books
          let allBooks = (data.items || []).map((item: any) => {
            const volumeInfo = item.volumeInfo || {}
            const saleInfo = item.saleInfo || {}

            const imageLinks = volumeInfo.imageLinks || {}
            const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail

            const price = saleInfo.listPrice || saleInfo.retailPrice

            // Verificar se o livro corresponde aos interesses do usuário
            const bookCategories = (volumeInfo.categories || []).map((cat: string) => cat.toLowerCase())
            let matchesInterests = false
            if (onboarding && onboarding.interests.length > 0) {
              const interestTerms = onboarding.interests.map(i => interestToSearchTerm[i]?.toLowerCase()).filter(Boolean)
              matchesInterests = bookCategories.some((cat: string) =>
                interestTerms.some((interest: string) => cat.includes(interest) || interest.includes(cat))
              )
            }

            return {
              id: item.id,
              title: volumeInfo.title || "Sem título",
              author: (volumeInfo.authors || ["Autor desconhecido"]).join(", "),
              description: volumeInfo.description,
              cover: cover?.replace("http://", "https://"),
              genre: volumeInfo.categories?.[0] || volumeInfo.categories?.join(", ") || "Sem categoria",
              pages: volumeInfo.pageCount,
              publishedDate: volumeInfo.publishedDate,
              rating: volumeInfo.averageRating,
              price: price ? {
                amount: price.amount,
                currency: price.currencyCode || "USD"
              } : undefined,
              buyLink: saleInfo.buyLink,
              previewLink: volumeInfo.previewLink || volumeInfo.infoLink,
              matchesInterests, // Flag para indicar se corresponde aos interesses
            }
          })

          console.log("API Chat: Livros transformados:", allBooks.length)

          // Priorizar livros que correspondem aos interesses do usuário (apenas para buscas genéricas)
          if (!hasSpecificCharacteristics && onboarding && onboarding.interests.length > 0) {
            allBooks.sort((a: any, b: any) => {
              if (a.matchesInterests && !b.matchesInterests) return -1
              if (!a.matchesInterests && b.matchesInterests) return 1
              return 0
            })
            console.log("API Chat: Livros ordenados por correspondência aos interesses")
          }

          // Filtrar livros que já estão nas recomendações do usuário ou no plano de leitura
          const recommendedBookIds = new Set(userRecommendations.map((r) => String(r.id)))
          const readingPlanBookIds = new Set(userReadingPlans.map((p) => String(p.bookId)))
          const excludedBookIds = new Set([...recommendedBookIds, ...readingPlanBookIds])
          const filteredBooks = allBooks.filter((book: any) => !excludedBookIds.has(book.id))

          // Se não temos 5 livros após filtrar, buscar mais para completar
          const targetCount = 5
          let startIndex = 10 // Começar de onde paramos (já buscamos 10)
          let additionalFetches = 0
          const maxAdditionalFetches = 5 // Limitar tentativas adicionais

          while (filteredBooks.length < targetCount && startIndex < totalItems && additionalFetches < maxAdditionalFetches) {
            const additionalUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&startIndex=${startIndex}&maxResults=${targetCount * 2}&langRestrict=es`
            const additionalRes = await fetch(additionalUrl)

            if (additionalRes.ok) {
              const additionalData = await additionalRes.json()
              const additionalBooks = (additionalData.items || []).map((item: any) => {
                const volumeInfo = item.volumeInfo || {}
                const saleInfo = item.saleInfo || {}
                const imageLinks = volumeInfo.imageLinks || {}
                const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail
                const price = saleInfo.listPrice || saleInfo.retailPrice
                const bookCategories = (volumeInfo.categories || []).map((cat: string) => cat.toLowerCase())
                let matchesInterests = false
                if (onboarding && onboarding.interests.length > 0) {
                  const interestTerms = onboarding.interests.map(i => interestToSearchTerm[i]?.toLowerCase()).filter(Boolean)
                  matchesInterests = bookCategories.some((cat: string) =>
                    interestTerms.some((interest: string) => cat.includes(interest) || interest.includes(cat))
                  )
                }

                return {
                  id: item.id,
                  title: volumeInfo.title || "Sem título",
                  author: (volumeInfo.authors || ["Autor desconhecido"]).join(", "),
                  description: volumeInfo.description,
                  cover: cover?.replace("http://", "https://"),
                  genre: volumeInfo.categories?.[0] || volumeInfo.categories?.join(", ") || "Sem categoria",
                  pages: volumeInfo.pageCount,
                  publishedDate: volumeInfo.publishedDate,
                  rating: volumeInfo.averageRating,
                  price: price ? {
                    amount: price.amount,
                    currency: price.currencyCode || "USD"
                  } : undefined,
                  buyLink: saleInfo.buyLink,
                  previewLink: volumeInfo.previewLink || volumeInfo.infoLink,
                  matchesInterests,
                }
              })

              // Filtrar os novos livros também (excluindo os que estão nas recomendações ou no plano de leitura)
              const newFilteredBooks = additionalBooks.filter((book: any) => !excludedBookIds.has(book.id))
              filteredBooks.push(...newFilteredBooks)
              startIndex += additionalData.items?.length || 0
              additionalFetches++

              // Se não há mais itens, parar
              if (!additionalData.items || additionalData.items.length === 0) break
            } else {
              break
            }
          }

          // Limitar a 5 resultados iniciais
          books = filteredBooks.slice(0, targetCount)

          // Gerar descrições de recomendação usando IA para TODOS os livros recomendados do chat
          // Se o livro corresponde aos interesses, usar os interesses na descrição
          // Se não corresponde, gerar uma descrição genérica mas personalizada
          if (groqApiKey && onboarding && onboarding.interests.length > 0) {
            console.log("API Chat: Gerando descrições de recomendação para todos os livros...")
            console.log("API Chat: Total de livros:", books.length)
            console.log("API Chat: Livros com matchesInterests:", books.filter((b: any) => b.matchesInterests).length)
            
            const booksWithRecommendations = await Promise.all(
              books.map(async (book: any) => {
                // Gerar descrição para todos os livros, não apenas os que correspondem aos interesses
                console.log(`API Chat: Gerando descrição para: ${book.title} (matchesInterests: ${book.matchesInterests})`)
                try {
                  const recommendationReason = await generateRecommendationReason(
                    {
                      title: book.title,
                      author: book.author,
                      description: book.description,
                      genre: book.genre,
                    },
                    onboarding.interests,
                    groqApiKey
                  )
                  console.log(`API Chat: Descrição gerada para ${book.title}:`, recommendationReason.substring(0, 50) + "...")
                  return {
                    ...book,
                    recommendationReason,
                  }
                } catch (error) {
                  console.error("Erro ao gerar descrição para livro:", book.title, error)
                  // Fallback sem IA
                  if (book.matchesInterests) {
                    const interestsText = onboarding.interests
                      .map((interest) => interestToPortuguese[interest] || interest)
                      .join(", ")
                    return {
                      ...book,
                      recommendationReason: `Este livro combina perfeitamente com seus interesses de leitura: ${interestsText}. Uma escolha ideal para você!`,
                    }
                  } else {
                    // Para livros que não correspondem aos interesses, criar uma descrição genérica
                    return {
                      ...book,
                      recommendationReason: `Recomendado especialmente para você! Este livro pode ser uma excelente adição à sua biblioteca.`,
                    }
                  }
                }
              })
            )
            books = booksWithRecommendations
            console.log("API Chat: Descrições de recomendação geradas")
            console.log("API Chat: Exemplo de recommendationReason:", books.find((b: any) => b.recommendationReason)?.recommendationReason?.substring(0, 100))
          }

          // Atualizar informações de paginação
          hasMore = totalItems > books.length || filteredBooks.length > targetCount
          nextStartIndex = books.length

          console.log("API Chat: Livros encontrados:", books.length)
          console.log("API Chat: Primeiro livro:", books[0]?.title)
          console.log("API Chat: Primeiro livro tem recommendationReason?", books[0]?.recommendationReason)
          console.log("API Chat: Primeiro livro matchesInterests?", books[0]?.matchesInterests)
        } else {
          const errorText = await booksRes.text()
          console.error("API Chat: Erro na API do Google Books:", booksRes.status, errorText)
          console.log("API Chat: Nenhum livro encontrado na API do Google Books")
        }
      } catch (error) {
        console.error("Error searching books:", error)
      }
    } else {
      console.log("API Chat: Busca de livros não necessária ou searchTerms vazio")
    }

    // Se houver busca de livros, SEMPRE retornar apenas os livros (ou mensagem de erro) sem chamar o Groq
    if (needsBookSearch) {
      if (searchTerms && books.length > 0) {
        // Livros encontrados: retornar apenas os cards
        return NextResponse.json({
          reply: "", // Sempre vazio quando há livros
          books: books,
          searchTerms: searchTerms,
          hasMoreBooks: hasMore,
          nextStartIndex: nextStartIndex,
        })
      } else if (searchTerms && books.length === 0) {
        // Busca realizada mas nenhum livro encontrado
        return NextResponse.json({
          reply: "Não encontrei livros que correspondam exatamente à sua busca. Tente com outros termos ou características mais específicas.",
          books: [],
        })
      } else {
        // Busca detectada mas não foi possível extrair termos de busca
        return NextResponse.json({
          reply: "Não foi possível processar sua solicitação de busca. Tente reformular sua pergunta.",
          books: [],
        })
      }
    }

    // Se não é busca de livros, chamar o Groq normalmente para conversas gerais
    // Verificar se há API key do Groq
    if (!groqApiKey) {
      console.error("Falta GROQ_API_KEY nas variáveis de ambiente")
      return NextResponse.json(
        {
          error:
            "O servidor não está configurado com GROQ_API_KEY. Adicione-o no arquivo .env.local.",
        },
        { status: 500 },
      )
    }

    const systemPrompt = getSystemPrompt(onboarding, needsBookSearch)

    const finalMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "assistant" || m.role === "user" ? m.role : "user",
        content: m.content,
      })),
    ]

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: finalMessages,
        temperature: 0.7,
      }),
    })

    if (!groqRes.ok) {
      const errorText = await groqRes.text()
      console.error("Erro do Groq:", groqRes.status, errorText)
      return NextResponse.json(
        { error: "Erro ao chamar o modelo Groq. Verifique os logs do servidor." },
        { status: 500 },
      )
    }

    const data = await groqRes.json()
    let reply =
      data?.choices?.[0]?.message?.content ??
      "Não consegui gerar uma resposta neste momento. Tente novamente."

    // NUNCA retornar mensagens de texto quando há busca de livros
    // Se chegou aqui e needsBookSearch é true, significa que não conseguiu fazer a busca
    // Nesse caso, tentar inferir contexto e perguntar
    if (needsBookSearch && groqApiKey) {
      try {
        const cleanedMessage = lastMessage
          .toLowerCase()
          .replace(/\b(livros?|libros?|recomendar|recomendaci[oó]n|buscar|comprar|sobre|de|com|um|uma|el|la|los|las)\b/gi, "")
          .trim()
        
        if (cleanedMessage.length > 0) {
          const contextPrompt = `Extraia o termo principal desta mensagem. Apenas o termo em 1-3 palavras ou 'N/A'.

Mensagem: "${cleanedMessage}"

Termo:`
          
          const contextRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: "Você extrai termos principais. Responda apenas com o termo em 1-3 palavras ou 'N/A'." },
                { role: "user", content: contextPrompt }
              ],
              temperature: 0.3,
              max_tokens: 20,
            }),
          })

          if (contextRes.ok) {
            const contextData = await contextRes.json()
            const inferredTopic = contextData?.choices?.[0]?.message?.content?.trim() || ""
            
            if (inferredTopic && inferredTopic.toLowerCase() !== "n/a" && inferredTopic.length > 0 && inferredTopic.length < 50) {
              return NextResponse.json({
                reply: `Você gostaria de livros sobre ${inferredTopic}?`,
                books: [],
                needsConfirmation: true,
                inferredTopic: inferredTopic,
              })
            }
          }
        }
      } catch (error) {
        console.error("Erro ao inferir tema:", error)
      }
    }

    // Retornar resposta do Groq apenas para conversas gerais (não relacionadas a busca de livros)
    return NextResponse.json({
      reply: reply,
      books: books || [],
    })
  } catch (error) {
    console.error("Erro em /api/chat:", error)
    return NextResponse.json({ error: "Erro interno no assistente" }, { status: 500 })
  }
}

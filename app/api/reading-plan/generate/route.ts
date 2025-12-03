import { NextResponse } from "next/server"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { book, onboarding } = body

    if (!book || !book.title || !book.totalPages) {
      return NextResponse.json(
        { error: "Book information is required" },
        { status: 400 }
      )
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      )
    }

    // Criar prompt para gerar plano de leitura
    const readingTime = onboarding?.readingTime || 30
    const level = onboarding?.readerLevel || "intermediate"
    const levelText = level === "beginner" ? "iniciante" 
      : level === "intermediate" ? "intermediário" 
      : "avançado"

    // Calcular velocidade de leitura baseada no nível (páginas por minuto)
    // Iniciante: ~1 página/minuto, Intermediário: ~2 páginas/minuto, Avançado: ~3 páginas/minuto
    const pagesPerMinute = level === "beginner" ? 1 : level === "intermediate" ? 2 : 3
    const pagesPerSession = Math.floor(readingTime * pagesPerMinute)
    const estimatedDays = Math.ceil(book.totalPages / pagesPerSession)
    const estimatedMinutesPerStep = Math.ceil(pagesPerSession / pagesPerMinute)

    const systemPrompt = `Você é um assistente literário especializado em criar planos de leitura personalizados.
Você deve criar um plano de leitura estruturado para o livro "${book.title}" de ${book.author}.
O livro tem ${book.totalPages} páginas.
O usuário tem ${readingTime} minutos diários disponíveis para ler e seu nível é ${levelText}.

CÁLCULOS IMPORTANTES:
- Velocidade de leitura estimada: ${pagesPerMinute} página(s) por minuto (baseado no nível ${levelText})
- Páginas que podem ser lidas por sessão: aproximadamente ${pagesPerSession} páginas em ${readingTime} minutos
- Tempo estimado para cada etapa: ${estimatedMinutesPerStep} minutos
- Número estimado de dias para completar: ${estimatedDays} dias

IMPORTANTE: Responda APENAS com um JSON válido no seguinte formato, sem texto adicional:
{
  "steps": [
    {
      "id": "step_1",
      "title": "Título da etapa",
      "description": "Descrição do que ler nesta etapa",
      "pages": "1-50",
      "estimatedMinutes": ${estimatedMinutesPerStep}
    }
  ]
}

REGRAS PARA DIVIDIR O LIVRO:
1. Cada etapa deve representar aproximadamente ${pagesPerSession} páginas (o que pode ser lido em ${readingTime} minutos)
2. O número total de etapas deve ser aproximadamente ${estimatedDays} (uma etapa por dia)
3. Divida o livro de forma lógica, respeitando:
   - Divisões naturais por capítulos ou seções temáticas
   - Progressão gradual de dificuldade (se aplicável)
   - Pausas naturais na narrativa
4. Se um capítulo for muito longo (mais de ${pagesPerSession * 1.5} páginas), divida-o em múltiplas etapas
5. Se um capítulo for muito curto (menos de ${Math.floor(pagesPerSession * 0.5)} páginas), combine com o próximo
6. Cada etapa deve ter um título descritivo e uma descrição clara do que será lido
7. O campo "estimatedMinutes" deve refletir o tempo real estimado para ler aquela quantidade de páginas (baseado em ${pagesPerMinute} página/minuto)

EXEMPLO DE CÁLCULO:
- Se uma etapa tem 30 páginas e a velocidade é 2 páginas/minuto, então estimatedMinutes = 15 minutos
- Se uma etapa tem 60 páginas e a velocidade é 2 páginas/minuto, então estimatedMinutes = 30 minutos

Crie um plano que seja realista e respeite o tempo disponível do usuário.`

    const userMessage = `Crie um plano de leitura para "${book.title}" de ${book.author} (${book.totalPages} páginas).
O usuário tem ${readingTime} minutos por dia disponíveis e pode ler aproximadamente ${pagesPerSession} páginas por sessão.
Divida o livro em etapas que respeitem essa capacidade de leitura diária.`

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ]

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    if (!groqRes.ok) {
      const errorText = await groqRes.text()
      console.error("Error de Groq:", groqRes.status, errorText)
      return NextResponse.json(
        { error: "Erro ao gerar o plano de leitura" },
        { status: 500 }
      )
    }

    const data = await groqRes.json()
    const reply = data?.choices?.[0]?.message?.content || "{}"

    try {
      const planData = JSON.parse(reply)
      
      // Transformar os steps para incluir completed: false e estimatedMinutes
      const steps = (planData.steps || []).map((step: any, index: number) => {
        // Calcular estimatedMinutes se não foi fornecido pela LLM
        let estimatedMinutes = step.estimatedMinutes
        if (!estimatedMinutes && step.pages) {
          // Extrair número de páginas do formato "X-Y" ou "X"
          const pagesMatch = step.pages.match(/(\d+)(?:-(\d+))?/)
          if (pagesMatch) {
            const startPage = parseInt(pagesMatch[1])
            const endPage = pagesMatch[2] ? parseInt(pagesMatch[2]) : startPage
            const pageCount = endPage - startPage + 1
            estimatedMinutes = Math.ceil(pageCount / pagesPerMinute)
          } else {
            estimatedMinutes = estimatedMinutesPerStep
          }
        } else if (!estimatedMinutes) {
          estimatedMinutes = estimatedMinutesPerStep
        }

        return {
          id: step.id || `step_${index + 1}`,
          title: step.title || `Etapa ${index + 1}`,
          description: step.description || "",
          pages: step.pages || "",
          estimatedMinutes: estimatedMinutes,
          completed: false,
        }
      })

      return NextResponse.json({ steps })
    } catch (parseError) {
      console.error("Error parsing plan:", parseError)
      // Fallback: criar plano básico considerando o tempo disponível
      const pagesPerStep = pagesPerSession
      const totalSteps = Math.ceil(book.totalPages / pagesPerStep)
      const steps = Array.from({ length: totalSteps }, (_, i) => {
        const startPage = i * pagesPerStep + 1
        const endPage = Math.min((i + 1) * pagesPerStep, book.totalPages)
        const stepPageCount = endPage - startPage + 1
        const stepEstimatedMinutes = Math.ceil(stepPageCount / pagesPerMinute)
        
        return {
          id: `step_${i + 1}`,
          title: `Etapa ${i + 1}`,
          description: `Leia as páginas ${startPage} a ${endPage}`,
          pages: `${startPage}-${endPage}`,
          estimatedMinutes: stepEstimatedMinutes,
          completed: false,
        }
      })

      return NextResponse.json({ steps })
    }
  } catch (error) {
    console.error("Error generating reading plan:", error)
      return NextResponse.json(
        { error: "Erro ao gerar o plano de leitura" },
        { status: 500 }
      )
  }
}





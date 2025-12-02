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
    const levelText = level === "beginner" ? "principiante" 
      : level === "intermediate" ? "intermedio" 
      : "avanzado"

    const systemPrompt = `Eres un asistente literario especializado en crear planes de lectura personalizados.
Debes crear un plan de lectura estructurado para el libro "${book.title}" de ${book.author}.
El libro tiene ${book.totalPages} páginas.
El usuario tiene ${readingTime} minutos diarios disponibles para leer y su nivel es ${levelText}.

IMPORTANTE: Responde SOLO con un JSON válido en el siguiente formato, sin texto adicional:
{
  "steps": [
    {
      "id": "step_1",
      "title": "Título de la etapa",
      "description": "Descripción de qué leer en esta etapa",
      "pages": "1-50"
    }
  ]
}

Crea entre 8 y 12 etapas que dividan el libro de forma lógica, considerando:
- El tiempo disponible del usuario (${readingTime} minutos/día)
- El nivel de lectura (${levelText})
- Divisiones naturales por capítulos o secciones temáticas
- Progresión gradual de dificultad si aplica

Cada etapa debe tener un título descriptivo y una descripción clara de qué se leerá.`

    const userMessage = `Crea un plan de lectura para "${book.title}" de ${book.author} (${book.totalPages} páginas).`

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
        { error: "Error al generar el plan de lectura" },
        { status: 500 }
      )
    }

    const data = await groqRes.json()
    const reply = data?.choices?.[0]?.message?.content || "{}"

    try {
      const planData = JSON.parse(reply)
      
      // Transformar os steps para incluir completed: false
      const steps = (planData.steps || []).map((step: any, index: number) => ({
        id: step.id || `step_${index + 1}`,
        title: step.title || `Etapa ${index + 1}`,
        description: step.description || "",
        pages: step.pages || "",
        completed: false,
      }))

      return NextResponse.json({ steps })
    } catch (parseError) {
      console.error("Error parsing plan:", parseError)
      // Fallback: criar plano básico
      const pagesPerStep = Math.ceil(book.totalPages / 10)
      const steps = Array.from({ length: 10 }, (_, i) => ({
        id: `step_${i + 1}`,
        title: `Etapa ${i + 1}`,
        description: `Lee las páginas ${i * pagesPerStep + 1} a ${Math.min((i + 1) * pagesPerStep, book.totalPages)}`,
        pages: `${i * pagesPerStep + 1}-${Math.min((i + 1) * pagesPerStep, book.totalPages)}`,
        completed: false,
      }))

      return NextResponse.json({ steps })
    }
  } catch (error) {
    console.error("Error generating reading plan:", error)
    return NextResponse.json(
      { error: "Error al generar el plan de lectura" },
      { status: 500 }
    )
  }
}



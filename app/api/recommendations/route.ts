import { NextResponse } from "next/server"
import type { Recommendation } from "@/lib/auth"

export type { Recommendation }

export async function GET() {
  try {
    // As recomendações são gerenciadas no cliente via localStorage
    // Este endpoint retorna um array vazio, pois as recomendações são carregadas do contexto do cliente
    return NextResponse.json({ recommendations: [] })
  } catch (error) {
    console.error("Error loading recommendations:", error)
    return NextResponse.json({ recommendations: [] })
  }
}

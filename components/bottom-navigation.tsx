"use client"

import { BookOpen, MessageSquare, Target, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-colors ${
            isActive("/")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <BookOpen className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-xs font-medium">Inicio</span>
        </Link>
        <Link
          href="/chat"
          className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-colors ${
            isActive("/chat")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <MessageSquare className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-xs font-medium">Chat</span>
        </Link>
        <Link
          href="/reading-plan"
          className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-colors ${
            isActive("/reading-plan")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Target className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-xs font-medium">Plan</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-colors ${
            isActive("/profile")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <User className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-xs font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  )
}





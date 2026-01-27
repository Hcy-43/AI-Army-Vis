"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, UploadCloud, FileText } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
        </div>
      </Link>
      <Link
        href="/upload"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/upload" ? "text-primary" : "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            <span>Upload & Predict</span>
        </div>
      </Link>
      <Link
        href="/survey"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/survey" ? "text-primary" : "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Take Survey</span>
        </div>
      </Link>
    </nav>
  )
}

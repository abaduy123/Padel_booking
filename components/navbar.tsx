"use client"

import Link from "next/link"
import { Calendar } from "lucide-react"

export function Navbar() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">حجز البادل</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <button
              onClick={() => document.getElementById("fields")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              الملاعب
            </button>
            <Link
              href="/my-reservations"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              حجوزاتي
            </Link>
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors hover:cursor-pointer ">
              حسابي
            </Link>
           
          </div>
        </div>
      </div>
    </nav>
  )
}

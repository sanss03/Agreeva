"use client"

import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { usePathname, useRouter } from "@/i18n/routing"
import { useLocale } from "next-intl"

interface HeaderProps {
  children?: React.ReactNode
}

export function Header({ children }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-lg opacity-60" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Samartha<span className="text-primary">Sign</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground -mt-1 tracking-wide">
              INCLUSIVE FINANCE
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {children}
          <select 
            className="bg-background border border-border text-foreground text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-muted/50 transition-colors"
            value={locale}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/40 p-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4">
            <div className="flex items-center justify-end w-full">
              <select 
                className="bg-background border border-border text-foreground text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-muted/50 transition-colors w-full"
                value={locale}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

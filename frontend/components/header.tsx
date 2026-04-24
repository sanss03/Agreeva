"use client"

import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { usePathname, useRouter } from "@/i18n/routing"
import { useLocale } from "next-intl"

import { translations, getLanguageKey } from "@/lib/translations"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Globe } from "lucide-react"

interface HeaderProps {
  children?: React.ReactNode
}

export function Header({ children }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]

  const handleLanguageChange = (value: string) => {
    router.replace(pathname, { locale: value })
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
            <span className="text-xl font-bold tracking-tight text-foreground leading-none">
              {t.title}
            </span>
            <span className="text-[10px] font-medium text-gray-500 tracking-wide mt-1">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {children}
          <Select value={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50 hover:bg-muted/50 transition-colors">
              <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t.select_language} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="mr">Marathi</SelectItem>
            </SelectContent>
          </Select>
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
            <div className="flex items-center gap-2 px-2 py-1">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t.select_language}:</span>
            </div>
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full bg-background border-border/50">
                <SelectValue placeholder={t.select_language} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
              </SelectContent>
            </Select>
          </nav>
        </div>
      )}
    </header>
  )
}

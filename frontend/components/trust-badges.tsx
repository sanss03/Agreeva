"use client"

import { Shield, Lock, Sparkles, Eye } from "lucide-react"

import { useLocale } from "next-intl"
import { translations, getLanguageKey } from "@/lib/translations"

export function TrustBadges() {
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]

  const badges = [
    {
      icon: Sparkles,
      label: "AI Verified",
      description: "Powered by advanced AI",
    },
    {
      icon: Lock,
      label: t.badge_secured,
      description: "Bank-level security",
    },
    {
      icon: Shield,
      label: t.badge_private,
      description: "Your data stays private",
    },
    {
      icon: Eye,
      label: "Transparent",
      description: "No hidden fees",
    },
  ]
  return (
    <div className="mt-16 mb-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
      <div className="max-w-4xl mx-auto">
        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
            {t.badge_title}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={badge.label}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Agreeva is built with ❤️ for financial inclusion • Made for everyone, everywhere
        </p>
      </div>
    </div>
  )
}

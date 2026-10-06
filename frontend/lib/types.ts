export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface QuizQuestion {
  question: string
  options: { text: string; isCorrect: boolean }[]
  explanation: string
}

export interface AgreementData {
  originalText: string
  simplifiedPoints: string[]
  emi: number
  totalAmount: number
  principal: number
  interestRate: number
  tenure: number
  interestAmount: number
  riskLevel: "low" | "medium" | "high"
  risks: { type: string; description: string; severity: "warning" | "danger" }[]
  visuals?: { label: string; value: string }[]
  keyClauses?: string[]
  questions?: QuizQuestion[]
}

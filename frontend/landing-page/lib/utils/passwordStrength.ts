export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
  checks: {
    length: boolean
    hasNumber: boolean
    hasUpper: boolean
    hasSymbol: boolean
  }
}

export function checkPasswordStrength(pwd: string): PasswordStrength {
  const checks = {
    length: pwd.length >= 8,
    hasNumber: /\d/.test(pwd),
    hasUpper: /[A-Z]/.test(pwd),
    hasSymbol: /[!@#$%^&*]/.test(pwd),
  }
  const score = Object.values(checks).filter(Boolean).length as 0 | 1 | 2 | 3 | 4

  const levels = [
    { label: 'ضعيفة جداً', color: 'bg-red-400' },
    { label: 'ضعيفة', color: 'bg-orange-400' },
    { label: 'متوسطة', color: 'bg-amber-400' },
    { label: 'قوية', color: 'bg-green-400' },
    { label: 'قوية جداً', color: 'bg-emerald-500' },
  ]

  return { score, ...levels[score], checks }
}

export function generateTempPassword(): string {
  const digits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const char1 = chars[Math.floor(Math.random() * chars.length)]
  const char2 = chars[Math.floor(Math.random() * chars.length)]
  return `Temp@${digits}${char1}${char2}`
}

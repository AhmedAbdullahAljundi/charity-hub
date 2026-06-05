export interface PasswordChecks {
  length: boolean;
  hasNumber: boolean;
  hasUpper: boolean;
  hasSymbol: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  bgColor: string;
  checks: PasswordChecks;
}

const LEVELS: Array<{ label: string; color: string; bgColor: string }> = [
  { label: 'ضعيفة جداً', color: 'text-red-500',    bgColor: 'bg-red-400' },
  { label: 'ضعيفة',      color: 'text-orange-500', bgColor: 'bg-orange-400' },
  { label: 'متوسطة',     color: 'text-amber-500',  bgColor: 'bg-amber-400' },
  { label: 'قوية',       color: 'text-green-500',  bgColor: 'bg-green-400' },
  { label: 'قوية جداً',  color: 'text-emerald-600',bgColor: 'bg-emerald-500' },
];

export function checkPasswordStrength(pwd: string): PasswordStrength {
  const checks: PasswordChecks = {
    length:    pwd.length >= 8,
    hasNumber: /\d/.test(pwd),
    hasUpper:  /[A-Z]/.test(pwd),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length as 0 | 1 | 2 | 3 | 4;
  return { score, ...LEVELS[score], checks };
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  const digits = Math.floor(1000 + Math.random() * 9000);
  let suffix = '';
  for (let i = 0; i < 2; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `Temp@${digits}${suffix}`;
}

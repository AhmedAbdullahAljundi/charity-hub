import Navbar from '@/components/navbar'
import LoginFormClient from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <LoginFormClient />
      </div>
    </div>
  )
}

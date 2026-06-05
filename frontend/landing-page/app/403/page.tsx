import { Lock, ArrowRight } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-slate-800">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          403
        </h1>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          غير مصرح
        </h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          ليس لديك صلاحية للوصول لهذه الصفحة
        </p>

        <div className="inline-block mb-8 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">دورك الحالي:</span>{' '}
            <span className="text-green-600 dark:text-green-400 font-semibold">
              عارض
            </span>
          </p>
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
        >
          العودة للرئيسية
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </a>
      </div>
    </div>
  )
}

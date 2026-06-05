'use client'

import Navbar from '@/components/navbar'
import Image from 'next/image'
import {
  Users,
  BarChart3,
  Target,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 dark:from-slate-900 dark:via-green-950/20 dark:to-slate-900 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full w-fit">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  نظام استهداف ذكي
                </span>
              </div>

              <div>
                <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  CharityHub
                </h1>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">
                  نظام استهداف المساعدات الاجتماعية
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  منصة متكاملة لإدارة وتوزيع المساعدات الاجتماعية بكفاءة عالية، تستخدم تقييم
                  متعدد الطبقات لضمان وصول المساعدات للأحق بها.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() =>
                    document
                      .querySelector('[href="#features"]')
                      ?.dispatchEvent(new Event('click', { bubbles: true }))
                  }
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  ابدأ الآن
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-400 text-slate-900 dark:text-white font-bold rounded-lg transition-colors duration-200">
                  اعرف المزيد
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    9
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">طبقات تقييم</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    100%
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">دقة استهداف</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    4
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">مستويات دور</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-96 lg:h-full min-h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-2xl blur-3xl"></div>
              <Image
                src="/images/hero-dashboard.png"
                alt="CharityHub Dashboard"
                fill
                className="object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full mb-4">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                المميزات الأساسية
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              ما الذي يجعل CharityHub مختلفة؟
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              حل شامل يدمج إدارة البيانات والتقييم الذكي والتحليلات المتقدمة
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'إدارة الأسر',
                description: 'قاعدة بيانات شاملة لجميع الأسر المستفيدة مع تتبع كامل للمعلومات',
                image: '/images/features-households.png',
              },
              {
                icon: Target,
                title: 'تقييم ذكي',
                description: 'نظام تقييم متعدد الطبقات لضمان استهداف دقيق وعادل',
                image: '/images/features-targeting.png',
              },
              {
                icon: BarChart3,
                title: 'تحليلات متقدمة',
                description: 'رؤى عميقة وتقارير شاملة لاتخاذ قرارات مدروسة',
                image: '/images/features-analytics.png',
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group bg-slate-50 dark:bg-slate-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full w-fit">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  حول النظام
                </span>
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  نظام معياري عالمي
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  CharityHub يتبع أفضل الممارسات العالمية في إدارة المساعدات الاجتماعية، مع تصميم
                  يراعي الخصوصيات المحلية.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  'نظام تقييم شفاف وعادل',
                  'حماية البيانات الشخصية',
                  'تقارير وإحصائيات فورية',
                  'إدارة أدوار وصلاحيات متقدمة',
                  'واجهة سهلة الاستخدام',
                  'دعم التوثيق الجماعي',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats Box */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  إمكانيات النظام
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'عدد الطبقات التقييمية', value: '9', icon: TrendingUp },
                    { label: 'الأدوار المتاحة', value: '4', icon: Users },
                    { label: 'مستويات الصلاحيات', value: '25+', icon: Shield },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-300">
                            {stat.label}
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stat.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full mb-4">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                كيفية الاستخدام
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              خطوات سهلة وسريعة
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              ابدأ باستخدام النظام في دقائق معدودة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'إنشاء حساب',
                description: 'قم بتسجيل الدخول باستخدام بيانات الاعتماد الخاصة بك',
              },
              {
                step: '2',
                title: 'إدخال البيانات',
                description: 'أضف معلومات الأسر والمستفيدين إلى النظام',
              },
              {
                step: '3',
                title: 'التقييم الذكي',
                description: 'دع النظام يقيم الأسر حسب المعايير المحددة',
              },
              {
                step: '4',
                title: 'اتخاذ القرار',
                description: 'استخدم التقارير لاتخاذ قرارات مدروسة وعادلة',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-slate-50 dark:bg-slate-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 mt-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-lg text-green-50 mb-8">
            انضم إلينا اليوم وابدأ في إدارة المساعدات الاجتماعية بكفاءة وشفافية
          </p>
          <button className="px-8 py-4 bg-white hover:bg-green-50 text-green-600 font-bold rounded-lg transition-colors duration-200 inline-flex items-center gap-2">
            ابدأ الآن
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">CH</span>
                </div>
                <span className="font-bold text-white">CharityHub</span>
              </div>
              <p className="text-sm text-slate-400">
                نظام استهداف المساعدات الاجتماعية
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">الروابط</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-green-400 transition-colors">
                    المميزات
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-green-400 transition-colors">
                    حول النظام
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-green-400 transition-colors">
                    كيفية الاستخدام
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">الدعم</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    مركز المساعدة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    التوثيق
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    تواصل معنا
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">المزيد</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    سياسة الخصوصية
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    شروط الاستخدام
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors">
                    الأمان
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>
              © 2024 CharityHub. جميع الحقوق محفوظة. | تم تطويره بعناية لخدمة المجتمع
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

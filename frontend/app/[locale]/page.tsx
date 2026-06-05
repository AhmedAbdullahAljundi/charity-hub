"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import Image from "next/image";
import Link from "next/link";
import {
  Users, BarChart3, Target, CheckCircle2, ArrowLeft, ArrowRight,
  Zap, Shield, TrendingUp, Menu, X, LogIn, LogOut, Heart,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ZakatCalculatorPopover } from "@/components/landing/ZakatCalculator";
import { LoginModal } from "@/components/landing/LoginModal";
import { ContactModal } from "@/components/landing/ContactModal";
import { useLocale } from "next-intl";

// ── Navbar ──────────────────────────────────────────────────────────────────
function LandingNavbar({
  onLoginClick,
  onContactClick,
}: {
  onLoginClick: () => void;
  onContactClick: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const navLinks = [
    { href: "#features", label: isRtl ? "المميزات" : "Features" },
    { href: "#about",    label: isRtl ? "حول النظام" : "About" },
    { href: "#how-it-works", label: isRtl ? "كيفية الاستخدام" : "How It Works" },
    { action: "contact", label: isRtl ? "تواصل معنا" : "Contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">Charity</span>
                <span className="text-base font-bold text-green-500">Hub</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                {isRtl ? "استهداف المساعدات" : "Assistance Targeting"}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href || link.action}
                href={link.href || "#"}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (link.action === "contact") {
                    onContactClick();
                  } else if (link.href) {
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <ZakatCalculatorPopover />

            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  {isRtl ? "لوحة التحكم" : "Dashboard"}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  title={isRtl ? "تسجيل الخروج" : "Logout"}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                {isRtl ? "تسجيل الدخول" : "Sign In"}
              </button>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-slate-200 dark:border-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.href || link.action}
                href={link.href || "#"}
                className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  if (link.action === "contact") {
                    onContactClick();
                  } else if (link.href) {
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => { router.push("/dashboard"); setIsOpen(false); }}
                    className="w-full text-start px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg"
                  >
                    {isRtl ? "لوحة التحكم" : "Dashboard"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-start mt-1 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-bold rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {isRtl ? "تسجيل الخروج" : "Logout"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onLoginClick(); setIsOpen(false); }}
                  className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {isRtl ? "تسجيل الدخول" : "Sign In"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const locale = useLocale();
  const isRtl = locale === "ar";

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const scrollToFeatures = () => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingNavbar 
        onLoginClick={() => setShowLoginModal(true)} 
        onContactClick={() => setShowContactModal(true)}
      />

      {/* ── Hero Section (Exactly matching v0) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 dark:from-slate-900 dark:via-green-950/20 dark:to-slate-900 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full w-fit">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {isRtl ? "نظام استهداف ذكي" : "Smart Targeting System"}
                </span>
              </div>

              <div>
                <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  CharityHub
                </h1>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">
                  {isRtl ? "نظام استهداف المساعدات الاجتماعية" : "Social Assistance Targeting Platform"}
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRtl 
                    ? "منصة متكاملة لإدارة وتوزيع المساعدات الاجتماعية بكفاءة عالية، تستخدم تقييم متعدد الطبقات لضمان وصول المساعدات للأحق بها."
                    : "An integrated platform for managing social assistance distribution, using multi-layer evaluation to ensure aid reaches those most in need."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={scrollToFeatures}
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isRtl ? "ابدأ الآن" : "Get Started"}
                  {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-400 text-slate-900 dark:text-white font-bold rounded-lg transition-colors duration-200"
                >
                  {isRtl ? "تسجيل الدخول للنظام" : "Login to System"}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">9</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{isRtl ? "طبقات تقييم" : "Evaluation Layers"}</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">100%</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{isRtl ? "دقة استهداف" : "Targeting Accuracy"}</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">4</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{isRtl ? "مستويات دور" : "Role Levels"}</p>
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
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full mb-4">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {isRtl ? "المميزات الأساسية" : "Core Features"}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {isRtl ? "ما الذي يجعل CharityHub مختلفة؟" : "What makes CharityHub different?"}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {isRtl ? "حل شامل يدمج إدارة البيانات والتقييم الذكي والتحليلات المتقدمة" : "A comprehensive solution combining data management, smart evaluation, and advanced analytics"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: isRtl ? "إدارة الأسر" : "Household Management",
                description: isRtl ? "قاعدة بيانات شاملة لجميع الأسر المستفيدة مع تتبع كامل للمعلومات" : "Comprehensive database for all beneficiary households with full tracking",
                image: '/images/features-households.png',
              },
              {
                icon: Target,
                title: isRtl ? "تقييم ذكي" : "Smart Evaluation",
                description: isRtl ? "نظام تقييم متعدد الطبقات لضمان استهداف دقيق وعادل" : "Multi-layer evaluation system ensuring precise and fair targeting",
                image: '/images/features-targeting.png',
              },
              {
                icon: BarChart3,
                title: isRtl ? "تحليلات متقدمة" : "Advanced Analytics",
                description: isRtl ? "رؤى عميقة وتقارير شاملة لاتخاذ قرارات مدروسة" : "Deep insights and comprehensive reports for informed decision-making",
                image: '/images/features-analytics.png',
              },
            ].map((feature) => {
              const Icon = feature.icon;
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
                      className="object-cover group-hover:scale-110 transition-transform duration-300 border border-slate-200 dark:border-slate-700"
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full w-fit">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {isRtl ? "حول النظام" : "About System"}
                </span>
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  {isRtl ? "نظام معياري عالمي" : "Global Standard System"}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {isRtl 
                    ? "CharityHub يتبع أفضل الممارسات العالمية في إدارة المساعدات الاجتماعية، مع تصميم يراعي الخصوصيات المحلية."
                    : "CharityHub follows global best practices in managing social assistance, designed to respect local specificities."}
                </p>
              </div>

              <ul className="space-y-4">
                {(isRtl ? [
                  'نظام تقييم شفاف وعادل',
                  'حماية البيانات الشخصية',
                  'تقارير وإحصائيات فورية',
                  'إدارة أدوار وصلاحيات متقدمة',
                  'واجهة سهلة الاستخدام',
                  'دعم التوثيق الجماعي',
                ] : [
                  'Transparent and fair evaluation system',
                  'Personal data protection',
                  'Instant reports and statistics',
                  'Advanced roles and permissions management',
                  'User-friendly interface',
                  'Bulk verification support'
                ]).map((item) => (
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
                  {isRtl ? "إمكانيات النظام" : "System Capabilities"}
                </h3>
                <div className="space-y-4">
                  {[
                    { label: isRtl ? 'عدد الطبقات التقييمية' : 'Evaluation Layers', value: '9', icon: TrendingUp },
                    { label: isRtl ? 'الأدوار المتاحة' : 'Available Roles', value: '4', icon: Users },
                    { label: isRtl ? 'مستويات الصلاحيات' : 'Permission Levels', value: '25+', icon: Shield },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {stat.label}
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stat.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 rounded-full mb-4">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {isRtl ? "كيفية الاستخدام" : "How It Works"}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {isRtl ? "خطوات سهلة وسريعة" : "Simple and Fast Steps"}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {isRtl ? "ابدأ باستخدام النظام في دقائق معدودة" : "Start using the system in just a few minutes"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isRtl ? [
              { step: '1', title: 'إنشاء حساب', description: 'قم بتسجيل الدخول باستخدام بيانات الاعتماد الخاصة بك' },
              { step: '2', title: 'إدخال البيانات', description: 'أضف معلومات الأسر والمستفيدين إلى النظام' },
              { step: '3', title: 'التقييم الذكي', description: 'دع النظام يقيم الأسر حسب المعايير المحددة' },
              { step: '4', title: 'اتخاذ القرار', description: 'استخدم التقارير لاتخاذ قرارات مدروسة وعادلة' },
            ] : [
              { step: '1', title: 'Create Account', description: 'Login using your credentials' },
              { step: '2', title: 'Enter Data', description: 'Add household and beneficiary info' },
              { step: '3', title: 'Smart Eval', description: 'Let the system evaluate households automatically' },
              { step: '4', title: 'Make Decision', description: 'Use reports to make informed and fair decisions' },
            ]).map((item) => (
              <div
                key={item.step}
                className="relative bg-slate-50 dark:bg-slate-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute -top-4 -start-4 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
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

      {/* ── CTA Section ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {isRtl ? "هل أنت مستعد للبدء؟" : "Are you ready to start?"}
          </h2>
          <p className="text-lg text-green-50 mb-8">
            {isRtl 
              ? "انضم إلينا اليوم وابدأ في إدارة المساعدات الاجتماعية بكفاءة وشفافية"
              : "Join us today and start managing social assistance efficiently and transparently"}
          </p>
          <button 
            onClick={() => setShowLoginModal(true)}
            className="px-8 py-4 bg-white hover:bg-green-50 text-green-600 font-bold rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            {isRtl ? "ابدأ الآن" : "Start Now"}
            {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
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
                {isRtl ? "نظام استهداف المساعدات الاجتماعية" : "Social Assistance Targeting System"}
              </p>
            </div>

            {[
              {
                title: isRtl ? "الروابط" : "Links",
                links: [
                  { href: "#features",     label: isRtl ? "المميزات" : "Features" },
                  { href: "#about",        label: isRtl ? "حول النظام" : "About" },
                  { href: "#how-it-works", label: isRtl ? "كيفية الاستخدام" : "How It Works" },
                ],
              },
              {
                title: isRtl ? "الدعم" : "Support",
                links: [
                  { href: "#", label: isRtl ? "مركز المساعدة" : "Help Center" },
                  { href: "#", label: isRtl ? "التوثيق" : "Documentation" },
                  { action: "contact", label: isRtl ? "تواصل معنا" : "Contact Us" },
                ],
              },
              {
                title: isRtl ? "المزيد" : "More",
                links: [
                  { href: "#", label: isRtl ? "سياسة الخصوصية" : "Privacy Policy" },
                  { href: "#", label: isRtl ? "شروط الاستخدام" : "Terms of Use" },
                  { href: "#", label: isRtl ? "الأمان" : "Security" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.action === "contact" ? (
                        <button onClick={() => setShowContactModal(true)} className="hover:text-green-400 transition-colors">
                          {link.label}
                        </button>
                      ) : (
                        <a href={link.href} className="hover:text-green-400 transition-colors">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>
              {isRtl 
                ? "© 2024 CharityHub. جميع الحقوق محفوظة. | تم تطويره بعناية لخدمة المجتمع"
                : "© 2024 CharityHub. All rights reserved. | Carefully developed to serve the community"}
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
}

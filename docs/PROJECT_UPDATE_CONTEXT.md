---
# CharityHub - Project Update Context
> Generated: 2026-06-08
> Purpose: Update graduation project book with new features
> Previous context: PROJECT_BOOK_CONTEXT.md (May 2026)

## SECTION 1 - Landing Page
<!-- SOURCE: frontend/app/[locale]/page.tsx -->
``tsx
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [mounted, isAuthenticated, router]);

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
````

<!-- SOURCE: frontend/components/landing/ContactModal.tsx -->
``tsx
"use client";

import { useState } from "react";
import { X, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { api } from "@/lib/api/client";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/public/contact", { name, email, message });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => onClose(), 3000);
      } else {
        throw new Error("Failed to send");
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? "حدث خطأ أثناء الإرسال" : "An error occurred while sending"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRtl ? "تواصل معنا" : "Contact Us"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isRtl ? "تم الإرسال بنجاح" : "Sent Successfully"}
              </h3>
              <p className="text-slate-500 text-sm">
                {isRtl ? "سيتواصل معك فريق الإدارة قريباً." : "The administration team will contact you shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "الاسم" : "Name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  placeholder={isRtl ? "الاسم الكريم" : "Your name"}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "الرسالة" : "Message"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none"
                  placeholder={isRtl ? "اكتب رسالتك هنا..." : "Type your message here..."}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name || !email || !message}
                className="w-full py-3 mt-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {isRtl ? "جاري الإرسال..." : "Sending..."}</>
                ) : (
                  <><Send className="w-4 h-4" /> {isRtl ? "إرسال الرسالة" : "Send Message"}</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/landing/LoginModal.tsx -->
``tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, X, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type View = "login" | "forgot" | "forgotSuccess";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { login } = useAuthStore();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [view, setView] = useState<View>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      const msg = isRtl ? "البريد أو كلمة المرور غير صحيحة" : "Invalid email or password";
      setError(err?.message || msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setView("forgotSuccess");
    } catch {
      setForgotError(isRtl ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "An error occurred, please try again");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300",
        shake && "animate-[shake_0.5s_ease-in-out]"
      )}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── LOGIN VIEW ── */}
        {view === "login" && (
          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Charity</span>
                <span className="font-bold text-green-500">Hub</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {isRtl ? "مرحباً بك" : "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isRtl ? "سجّل دخولك للمتابعة" : "Sign in to continue"}
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    className="w-full ps-10 pe-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isRtl ? "كلمة المرور" : "Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-green-600 dark:text-green-400 hover:underline"
                  >
                    {isRtl ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isRtl ? "جاري التحقق..." : "Verifying..."}
                  </>
                ) : (
                  isRtl ? "تسجيل الدخول" : "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
              CharityHub © 2025
            </p>
          </div>
        )}

        {/* ── FORGOT VIEW ── */}
        {view === "forgot" && (
          <div className="p-8">
            <button
              onClick={() => setView("login")}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
            >
              <ArrowLeft className={cn("w-4 h-4", isRtl ? "" : "rotate-180")} />
              {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {isRtl ? "استعادة كلمة المرور" : "Reset Password"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isRtl
                ? "أدخل بريدك الإلكتروني وسيتواصل معك المسؤول"
                : "Enter your email and the admin will contact you"}
            </p>

            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    className="w-full ps-10 pe-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {forgotError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{forgotError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {forgotLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{isRtl ? "جاري الإرسال..." : "Sending..."}</>
                ) : (
                  isRtl ? "إرسال الطلب" : "Send Request"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── FORGOT SUCCESS VIEW ── */}
        {view === "forgotSuccess" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {isRtl ? "تم إرسال طلبك" : "Request Sent"}
            </h2>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <p>{isRtl ? "تم تسجيل طلب استعادة كلمة المرور." : "Your reset request has been recorded."}</p>
              <p>{isRtl ? "سيقوم المسؤول بمراجعة طلبك وتعيين كلمة مرور مؤقتة." : "The admin will review and set a temporary password."}</p>
              <p>{isRtl ? "تواصل مع المسؤول إذا لم تتلقَّ ردًا خلال 24 ساعة." : "Contact the admin if no response within 24 hours."}</p>
            </div>
            <button
              onClick={() => setView("login")}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/landing/ZakatCalculator.tsx -->
``tsx
"use client";

import { useState, useEffect } from "react";
import { Coins, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  calculateZakat, NISAB_EGP, GOLD_PRICE_PER_GRAM_EGP,
  type ZakatInput, type ZakatResult,
} from "@/lib/utils/zakatCalculator";
import { useLocale } from "next-intl";

const EMPTY_INPUT: ZakatInput = {
  cash: 0, gold: 0, silver: 0, stocks: 0,
  businessAssets: 0, receivables: 0, debts: 0,
};

function NumberInput({
  label, value, onChange, helper, isDebt = false,
}: {
  label: string; value: number; onChange: (v: number) => void;
  helper?: string; isDebt?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className={cn("text-xs font-medium", isDebt ? "text-red-500 dark:text-red-400" : "text-slate-700 dark:text-slate-300")}>
        {label}
      </Label>
      <Input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        placeholder="0"
        className={cn(
          "h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
          isDebt && "border-red-200 dark:border-red-800 focus-visible:ring-red-300"
        )}
      />
      {helper && <p className="text-[11px] text-slate-400 dark:text-slate-500">{helper}</p>}
    </div>
  );
}

export function ZakatCalculatorPopover() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<ZakatInput>(EMPTY_INPUT);
  const [result, setResult] = useState<ZakatResult | null>(null);

  useEffect(() => {
    const hasValue = Object.values(input).some((v) => (v as number) > 0);
    if (hasValue) {
      setResult(calculateZakat(input));
    } else {
      setResult(null);
    }
  }, [input]);

  const set = (key: keyof ZakatInput) => (v: number) =>
    setInput((prev) => ({ ...prev, [key]: v }));

  const reset = () => { setInput(EMPTY_INPUT); setResult(null); };

  const nisabFormatted = NISAB_EGP.toLocaleString("ar-EG");
  const goldPriceFormatted = GOLD_PRICE_PER_GRAM_EGP.toLocaleString("ar-EG");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 text-xs font-medium px-3"
        >
          <Coins className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isRtl ? "حاسبة الزكاة" : "Zakat Calculator"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-xl border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isRtl ? "حاسبة زكاة المال" : "Zakat Calculator"}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isRtl
                ? `النصاب التقريبي: ${nisabFormatted} جنيه`
                : `Approx. Nisab: EGP ${NISAB_EGP.toLocaleString()}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Inputs */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          <NumberInput
            label={isRtl ? "💵 النقد والرصيد البنكي" : "💵 Cash & Bank Balance"}
            value={input.cash}
            onChange={set("cash")}
          />
          <NumberInput
            label={isRtl ? "🏅 الذهب (بالجرام)" : "🏅 Gold (grams)"}
            value={input.gold}
            onChange={set("gold")}
            helper={isRtl
              ? `السعر التقريبي للجرام: ${goldPriceFormatted} جنيه`
              : `Approx. price/gram: EGP ${GOLD_PRICE_PER_GRAM_EGP.toLocaleString()}`}
          />
          <NumberInput
            label={isRtl ? "🥈 الفضة (بالجرام)" : "🥈 Silver (grams)"}
            value={input.silver}
            onChange={set("silver")}
          />
          <NumberInput
            label={isRtl ? "📈 الأسهم والأوراق المالية" : "📈 Stocks & Securities"}
            value={input.stocks}
            onChange={set("stocks")}
          />
          <NumberInput
            label={isRtl ? "🏪 الأصول التجارية" : "🏪 Business Assets"}
            value={input.businessAssets}
            onChange={set("businessAssets")}
          />
          <NumberInput
            label={isRtl ? "🤝 ديون لك عند الغير" : "🤝 Receivables"}
            value={input.receivables}
            onChange={set("receivables")}
          />
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
            <NumberInput
              label={isRtl ? "📉 الديون عليك (تُطرح)" : "📉 Your Debts (deducted)"}
              value={input.debts}
              onChange={set("debts")}
              isDebt
            />
          </div>

          {/* Result */}
          {result && (
            <div className={cn(
              "mt-3 rounded-xl p-4 border transition-all",
              result.isAboveNisab
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
            )}>
              {result.isAboveNisab ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                    {isRtl ? "زكاة واجبة" : "Zakat Due"}
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {result.zakatAmount.toLocaleString("ar-EG")}
                    <span className="text-sm font-normal ms-1">{isRtl ? "جنيه" : "EGP"}</span>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    {isRtl
                      ? `2.5% من ${result.netAssets.toLocaleString("ar-EG")} جنيه`
                      : `2.5% of EGP ${result.netAssets.toLocaleString()}`}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    {isRtl ? "لم يبلغ المال النصاب بعد" : "Below Nisab threshold"}
                  </p>
                  <div className="w-full bg-amber-200 dark:bg-amber-900/40 rounded-full h-2 mb-2" dir="ltr">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, result.progressPercent)}%` }}
                    />
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    {isRtl
                      ? `الباقي: ${(result.nisab - result.netAssets).toLocaleString("ar-EG")} جنيه لبلوغ النصاب`
                      : `EGP ${(result.nisab - result.netAssets).toLocaleString()} remaining to reach Nisab`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reset */}
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="w-full text-slate-400 dark:text-slate-500 hover:text-slate-600 gap-2 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isRtl ? "مسح الأرقام" : "Reset"}
          </Button>
        </div>

        {/* Footer disclaimer */}
        <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center italic">
            {isRtl
              ? "هذه الحاسبة تقريبية — يُنصح باستشارة عالم دين"
              : "This calculator is approximate — consult a scholar for verification"}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
````

### Landing Page Answers
1. Sections/blocks: sticky navbar, hero, stats, features, about/system capabilities, how-it-works, CTA, footer, login modal, contact modal, and zakat calculator popover.
2. Data displayed: mostly static inline bilingual AR/EN UI strings and static image assets; auth state is read from Zustand auth store to redirect authenticated users to `/dashboard`.
3. API endpoints called: the landing page itself does not fetch data; `ContactModal` posts to `/public/contact`, and `LoginModal` uses auth APIs through the auth store/client.
4. Public access: yes. `frontend/app/[locale]/page.tsx` is the locale root page and is accessible before login; authenticated users are redirected to `/dashboard`.
5. Components used: `frontend/components/landing/ZakatCalculator.tsx`, `frontend/components/landing/LoginModal.tsx`, `frontend/components/landing/ContactModal.tsx`, `frontend/components/common/theme-toggle.tsx`, `frontend/components/language-switcher.tsx`.
6. New i18n keys: landing strings are mostly inline in the TSX; related form/zakat keys are copied below.
7. New route registered: Next.js public route is file-based at `/[locale]`; backend public contact route is copied in Section 2.
8. Backend/Prisma support: no Prisma query for page rendering; contact form uses notification backend via `/public/contact`.

### Relevant i18n Keys - Landing / Zakat / Contact
<!-- SOURCE: frontend/messages/ar/forms.json -->
``json
{
  "validation": {
    "login": {
      "email": "البريد الإلكتروني غير صحيح",
      "passwordMin": "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
    },
    "family": {
      "headNameMin": "يجب أن يكون الاسم 3 أحرف على الأقل",
      "nationalIdLength": "الرقم القومي يجب أن يكون 14 رقم",
      "nationalIdDigits": "الرقم القومي يجب أن يحتوي على أرقام فقط",
      "phoneMin": "رقم الهاتف يجب أن يكون 11 رقم",
      "phoneInvalid": "رقم هاتف غير صحيح",
      "addressMin": "يجب إدخال العنوان بالتفصيل",
      "housingRequired": "يجب اختيار نوع السكن",
      "meezaLength": "رقم بطاقة ميزة يجب أن يكون 16 رقم على الأقل",
      "categoryRequired": "يجب اختيار تصنيف الحالة",
      "categoryReasonMin": "يجب كتابة سبب التصنيف",
      "aidRequired": "يجب اختيار نوع المساعدة",
      "monthlyAidRange": "المبلغ يجب أن يكون 0 أو أكثر والحد الأقصى 4 أرقام"
    },
    "member": {
      "nameMin": "الاسم مطلوب (3 أحرف على الأقل)",
      "nationalId14": "الرقم القومي يجب أن يكون 14 رقم",
      "relationRequired": "اختر صلة القرابة",
      "birthRequired": "تاريخ الميلاد مطلوب",
      "genderRequired": "اختر النوع",
      "sourceRequired": "اختر مصدر الدخل",
      "amountRequired": "المبلغ مطلوب",
      "frequencyRequired": "اختر التكرار",
      "expenseCategoryRequired": "اختر فئة المصروف",
      "medicalConditionRequired": "أدخل اسم الحالة",
      "personRequired": "اختر فرد الأسرة"
    }
  },
  "auth": {
    "tagline": "نظام إدارة الجمعيات الخيرية",
    "loginTitle": "تسجيل الدخول",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "passwordPlaceholder": "كلمة المرور",
    "submit": "تسجيل الدخول",
    "submitLoading": "جاري تسجيل الدخول…",
    "toggleHidePassword": "إخفاء كلمة المرور",
    "toggleShowPassword": "عرض كلمة المرور",
    "demoHintTitle": "بيانات تجريبية:",
    "errorInvalid": "بيانات الدخول غير صحيحة",
    "errorNetwork": "حدث خطأ في الاتصال بالخادم",
    "demoAdminName": "مدير النظام",
    "forgotPassword": "نسيت كلمة المرور؟",
    "forgotTitle": "استعادة كلمة المرور",
    "forgotSubtitle": "أدخل بريدك الإلكتروني وسيتواصل معك المسؤول",
    "forgotSubmit": "إرسال الطلب",
    "forgotLoading": "جاري الإرسال...",
    "forgotSuccessTitle": "تم إرسال طلبك",
    "forgotSuccessMsg1": "تم تسجيل طلب استعادة كلمة المرور.",
    "forgotSuccessMsg2": "سيقوم المسؤول بمراجعة طلبك وتعيين كلمة مرور مؤقتة.",
    "forgotSuccessMsg3": "تواصل مع المسؤول إذا لم تتلقَّ ردًا خلال 24 ساعة.",
    "backToLogin": "العودة لتسجيل الدخول"
  },
  "forceChange": {
    "title": "يجب تغيير كلمة المرور",
    "subtitle": "تم تعيين كلمة مرور مؤقتة لك. يجب تغييرها قبل المتابعة.",
    "currentLabel": "كلمة المرور الحالية (المؤقتة)",
    "newLabel": "كلمة المرور الجديدة",
    "confirmLabel": "تأكيد كلمة المرور الجديدة",
    "mismatch": "كلمتا المرور غير متطابقتين",
    "submit": "تغيير كلمة المرور والمتابعة",
    "loading": "جاري الحفظ...",
    "cannotSkip": "لا يمكن تخطي هذه الخطوة",
    "success": "تم تغيير كلمة المرور بنجاح",
    "rules": {
      "length": "8 أحرف على الأقل",
      "number": "يحتوي على أرقام",
      "upper": "يحتوي على حروف كبيرة",
      "symbol": "يحتوي على رموز (!@#$)"
    }
  },
  "zakat": {
    "btnLabel": "حاسبة الزكاة",
    "title": "حاسبة زكاة المال",
    "nisabLabel": "النصاب التقريبي",
    "cash": "النقد والرصيد البنكي",
    "gold": "الذهب (بالجرام)",
    "goldPrice": "السعر التقريبي للجرام",
    "silver": "الفضة (بالجرام)",
    "stocks": "الأسهم والأوراق المالية",
    "business": "الأصول التجارية",
    "receivables": "ديون لك عند الغير",
    "debts": "الديون عليك (تُطرح)",
    "resultDue": "زكاة واجبة",
    "resultBelow": "لم يبلغ المال النصاب بعد",
    "resultRate": "2.5% من",
    "resultRemaining": "الباقي لبلوغ النصاب",
    "reset": "مسح الأرقام",
    "disclaimer": "هذه الحاسبة تقريبية — يُنصح باستشارة عالم دين"
  }
}
````

<!-- SOURCE: frontend/messages/en/forms.json -->
``json
{
  "validation": {
    "login": {
      "email": "Invalid email address",
      "passwordMin": "Password must be at least 6 characters"
    },
    "family": {
      "headNameMin": "Name must be at least 3 characters",
      "nationalIdLength": "National ID must be 14 digits",
      "nationalIdDigits": "National ID must contain digits only",
      "phoneMin": "Phone must be 11 digits",
      "phoneInvalid": "Invalid Egyptian mobile number",
      "addressMin": "Enter a detailed address",
      "housingRequired": "Select housing type",
      "meezaLength": "Meeza card must be at least 16 digits",
      "categoryRequired": "Select case category",
      "categoryReasonMin": "Explain the classification reason",
      "aidRequired": "Select aid type",
      "monthlyAidRange": "Amount must be between 0 and 9999"
    },
    "member": {
      "nameMin": "Name must be at least 3 characters",
      "nationalId14": "National ID must be 14 digits",
      "relationRequired": "Select relation",
      "birthRequired": "Birth date is required",
      "genderRequired": "Select gender",
      "sourceRequired": "Select income source",
      "amountRequired": "Amount is required",
      "frequencyRequired": "Select frequency",
      "expenseCategoryRequired": "Select expense category",
      "medicalConditionRequired": "Condition is required",
      "personRequired": "Select family member"
    }
  },
  "auth": {
    "tagline": "Charity management platform",
    "loginTitle": "Sign in",
    "email": "Email",
    "password": "Password",
    "passwordPlaceholder": "Password",
    "submit": "Sign in",
    "submitLoading": "Signing in…",
    "toggleHidePassword": "Hide password",
    "toggleShowPassword": "Show password",
    "demoHintTitle": "Demo credentials:",
    "errorInvalid": "Invalid email or password",
    "errorNetwork": "Could not reach the server",
    "demoAdminName": "System administrator",
    "forgotPassword": "Forgot password?",
    "forgotTitle": "Reset Password",
    "forgotSubtitle": "Enter your email and the admin will contact you",
    "forgotSubmit": "Send Request",
    "forgotLoading": "Sending...",
    "forgotSuccessTitle": "Request Sent",
    "forgotSuccessMsg1": "Your password reset request has been recorded.",
    "forgotSuccessMsg2": "The admin will review and set a temporary password for you.",
    "forgotSuccessMsg3": "Contact the admin if you don't receive a response within 24 hours.",
    "backToLogin": "Back to Sign In"
  },
  "forceChange": {
    "title": "Password Change Required",
    "subtitle": "A temporary password was set for you. You must change it before continuing.",
    "currentLabel": "Current Password (Temporary)",
    "newLabel": "New Password",
    "confirmLabel": "Confirm New Password",
    "mismatch": "Passwords do not match",
    "submit": "Change Password & Continue",
    "loading": "Saving...",
    "cannotSkip": "This step cannot be skipped",
    "success": "Password changed successfully",
    "rules": {
      "length": "At least 8 characters",
      "number": "Contains numbers",
      "upper": "Contains uppercase letters",
      "symbol": "Contains symbols (!@#$)"
    }
  },
  "zakat": {
    "btnLabel": "Zakat Calculator",
    "title": "Zakat Calculator",
    "nisabLabel": "Approx. Nisab",
    "cash": "Cash & Bank Balance",
    "gold": "Gold (grams)",
    "goldPrice": "Approx. price per gram",
    "silver": "Silver (grams)",
    "stocks": "Stocks & Securities",
    "business": "Business Assets",
    "receivables": "Receivables",
    "debts": "Your Debts (deducted)",
    "resultDue": "Zakat Due",
    "resultBelow": "Below Nisab threshold",
    "resultRate": "2.5% of",
    "resultRemaining": "remaining to reach Nisab",
    "reset": "Reset",
    "disclaimer": "This calculator is approximate — consult a scholar for verification"
  }
}
````

## SECTION 2 - Notification System
<!-- SOURCE: backend/src/routes/api.js -->
``js
/**
 * Phase 3 API router — /api/*
 */

const express = require('express');
const { optionalAttachUser } = require('../middleware/auth');
const { getApiLimiter } = require('../middleware/rateLimit');
const medicalCasesRouter = require('../modules/medical/medical.routes')
const medicalDisbursementsRouter = require('../modules/medical/medical-disbursements.routes')
const medicalSummaryRouter = require('../modules/medical/medical-summary.routes')
const disbursementRouter = require('../modules/disbursement/disbursement.routes')

const router = express.Router();

router.use(optionalAttachUser);
router.use(getApiLimiter);

router.use('/auth',         require('../modules/auth/auth.routes'));
router.use('/households',   require('../modules/households/households.routes'));
router.use('/simulate',     require('../modules/simulate/simulate.routes'));
router.use('/admin',        require('../modules/admin/admin.routes'));
router.use('/analytics',    require('../modules/analytics/analytics.routes'));
router.use('/audit-logs',   require('../modules/audit/audit.routes'));
router.use('/verification', require('../modules/verification/verification.routes'));
router.use('/education',    require('../modules/education/education.routes'));
router.use('/users',        require('../modules/users/users.routes'));
router.use('/notifications', require('../modules/notifications/notifications.routes'));
router.use('/public',       require('../modules/public/public.routes'));
router.use('/medical-cases', medicalCasesRouter)
router.use('/medical-disbursements', medicalDisbursementsRouter)
router.use('/households', medicalSummaryRouter)
router.use('/disbursement', disbursementRouter)

module.exports = router;

````

<!-- SOURCE: backend/src/modules/notifications/notifications.routes.js -->
``js
const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const { requireAuth } = require('../../middleware/auth');

// All notification routes require authentication
router.use(requireAuth);

router.get('/', notificationsController.getNotifications);
router.post('/send', notificationsController.sendDirectMessage);
router.put('/read-all', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;
````

<!-- SOURCE: backend/src/modules/notifications/notifications.controller.js -->
``js
const notificationsService = require('./notifications.service');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationsService.getNotifications(req.user.userId);
    res.json({ success: true, data: notifications });
  } catch (e) { next(e); }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationsService.markAsRead(id, req.user.userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (e) { next(e); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead(req.user.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (e) { next(e); }
};

const sendDirectMessage = async (req, res, next) => {
  try {
    const { targetUserId, message } = req.body;
    if (!targetUserId || !message) {
      return res.status(400).json({ success: false, error: 'targetUserId and message are required' });
    }

    await notificationsService.sendDirectMessage(req.user.userId, targetUserId, message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (e) { next(e); }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendDirectMessage,
};
````

<!-- SOURCE: backend/src/modules/notifications/notifications.service.js -->
``js
const prisma = require('../../config/prisma');

async function getNotifications(userId) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

async function markAsRead(notificationId, userId) {
  // Ensure the notification belongs to the user
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif || notif.userId !== userId) {
    throw new Error('Notification not found or unauthorized');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

async function markAllAsRead(userId) {
  return await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

async function createNotification({ userId, title, message, type = 'info', link = null }) {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });
}

async function notifyAdmins({ title, message, type = 'info', link = null }) {
  // Find all active ADMIN users
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', active: true },
    select: { id: true },
  });

  if (!admins.length) return;

  const data = admins.map((admin) => ({
    userId: admin.id,
    title,
    message,
    type,
    link,
  }));

  // Create notifications in bulk
  return await prisma.notification.createMany({
    data,
  });
}

async function sendDirectMessage(senderId, targetUserId, message) {
  const sender = await prisma.user.findUnique({ where: { id: senderId } });
  if (!sender) throw new Error("Sender not found");

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    const err = new Error("Target user not found");
    err.status = 404;
    throw err;
  }

  return await prisma.notification.create({
    data: {
      userId: targetUserId,
      title: `رسالة من ${sender.name}`,
      message,
      type: 'info',
    },
  });
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  notifyAdmins,
  sendDirectMessage,
};
````

<!-- SOURCE: backend/src/modules/public/public.routes.js -->
``js
const express = require('express');
const router = express.Router();
const { notifyAdmins } = require('../notifications/notifications.service');

// Public endpoint for "Contact Us" form on the landing page
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    // Send a notification to all ADMIN users
    await notifyAdmins({
      title: `رسالة تواصل جديدة من ${name}`,
      message: `البريد: ${email}\n\nالرسالة: ${message}`,
      type: 'info',
    });

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (e) { next(e); }
});

module.exports = router;
````

<!-- SOURCE: frontend/lib/stores/notificationStore.ts -->
``ts
"use client";

import { create } from "zustand";
import { api } from "@/lib/api/client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time?: string;
  createdAt?: string;
  read?: boolean;
  unread?: boolean;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  (set, get) => ({
    notifications: [],

    fetchNotifications: async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data?.success) {
          // Normalize backend data to frontend model
          const fetched = res.data.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' }),
            createdAt: n.createdAt,
            unread: !n.read,
            type: n.type,
            link: n.link,
          }));
          set({ notifications: fetched });
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    },

    markAsRead: async (id) => {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        ),
      }));
      
      try {
        await api.put(`/notifications/${id}/read`);
      } catch (error) {
        // Revert on error could be implemented here
        console.error("Failed to mark as read:", error);
      }
    },

    markAllAsRead: async () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, unread: false })),
      }));

      try {
        await api.put(`/notifications/read-all`);
      } catch (error) {
        console.error("Failed to mark all as read:", error);
      }
    },

    clearAll: () => {
      set({ notifications: [] });
    },
  })
);
````

<!-- SOURCE: frontend/components/topbar.tsx -->
``tsx
"use client";

import { useMemo, useState } from "react";
import { Bell, Search, LogOut, User, ChevronDown, Clock, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { MobileSidebar } from "@/components/app-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { getRoleBadgeClass } from "@/lib/hooks/usePermission";
import { useLocale } from "next-intl";
import { AccountSettingsModal } from "@/components/AccountSettingsModal";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  ADMIN:      { ar: "مدير النظام", en: "System Admin" },
  SUPERVISOR: { ar: "مشرف",        en: "Supervisor" },
  WORKER:     { ar: "موظف إدخال", en: "Data Entry" },
  VIEWER:     { ar: "مستعرض",      en: "Viewer" },
};

function formatRelativeDate(dateStr: string | null | undefined, isRtl: boolean): string {
  if (!dateStr) return isRtl ? "لا يوجد" : "Never";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return isRtl ? "لا يوجد" : "Never";
  return date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function Topbar() {
  const t = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    // Fetch immediately
    void fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const role = user?.role ?? "";
  const [searchValue, setSearchValue] = useState("");
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const roleLabel = role ? (isRtl ? ROLE_LABELS[role]?.ar : ROLE_LABELS[role]?.en) : role;
  const roleBadgeClass = getRoleBadgeClass(role);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-card border-b border-border shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div className="relative hidden sm:block">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("topbar.search_placeholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(
                  searchValue.trim()
                    ? `/dashboard/households?search=${encodeURIComponent(searchValue.trim())}`
                    : `/dashboard/households`
                );
              }
            }}
            className="w-64 lg:w-80 pe-10 bg-secondary border-0 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">{t("topbar.notifications")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-sm">{t("topbar.notifications")}</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  {isRtl ? "تحديد الكل كمقروء" : "Mark all as read"}
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  {isRtl ? "لا توجد إشعارات" : "No notifications"}
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors cursor-pointer",
                      notif.unread && "bg-slate-50/50 dark:bg-slate-800/20"
                    )}
                  >
                    {notif.unread ? (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                    ) : (
                      <span className="mt-1.5 h-2 w-2 shrink-0 bg-transparent" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-relaxed", notif.unread ? "font-semibold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Popover */}
        <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="h-8 w-8 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  {user?.name?.[0] || "U"}
                </span>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">
                  {user?.name || t("topbar.admin")}
                </span>
                {role && (
                  <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadgeClass}`}>
                    {roleLabel}
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0">
            {/* User info header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    {user?.name?.[0] || "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {isRtl ? "مرحباً،" : "Hello,"} {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              {/* Role badge */}
              {role && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleBadgeClass}`}>
                  {isRtl ? "الدور:" : "Role:"} {roleLabel}
                </span>
              )}
            </div>

            {/* Last login */}
            {(user as any)?.lastLoginAt && (
              <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isRtl ? "آخر دخول: " : "Last login: "}
                  {formatRelativeDate((user as any).lastLoginAt, isRtl)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              <button 
                onClick={() => { setSettingsOpen(true); setUserPopoverOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-accent rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                {isRtl ? "إعدادات الحساب" : "Account Settings"}
              </button>
              <button
                onClick={() => { void logout(); setUserPopoverOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isRtl ? "تسجيل الخروج" : "Sign Out"}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {settingsOpen && (
        <AccountSettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </header>
  );
}
````

<!-- SOURCE: frontend/app/[locale]/dashboard/users/SendMessageModal.tsx -->
``tsx
"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

interface SendMessageModalProps {
  user: { id: string; name: string };
  onClose: () => void;
  isRtl: boolean;
}

export function SendMessageModal({ user, onClose, isRtl }: SendMessageModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/notifications/send", { targetUserId: user.id, message });
      toast.success(isRtl ? "تم إرسال الرسالة بنجاح" : "Message sent successfully");
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || (isRtl ? "حدث خطأ أثناء الإرسال" : "Error sending message"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white resize-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-slate-200 dark:ring-slate-700 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
          {isRtl ? `إرسال رسالة إلى ${user.name}` : `Send message to ${user.name}`}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isRtl ? "ستظهر هذه الرسالة كإشعار فوري لدى المستخدم." : "This message will appear as an instant notification for the user."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder={isRtl ? "اكتب رسالتك هنا..." : "Type your message here..."}
              className={inputCls}
            />
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {isRtl ? "إرسال الرسالة" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
````

### Notification Answers
1. Notification types implemented: generic in-app notifications with `type` string values, admin contact-form notifications (`type: contact`), direct user messages (`type: message`), and household note/update notifications created by existing household service paths.
2. Delivery: in-app notifications through the topbar bell and persisted `Notification` rows; no email, SMS, push, WebSocket, or SSE implementation was found.
3. Triggers: `/public/contact` creates admin notifications, `/notifications/send` sends manual direct messages, household notes can notify selected users, and household updates notify admins. Frontend fetch is manual/poll-like via `fetchNotifications`; no interval polling was found in the store itself.
4. Prisma model: `Notification` exists in `backend/prisma/schema.prisma`; model block copied below.
``prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  type      String   @default("info")
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, read])
  @@index([createdAt])
}
````
5. API endpoints: `/api/notifications`, `/api/notifications/send`, `/api/notifications/read-all`, `/api/notifications/:id/read`, and `/api/public/contact`.
6. Frontend renderers: `frontend/components/topbar.tsx` renders the bell dropdown; `frontend/app/[locale]/dashboard/users/SendMessageModal.tsx` sends direct notifications; `frontend/lib/stores/notificationStore.ts` stores notification state.
7. Zustand store: copied above as `frontend/lib/stores/notificationStore.ts`.
8. Realtime/polling: not realtime. The current implementation uses HTTP fetch/mutations through Axios.
9. i18n keys related to notifications are copied below.

| Method | Path | Module | Description | Min Role |
|---|---|---|---|---|
| GET | / | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| POST | /send | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| PUT | /read-all | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| PUT | /:id/read | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| POST | /contact | public | Route defined in backend/src/modules/public/public.routes.js | Public or inherited |

### Relevant i18n Keys - Notifications
<!-- SOURCE: frontend/messages/ar/common.json -->
``json
{
  "app_name": "إدارة العمل الخيري",
  "search_placeholder": "بحث...",
  "filters": "تصفية النتائج",
  "actions": {
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "save": "حفظ",
    "cancel": "إلغاء",
    "view": "عرض",
    "confirm": "تأكيد"
  },
  "states": {
    "loading": "جاري التحميل...",
    "error": "حدث خطأ غير متوقع",
    "no_data": "لا توجد بيانات متاحة",
    "not_found": "العنصر المطلوب غير موجود"
  },
  "nav": {
    "dashboard": "لوحة التحكم",
    "households": "الأسر المستهدفة",
    "medical": "السجلات الطبية والاعانات",
    "education": "التعليم",
    "disbursement": "القبض الشهري",
    "volunteers": "المتطوعون",
    "analytics": "التحليلات",
    "verification": "مركز التوثيق",
    "ruleEditor": "إدارة القواعد",
    "auditLog": "سجل التدقيق",
    "reports": "التقارير",
    "users": "المستخدمين والصلاحيات",
    "groups": {
      "main": "الرئيسية",
      "management": "الإدارة",
      "system": "النظام"
    }
  },
  "sidebar": {
    "dashboard": "لوحة التحكم",
    "households": "الأسر المستهدفة",
    "analytics": "التحليلات",
    "verification": "مركز التوثيق",
    "admin": "إدارة القواعد",
    "audit": "سجل التدقيق",
    "families": "الأسر",
    "medical_record": "السجلات الطبية والاعانات",
    "education": "التعليم",
    "volunteers": "المتطوعين",
    "reports": "التقارير",
    "audit_log": "سجل التعديلات",
    "users_permissions": "المستخدمين والصلاحيات",
    "system_title": "نظام إدارة الجمعيات"
  },
  "topbar": {
    "search_placeholder": "بحث بالرقم القومي أو الهاتف...",
    "notifications": "الإشعارات",
    "profile": "الملف الشخصي",
    "logout": "تسجيل الخروج",
    "admin": "مدير النظام"
  },
  "theme": {
    "label": "مظهر الألوان",
    "light": "فاتح",
    "dark": "داكن",
    "system": "حسب النظام"
  },
  "language": {
    "menu_label": "لغة الواجهة",
    "ar": "العربية",
    "en": "English",
    "ar_hint": "RTL · العربية",
    "en_hint": "LTR · English"
  },
  "mobile": {
    "open_menu": "فتح القائمة",
    "menu_title": "التنقل"
  },
  "demo_notifications": {
    "n1": "تم تسجيل أسرة جديدة - عائلة محمد أحمد",
    "n2": "تحديث حالة طبية حرجة - فاطمة السيد",
    "n3": "اكتمال البحث الميداني - عائلة حسن علي",
    "n4": "موعد اجتماع لجنة التقييم غداً",
    "t1": "منذ 5 دقائق",
    "t2": "منذ ساعة",
    "t3": "منذ 3 ساعات",
    "t4": "منذ 5 ساعات"
  },
  "metadata": {
    "title": "CharityHub — إدارة الجمعيات الخيرية",
    "description": "نظام متكامل لإدارة الأسر والمساعدات والعمل الميداني."
  }
}
````

<!-- SOURCE: frontend/messages/en/common.json -->
``json
{
  "app_name": "Charity Hub",
  "search_placeholder": "Search...",
  "filters": "Filters",
  "actions": {
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "view": "View",
    "confirm": "Confirm"
  },
  "states": {
    "loading": "Loading...",
    "error": "An unexpected error occurred",
    "no_data": "No data available",
    "not_found": "Requested item not found"
  },
  "nav": {
    "dashboard": "Dashboard",
    "households": "Households",
    "medical": "Medical Records",
    "education": "Education",
    "volunteers": "Volunteers",
    "disbursement": "Monthly Disbursement",
    "analytics": "Analytics",
    "verification": "Verification Center",
    "ruleEditor": "Rule Engine",
    "auditLog": "Audit Log",
    "reports": "Reports",
    "users": "Users & Roles",
    "groups": {
      "main": "Main",
      "management": "Management",
      "system": "System"
    }
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "households": "Households",
    "analytics": "Analytics",
    "verification": "Verification",
    "admin": "Admin",
    "audit": "Audit Log",
    "families": "Families",
    "medical_record": "Medical Record",
    "education": "Education",
    "volunteers": "Volunteers",
    "reports": "Reports",
    "audit_log": "Audit Log",
    "users_permissions": "Users & Permissions",
    "system_title": "Charity Management"
  },
  "topbar": {
    "search_placeholder": "Search by National ID or phone...",
    "notifications": "Notifications",
    "profile": "Profile",
    "logout": "Logout",
    "admin": "System Admin"
  },
  "theme": {
    "label": "Color theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System"
  },
  "language": {
    "menu_label": "Interface language",
    "ar": "Arabic",
    "en": "English",
    "ar_hint": "RTL · العربية",
    "en_hint": "LTR · English"
  },
  "mobile": {
    "open_menu": "Open menu",
    "menu_title": "Navigation"
  },
  "demo_notifications": {
    "n1": "New family registered — Mohammed Ahmed family",
    "n2": "Critical medical status update — Fatima Al-Sayed",
    "n3": "Field research completed — Hassan Ali family",
    "n4": "Evaluation committee meeting scheduled for tomorrow",
    "t1": "5 minutes ago",
    "t2": "1 hour ago",
    "t3": "3 hours ago",
    "t4": "5 hours ago"
  },
  "metadata": {
    "title": "CharityHub — Charity management",
    "description": "Manage families, aid distributions, and field operations."
  }
}
````

## SECTION 3 - Medical Records Module (Rebuilt)
<!-- SOURCE: backend/src/modules/medical/medical.controller.js -->
``js
const svc = require('./medical.service')
const { asyncHandler } = require('../../middleware/errorHandler')

// ─── Cases ────────────────────────────────────────────────

const listCases = asyncHandler(async (req, res) => {
  const result = await svc.listCases(req.query)
  res.json({ success: true, data: result })
})

const getCaseById = asyncHandler(async (req, res) => {
  const c = await svc.getCaseById(req.params.id)
  res.json({ success: true, data: c })
})

const getCasesByHousehold = asyncHandler(async (req, res) => {
  const cases = await svc.getCasesByHousehold(req.params.householdId)
  res.json({ success: true, data: cases })
})

const createCase = asyncHandler(async (req, res) => {
  const c = await svc.createCase(req.body, req.user.userId)
  res.status(201).json({ success: true, data: c })
})

const updateCase = asyncHandler(async (req, res) => {
  const c = await svc.updateCase(req.params.id, req.body)
  res.json({ success: true, data: c })
})

const deleteCase = asyncHandler(async (req, res) => {
  await svc.deleteCase(req.params.id)
  res.json({ success: true, message: 'تم حذف الحالة الطبية' })
})

// ─── Eligibility ──────────────────────────────────────────

const checkEligibility = asyncHandler(async (req, res) => {
  const { householdId } = req.params
  const { aidType, personId } = req.query
  if (!aidType) return res.status(400).json({ success: false, message: 'aidType مطلوب' })
  const result = await svc.getEligibility(householdId, aidType, personId)
  res.json({ success: true, data: result })
})

// ─── Disbursements ────────────────────────────────────────

const createDisbursement = asyncHandler(async (req, res) => {
  const result = await svc.createDisbursement(req.body, req.user.userId)
  const status = result.amountWarning ? 201 : 201
  res.status(status).json({ success: true, data: result })
})

const getDisbursementsByHousehold = asyncHandler(async (req, res) => {
  const data = await svc.getDisbursementsByHousehold(req.params.householdId)
  res.json({ success: true, data })
})

const approveDisbursement = asyncHandler(async (req, res) => {
  const d = await svc.approveDisbursement(req.params.id, req.user.userId)
  res.json({ success: true, data: d })
})

const payDisbursement = asyncHandler(async (req, res) => {
  const d = await svc.payDisbursement(req.params.id, req.user.userId)
  res.json({ success: true, data: d })
})

const rejectDisbursement = asyncHandler(async (req, res) => {
  const d = await svc.rejectDisbursement(req.params.id, req.user.userId)
  res.json({ success: true, data: d })
})

// ─── Summary / KPIs ───────────────────────────────────────

const getMedicalSummary = asyncHandler(async (req, res) => {
  const data = await svc.getMedicalSummary(req.params.householdId)
  res.json({ success: true, data })
})

const getMedicalKpis = asyncHandler(async (req, res) => {
  const data = await svc.getMedicalKpis()
  res.json({ success: true, data })
})

module.exports = {
  listCases, getCaseById, getCasesByHousehold,
  createCase, updateCase, deleteCase,
  checkEligibility,
  createDisbursement, getDisbursementsByHousehold,
  approveDisbursement, payDisbursement, rejectDisbursement,
  getMedicalSummary, getMedicalKpis,
}
````

<!-- SOURCE: backend/src/modules/medical/medical.repository.js -->
``js
const prisma = require('../../config/prisma')

const CASE_INCLUDE = {
  person: { select: { id: true, name: true, gender: true, birthDate: true, isBride: true } },
  household: {
    select: {
      id: true, code: true,
      persons: { select: { id: true, name: true } },
      scoreResults: {
        orderBy: { calculatedAt: 'desc' },
        take: 1,
        select: { normalizedPercent: true, systemRecommendation: true, humanDecision: true, reviewStatus: true }
      }
    }
  },
  disbursements: {
    orderBy: { disbursementDate: 'desc' },
    include: { approvedBy: { select: { id: true, name: true } } }
  },
  createdBy: { select: { id: true, name: true } }
}

// ─── MedicalCase ──────────────────────────────────────────

async function findAllCases({ search, aidType, criticalOnly, isActive, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit
  const where = {
    AND: [
      search ? {
        OR: [
          { conditionName: { contains: search, mode: 'insensitive' } },
          { person: { name: { contains: search, mode: 'insensitive' } } },
          { household: { code: { contains: search, mode: 'insensitive' } } },
          { household: { persons: { some: { name: { contains: search, mode: 'insensitive' } } } } },
        ]
      } : {},
      criticalOnly ? { isCritical: true } : {},
      isActive !== undefined ? { isActive } : {},
    ]
  }

  const [cases, total] = await Promise.all([
    prisma.medicalCase.findMany({
      where,
      include: CASE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.medicalCase.count({ where })
  ])

  return { cases, total, page, limit, totalPages: Math.ceil(total / limit) }
}

async function findCaseById(id) {
  return prisma.medicalCase.findUnique({ where: { id }, include: CASE_INCLUDE })
}

async function findCasesByHousehold(householdId) {
  return prisma.medicalCase.findMany({
    where: { householdId },
    include: CASE_INCLUDE,
    orderBy: { createdAt: 'desc' }
  })
}

async function createCase(data) {
  return prisma.medicalCase.create({ data, include: CASE_INCLUDE })
}

async function updateCase(id, data) {
  return prisma.medicalCase.update({ where: { id }, data, include: CASE_INCLUDE })
}

async function deleteCase(id) {
  return prisma.medicalCase.delete({ where: { id } })
}

// ─── MedicalDisbursement ──────────────────────────────────

async function findDisbursementsByHousehold(householdId) {
  return prisma.medicalDisbursement.findMany({
    where: { householdId },
    include: {
      person: { select: { id: true, name: true, gender: true, birthDate: true } },
      medicalCase: { select: { id: true, conditionName: true } },
      approvedBy: { select: { id: true, name: true } },
    },
    orderBy: { disbursementDate: 'desc' }
  })
}

async function getLastDisbursementDate(householdId) {
  // الـ cooldown مشترك — نحتاج تاريخ آخر صرف أياً كان النوع
  const last = await prisma.medicalDisbursement.findFirst({
    where: { householdId, status: { not: 'REJECTED' } },
    orderBy: { disbursementDate: 'desc' },
    select: { disbursementDate: true }
  })
  return last?.disbursementDate ?? null
}

async function hasMarriageAidForPerson(personId) {
  const count = await prisma.medicalDisbursement.count({
    where: { personId, aidType: 'MARRIAGE_AID', status: { not: 'REJECTED' } }
  })
  return count > 0
}

async function createDisbursement(data) {
  return prisma.medicalDisbursement.create({
    data,
    include: {
      person: { select: { id: true, name: true } },
      medicalCase: { select: { id: true, conditionName: true } },
    }
  })
}

async function updateDisbursementStatus(id, status, approvedById) {
  return prisma.medicalDisbursement.update({
    where: { id },
    data: {
      status,
      approvedById: approvedById ?? undefined,
      approvedAt: status === 'APPROVED' ? new Date() : undefined,
    }
  })
}

// ─── Medical Summary ──────────────────────────────────────

async function getMedicalSummary(householdId) {
  const disbursements = await prisma.medicalDisbursement.findMany({
    where: { householdId, status: { not: 'REJECTED' } },
    select: { aidType: true, amount: true, status: true, disbursementDate: true }
  })

  const counts = {
    consultation: 0, labTest: 0, imaging: 0,
    treatment: 0, surgery: 0, financialAid: 0, marriageAid: 0
  }
  const amounts = {
    consultation: 0, labTest: 0, imaging: 0,
    treatment: 0, surgery: 0, financialAid: 0, marriageAid: 0, total: 0
  }

  const keyMap = {
    CONSULTATION: 'consultation', LAB_TEST: 'labTest', IMAGING: 'imaging',
    TREATMENT: 'treatment', SURGERY: 'surgery',
    FINANCIAL_AID: 'financialAid', MARRIAGE_AID: 'marriageAid'
  }

  for (const d of disbursements) {
    const k = keyMap[d.aidType]
    if (k) {
      counts[k]++
      const amt = Number(d.amount)
      amounts[k] += amt
      amounts.total += amt
    }
  }

  const hasUnverified = disbursements.some(d => d.status === 'PENDING')
  const sorted = disbursements.sort((a, b) => new Date(b.disbursementDate) - new Date(a.disbursementDate))
  const lastDate = sorted[0]?.disbursementDate ?? null

  return { counts, amounts, hasUnverifiedDisbursements: hasUnverified, lastDisbursementDate: lastDate }
}

// ─── KPI Stats ────────────────────────────────────────────

async function getMedicalKpis() {
  const [totalCases, criticalCases, costAgg] = await Promise.all([
    prisma.medicalCase.count(),
    prisma.medicalCase.count({ where: { isCritical: true } }),
    prisma.medicalCase.aggregate({ _sum: { estimatedMonthlyCost: true } }),
  ])
  return {
    totalCases,
    criticalCases,
    monthlyEstimate: Number(costAgg._sum.estimatedMonthlyCost ?? 0)
  }
}

module.exports = {
  findAllCases, findCaseById, findCasesByHousehold,
  createCase, updateCase, deleteCase,
  findDisbursementsByHousehold, getLastDisbursementDate,
  hasMarriageAidForPerson, createDisbursement, updateDisbursementStatus,
  getMedicalSummary, getMedicalKpis,
}
````

<!-- SOURCE: backend/src/modules/medical/medical.routes.js -->
``js
const router = require('express').Router()
const ctrl = require('./medical.controller')
const { requireAuth } = require('../../middleware/auth')
const { requireAnyRole } = require('../../middleware/rbac')

// كل الـ routes تحتاج auth
router.use(requireAuth)

// ─── Medical Cases ────────────────────────────────────────
// GET  /api/medical-cases
router.get('/', ctrl.listCases)

// GET  /api/medical-cases/kpis
router.get('/kpis', ctrl.getMedicalKpis)

// GET  /api/medical-cases/household/:householdId
router.get('/household/:householdId', ctrl.getCasesByHousehold)

// POST /api/medical-cases
router.post('/', requireAnyRole(['WORKER', 'SUPERVISOR', 'ADMIN']), ctrl.createCase)

// GET  /api/medical-cases/:id
router.get('/:id', ctrl.getCaseById)

// PUT  /api/medical-cases/:id
router.put('/:id', requireAnyRole(['WORKER', 'SUPERVISOR', 'ADMIN']), ctrl.updateCase)

// DELETE /api/medical-cases/:id
router.delete('/:id', requireAnyRole(['ADMIN']), ctrl.deleteCase)

// ─── Eligibility Check ────────────────────────────────────
// GET  /api/medical-cases/eligibility/:householdId?aidType=TREATMENT&personId=xxx
router.get('/eligibility/:householdId', ctrl.checkEligibility)

// GET  /api/medical-cases/summary/:householdId
router.get('/summary/:householdId', ctrl.getMedicalSummary)

module.exports = router
````

<!-- SOURCE: backend/src/modules/medical/medical.service.js -->
``js
const repo = require('./medical.repository')
const { checkEligibility, validateAmount } = require('./medical-eligibility')
const { AppError } = require('../../shared/errors')

// ─── Cases ────────────────────────────────────────────────

async function listCases(query) {
  const { search, aidType, criticalOnly, isActive, page, limit } = query
  return repo.findAllCases({
    search,
    aidType,
    criticalOnly: criticalOnly === 'true',
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  })
}

async function getCaseById(id) {
  const c = await repo.findCaseById(id)
  if (!c) throw new AppError('الحالة الطبية غير موجودة', 404)
  return c
}

async function getCasesByHousehold(householdId) {
  return repo.findCasesByHousehold(householdId)
}

async function createCase(data, userId) {
  return repo.createCase({ ...data, createdById: userId })
}

async function updateCase(id, data) {
  await getCaseById(id)
  return repo.updateCase(id, data)
}

async function deleteCase(id) {
  await getCaseById(id)
  return repo.deleteCase(id)
}

// ─── Eligibility Check ────────────────────────────────────

async function getEligibility(householdId, aidType, personId) {
  // جلب تصنيف الأسرة من آخر ScoreResult
  const prisma = require('../../config/prisma')

  const lastScore = await prisma.scoreResult.findFirst({
    where: { householdId },
    orderBy: { calculatedAt: 'desc' },
    select: { assistanceType: true, normalizedPercent: true }
  })
  const assistanceType = lastScore?.assistanceType ?? 'NONE'

  // آخر تاريخ صرف (مشترك لكل الأنواع)
  const lastDate = await repo.getLastDisbursementDate(householdId)

  // للزواج: هل سبق صرفها
  const hasPreviousMarriage = personId && aidType === 'MARRIAGE_AID'
    ? await repo.hasMarriageAidForPerson(personId)
    : false

  const isCritical = false // يُحدَّد من بيانات الحالة، مش من هنا

  const result = checkEligibility({
    assistanceType,
    lastDisbursementDate: lastDate,
    aidType,
    isCritical,
    hasPreviousMarriageAid: hasPreviousMarriage,
  })

  return {
    ...result,
    assistanceType,
    lastDisbursementDate: lastDate,
    normalizedPercent: lastScore?.normalizedPercent ?? null,
  }
}

// ─── Disbursements ────────────────────────────────────────

async function createDisbursement(data, userId) {
  const { householdId, personId, aidType, amount, isCritical, medicalCaseId } = data

  // جلب تصنيف الأسرة
  const prisma = require('../../config/prisma')

  const lastScore = await prisma.scoreResult.findFirst({
    where: { householdId },
    orderBy: { calculatedAt: 'desc' },
    select: { assistanceType: true }
  })
  const assistanceType = lastScore?.assistanceType ?? 'NONE'

  const lastDate = await repo.getLastDisbursementDate(householdId)
  const hasPreviousMarriage = aidType === 'MARRIAGE_AID'
    ? await repo.hasMarriageAidForPerson(personId)
    : false

  const eligibility = checkEligibility({
    assistanceType,
    lastDisbursementDate: lastDate,
    aidType,
    isCritical: isCritical ?? false,
    hasPreviousMarriageAid: hasPreviousMarriage,
  })

  // فحص المبلغ (تحذير فقط — لا نمنع الحفظ)
  const amountCheck = validateAmount(Number(amount), eligibility)

  // تحديد الـ status الابتدائي
  // العملية دائماً PENDING (تحتاج مشرف)
  // الحالات الأخرى: لو eligibility.warningLevel !== 'OK' → PENDING أيضاً لكن بنحفظ
  const initialStatus = 'PENDING'

  const disbursement = await repo.createDisbursement({
    householdId,
    personId,
    medicalCaseId: medicalCaseId ?? null,
    aidType,
    amount,
    totalCost: data.totalCost ?? null,
    coveragePercent: data.coveragePercent ?? null,
    isCriticalOverride: eligibility.isCriticalOverride ?? false,
    isRetroactive: data.isRetroactive ?? false,
    disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : new Date(),
    status: initialStatus,
    notes: data.notes ?? null,
    createdById: userId,
  })

  // AuditLog
  try {
    const { auditLogger } = require('../../shared/audit/auditLogger')
    await auditLogger.log({
      userId,
      householdId,
      action: 'CREATE',
      entity: 'MedicalDisbursement',
      entityId: disbursement.id,
      after: { aidType, amount, status: initialStatus, warnings: amountCheck.warning },
    })
  } catch (_) {}

  return {
    disbursement,
    eligibilityResult: eligibility,
    amountWarning: amountCheck.warning,
  }
}

async function approveDisbursement(id, approverId) {
  const prisma = require('../../config/prisma')
  const d = await prisma.medicalDisbursement.findUnique({ where: { id } })
  if (!d) throw new AppError('الصرف غير موجود', 404)
  if (d.status !== 'PENDING') throw new AppError('هذا الصرف ليس في حالة انتظار', 400)
  return repo.updateDisbursementStatus(id, 'APPROVED', approverId)
}

async function payDisbursement(id, approverId) {
  return repo.updateDisbursementStatus(id, 'PAID', approverId)
}

async function rejectDisbursement(id, approverId) {
  return repo.updateDisbursementStatus(id, 'REJECTED', approverId)
}

async function getDisbursementsByHousehold(householdId) {
  return repo.findDisbursementsByHousehold(householdId)
}

async function getMedicalSummary(householdId) {
  return repo.getMedicalSummary(householdId)
}

async function getMedicalKpis() {
  return repo.getMedicalKpis()
}

module.exports = {
  listCases, getCaseById, getCasesByHousehold,
  createCase, updateCase, deleteCase,
  getEligibility,
  createDisbursement, approveDisbursement, payDisbursement,
  rejectDisbursement, getDisbursementsByHousehold,
  getMedicalSummary, getMedicalKpis,
}
````

<!-- SOURCE: backend/src/modules/medical/medical-disbursements.routes.js -->
``js
const router = require('express').Router()
const ctrl = require('./medical.controller')
const { requireAuth } = require('../../middleware/auth')
const { requireAnyRole } = require('../../middleware/rbac')

router.use(requireAuth)

// POST /api/medical-disbursements
router.post('/', requireAnyRole(['WORKER', 'SUPERVISOR', 'ADMIN']), ctrl.createDisbursement)

// GET  /api/medical-disbursements/household/:householdId
router.get('/household/:householdId', ctrl.getDisbursementsByHousehold)

// PATCH /api/medical-disbursements/:id/approve
router.patch('/:id/approve', requireAnyRole(['SUPERVISOR', 'ADMIN']), ctrl.approveDisbursement)

// PATCH /api/medical-disbursements/:id/pay
router.patch('/:id/pay', requireAnyRole(['SUPERVISOR', 'ADMIN']), ctrl.payDisbursement)

// PATCH /api/medical-disbursements/:id/reject
router.patch('/:id/reject', requireAnyRole(['SUPERVISOR', 'ADMIN']), ctrl.rejectDisbursement)

module.exports = router
````

<!-- SOURCE: backend/src/modules/medical/medical-eligibility.js -->
``js
// medical-eligibility.js
// ⚠️ هذا الملف يحتوي على قواعد الأهلية — لا تعدّل القيم مباشرة
// كل المعاملات مأخوذة من assistanceType وآخر تاريخ صرف

const COOLDOWN_DAYS = {
  MEDICAL_TREATMENT: 30,  // مساعدة طبية + أي نوع = 30 يوم
  DEFAULT: 40,            // باقي التصنيفات = 40 يوم
}

const CAPS = {
  MEDICAL_TREATMENT: 800,   // مساعدة طبية
  DEFAULT: 400,             // باقي التصنيفات
  CONSULTATION_DEFAULT: 200,// كشف طبي — القيمة الافتراضية
  MARRIAGE_AID_MAX: 70000,  // إعانة زواج
}

// التصنيفات التي تسمح بالاعانات الطبية
const ALLOWED_ASSISTANCE_TYPES = ['MONTHLY_CASH', 'MONTHLY_MEDICAL', 'SEASONAL_MIXED']

/**
 * checkEligibility
 * @param {object} params
 * @param {string} params.assistanceType - من قرار اللجنة
 * @param {Date|null} params.lastDisbursementDate - تاريخ آخر اعانة أي نوع
 * @param {string} params.aidType - نوع الاعانة المطلوبة
 * @param {boolean} params.isCritical - هل الحالة حرجة
 * @param {boolean} params.hasPreviousMarriageAid - للزواج: هل سبق صرفها
 * @returns {object} EligibilityResult
 */
function checkEligibility({ assistanceType, lastDisbursementDate, aidType, isCritical, hasPreviousMarriageAid }) {
  // 1. فحص التصنيف — هل الأسرة مؤهلة أصلاً
  if (!ALLOWED_ASSISTANCE_TYPES.includes(assistanceType)) {
    return {
      isEligible: false,
      warningLevel: 'BLOCKED',
      message: 'هذه الأسرة غير مؤهلة للاعانات الطبية بناءً على تصنيف اللجنة',
      cooldownDays: 0,
      appliedCap: null,
      requiresSupervisor: false,
    }
  }

  // 2. إعانة الزواج — قواعد خاصة (لا cooldown، مرة واحدة)
  if (aidType === 'MARRIAGE_AID') {
    if (hasPreviousMarriageAid) {
      return {
        isEligible: false,
        warningLevel: 'BLOCKED',
        message: 'تم صرف إعانة الزواج لهذا الشخص مسبقاً — تُصرف مرة واحدة فقط',
        cooldownDays: 0,
        appliedCap: CAPS.MARRIAGE_AID_MAX,
        requiresSupervisor: false,
      }
    }
    return {
      isEligible: true,
      warningLevel: 'OK',
      message: null,
      cooldownDays: 0,
      appliedCap: CAPS.MARRIAGE_AID_MAX,
      requiresSupervisor: false,
    }
  }

  // 3. العملية — تحتاج مشرف دائماً (لكن مش blocked)
  const requiresSupervisor = aidType === 'SURGERY'

  // 4. حساب cooldown وفقاً للتصنيف
  const cooldownDays = assistanceType === 'MONTHLY_MEDICAL'
    ? COOLDOWN_DAYS.MEDICAL_TREATMENT
    : COOLDOWN_DAYS.DEFAULT

  // 5. حساب السقف المطبق
  let appliedCap = assistanceType === 'MONTHLY_MEDICAL' && aidType === 'TREATMENT'
    ? CAPS.MEDICAL_TREATMENT
    : CAPS.DEFAULT

  // 6. الحالة الحرجة تلغي السقف للعلاج فقط
  const isCriticalOverride = isCritical && aidType === 'TREATMENT'
  if (isCriticalOverride) appliedCap = null

  // 7. فحص الـ cooldown (مشترك بين كل الأنواع)
  if (!lastDisbursementDate) {
    return {
      isEligible: true,
      warningLevel: 'OK',
      message: null,
      cooldownDays,
      appliedCap,
      requiresSupervisor,
      isCriticalOverride,
    }
  }

  const now = new Date()
  const last = new Date(lastDisbursementDate)
  const daysPassed = Math.floor((now - last) / (1000 * 60 * 60 * 24))

  if (daysPassed < cooldownDays) {
    const remaining = cooldownDays - daysPassed
    const nextDate = new Date(last.getTime() + cooldownDays * 24 * 60 * 60 * 1000)
    return {
      isEligible: false,
      warningLevel: 'WARNING',
      message: `لم تمر المدة المطلوبة — الاعانة التالية بعد ${remaining} يوم`,
      cooldownDays,
      nextEligibleDate: nextDate.toISOString().split('T')[0],
      remaining,
      appliedCap,
      requiresSupervisor,
      isCriticalOverride,
    }
  }

  return {
    isEligible: true,
    warningLevel: 'OK',
    message: null,
    cooldownDays,
    appliedCap,
    requiresSupervisor,
    isCriticalOverride,
  }
}

/**
 * validateAmount
 * @param {number} amount - المبلغ المطلوب
 * @param {object} eligibility - نتيجة checkEligibility
 * @returns {{ valid: boolean, warning: string|null }}
 */
function validateAmount(amount, eligibility) {
  if (!eligibility.appliedCap) return { valid: true, warning: null }
  if (amount > eligibility.appliedCap) {
    return {
      valid: false,
      warning: `قيمة الاعانة (${amount} ج.م.) تتجاوز الحد المسموح (${eligibility.appliedCap} ج.م.)`,
    }
  }
  return { valid: true, warning: null }
}

module.exports = { checkEligibility, validateAmount, CAPS, COOLDOWN_DAYS }
````

<!-- SOURCE: backend/src/modules/medical/medical-summary.routes.js -->
``js
const router = require('express').Router()
const ctrl = require('./medical.controller')
const { requireAuth } = require('../../middleware/auth')

router.use(requireAuth)

// GET /api/households/:householdId/medical-summary
router.get('/:householdId/medical-summary', ctrl.getMedicalSummary)

module.exports = router
````

<!-- SOURCE: frontend/components/medical/dashboard/dashboard-header.tsx -->
``tsx
"use client";

import { Plus, Menu } from "lucide-react";
import { useMedicalModalStore } from "@/lib/medical/store";

export function DashboardHeader() {
  const openModal = useMedicalModalStore((s) => s.openModal);

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">إدارة السجلات الطبية</h1>
        <p className="text-gray-600 mt-2">نظام إدارة السجلات الطبية والمساعدات الطبية</p>
      </div>
      <button
        onClick={openModal}
        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
      >
        <Plus className="w-5 h-5" />
        إضافة سجل جديد
      </button>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/dashboard/kpi-cards.tsx -->
``tsx
"use client";

import { TrendingUp, DollarSign, Users, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/medical/utils";

interface KPICardsProps {
  totalRecords: number;
  totalDisbursed: number;
  averageAmount: number;
  fullyEligibleCount: number;
}

export function KPICards({
  totalRecords,
  totalDisbursed,
  averageAmount,
  fullyEligibleCount,
}: KPICardsProps) {
  const cards = [
    {
      label: "إجمالي السجلات",
      value: totalRecords.toString(),
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "إجمالي الصرف",
      value: formatCurrency(totalDisbursed),
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "متوسط المبلغ",
      value: formatCurrency(averageAmount),
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "مستحقون كاملاً",
      value: fullyEligibleCount.toString(),
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/dashboard/records-table.tsx -->
``tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMedicalStore } from "../../../lib/stores/medicalStore";

import {
  formatCurrency,
  formatDateShort,
  getEligibilityColor,
  getEligibilityLabel,
  getStatusColor,
  getStatusLabel,
  getAidTypeLabel,
} from "@/lib/medical/utils";
import { AgeCircle } from "../shared/age-circle";
import { Badge } from "../shared/badge";
import type { MedicalCase } from "../../../types/medical";

export function MedicalRecordsTable({ records }: { records: MedicalCase[] }) {
  const { currentPage, totalPages, loadCases } = useMedicalStore();
  const pageSize = 10;
  
  const setCurrentPage = (page: number) => {
    loadCases({ page, limit: pageSize });
  }

  // Paginate is now handled by the backend! So records are ALREADY paginated.
  // We can just render records directly.
  const paginatedRecords = records;
  const startIdx = (currentPage - 1) * pageSize;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-teal-500/5 dark:bg-teal-500/10 text-[13px] font-semibold uppercase tracking-[0.05em] text-teal-800 dark:text-teal-400">
            <tr className="border-b-2 border-teal-500/10 dark:border-teal-500/20">
              <th className="px-6 py-3 text-right">الشخص</th>
              <th className="px-6 py-3 text-right">المساعدة</th>
              <th className="px-6 py-3 text-right">المبلغ</th>
              <th className="px-6 py-3 text-right">الاستحقاق</th>
              <th className="px-6 py-3 text-right">الحالة</th>
              <th className="px-6 py-3 text-right">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((record: MedicalCase) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center justify-end">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">{record.personName}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {record.conditionName || "بدون سجل"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={record.isCritical ? 'حالة حرجة' : 'عادية'}
                      color={record.isCritical ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-700 dark:text-green-500">
                    {record.estimatedMonthlyCost ? `${record.estimatedMonthlyCost} ج.م` : 'غير محدد'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={record.assistanceType || 'غير محدد'}
                      color="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300"
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={record.isActive ? 'نشط' : 'مغلق'}
                      color={record.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                    {record.createdAt ? new Date(record.createdAt).toLocaleDateString('ar-EG') : ''}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                  لم يتم العثور على سجلات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
        <div className="text-sm text-gray-600 dark:text-slate-400">
          عرض {startIdx + 1}-{Math.min(startIdx + pageSize, records.length)} من{" "}
          {records.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/dashboard/search-filters.tsx -->
``tsx
"use client";

import { Search, X } from "lucide-react";
import { useDashboardFiltersStore } from "@/lib/medical/store";
import type { AidType, EligibilityLevel } from "@/types/medical";
import { getAidTypeLabel, getEligibilityLabel, getStatusLabel } from "@/lib/medical/utils";

export function SearchFilters() {
  const {
    filters,
    setSearch,
    setStatus,
    setAidType,
    setEligibilityLevel,
    resetFilters,
  } = useDashboardFiltersStore();

  const aidTypes: AidType[] = ["cash_aid", "medical_fees", "medical_supplies", "food_packages", "housing_support"];
  const statuses: ("pending" | "approved" | "disbursed" | "rejected")[] = ["pending", "approved", "disbursed", "rejected"];
  const eligibilityLevels: EligibilityLevel[] = ["fully_eligible", "partial_eligible", "not_eligible", "pending"];

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.aidType ||
    filters.eligibilityLevel;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="ابحث عن اسم أو رقم..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() =>
              setStatus(filters.status === status ? undefined : status)
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === status
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Aid Type Filter */}
      <div className="flex flex-wrap gap-2">
        {aidTypes.map((type) => (
          <button
            key={type}
            onClick={() =>
              setAidType(filters.aidType === type ? undefined : type)
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.aidType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getAidTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Eligibility Filter */}
      <div className="flex flex-wrap gap-2">
        {eligibilityLevels.map((level) => (
          <button
            key={level}
            onClick={() =>
              setEligibilityLevel(
                filters.eligibilityLevel === level ? undefined : level
              )
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.eligibilityLevel === level
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getEligibilityLabel(level)}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
        >
          <X className="w-4 h-4" />
          مسح الفلاتر
        </button>
      )}
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/dashboard/warning-banner.tsx -->
``tsx
"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function WarningBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900">تنبيه مهم</h3>
        <p className="text-sm text-amber-800 mt-1">
          يرجى التحقق من جميع البيانات قبل الموافقة على المساعدات. جميع المعلومات سيتم حفظها في نظام السجلات.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-amber-600 hover:text-amber-800 flex-shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/MedicalPage.tsx -->
``tsx
"use client";

import { useState, useEffect } from "react";
import { useMedicalStore } from "../../lib/stores/medicalStore";
import { useMedicalModalStore } from "../../lib/stores/medicalModalStore";
import { MedicalRecordsTable } from "./dashboard/records-table";
import { AddRecordModal } from "./modals/add-record-modal";
import {
  Activity,
  AlertTriangle,
  Banknote,
  FileText,
  History,
  LayoutDashboard,
  PieChart,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MedicalPage() {
  const { loadCases, loadKpis, isLoading, error, kpis, cases } = useMedicalStore();
  const openModal = useMedicalModalStore((state) => state.openModal);

  const [filterCritical, setFilterCritical] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadKpis();
    loadCases();
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    loadCases({ search: q, criticalOnly: filterCritical });
  };

  if (isLoading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">جاري تحميل السجلات الطبية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8 border border-red-100">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-bold mb-2">حدث خطأ</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12">
      {/* 
        PREMIUM HEADER SECTION 
        Uses a subtle gradient and a pattern overlay for a high-end feel.
      */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 pt-16 pb-24 overflow-hidden shadow-lg">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-sm font-medium backdrop-blur-md">
                <Activity className="w-4 h-4" />
                <span>إدارة القطاع الطبي</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                السجلات الطبية والاعانات
              </h1>
              <p className="text-emerald-100/80 text-lg max-w-xl leading-relaxed">
                متابعة دقيقة وشاملة للحالات المرضية، إدارة الاستقطاعات، وتحليل المصروفات الطبية لضمان تقديم الرعاية الأمثل للمستفيدين.
              </p>
            </div>

            <button
              onClick={openModal}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-900 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] font-bold text-base overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-90" />
              <span className="relative z-10">إضافة سجل طبي جديد</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Cases */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي السجلات الطبية</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{kpis?.totalCases || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Critical Cases */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">حالات حرجة ومزمنة</p>
                  <p className="text-3xl font-bold text-rose-600 dark:text-rose-500">{kpis?.criticalCases || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50 shadow-inner">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Monthly Estimate */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">التكلفة الشهرية المقدرة</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{kpis?.monthlyEstimate || 0}</p>
                    <span className="text-sm text-emerald-600/70 dark:text-emerald-500/70 font-semibold">ج.م</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
                  <Banknote className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Active Treatments */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجراءات قيد التنفيذ</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">0</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50 shadow-inner">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN CONTENT TABS */}
        <Tabs defaultValue="active-cases" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-1 rounded-xl shadow-sm inline-flex">
            <TabsTrigger 
              value="active-cases" 
              className="rounded-lg px-6 py-2.5 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4 ml-2 inline-block" />
              السجلات النشطة
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-lg px-6 py-2.5 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
            >
              <History className="w-4 h-4 ml-2 inline-block" />
              تاريخ الصرف الطبي
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-lg px-6 py-2.5 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
            >
              <PieChart className="w-4 h-4 ml-2 inline-block" />
              تحليلات وإحصائيات
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ACTIVE CASES */}
          <TabsContent value="active-cases" className="outline-none">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">قائمة الحالات</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                      إدارة والبحث في سجلات المستفيدين الطبية.
                    </CardDescription>
                  </div>
                  <div className="w-72">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث بالاسم، المرض، أو رقم الأسرة..."
                        className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                      <svg
                        className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <MedicalRecordsTable records={cases} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: DISBURSEMENT HISTORY */}
          <TabsContent value="history" className="outline-none">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/95 dark:bg-slate-900/95 p-12 text-center">
              <History className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">سجل الصرف الطبي</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                هذه الشاشة ستعرض جميع عمليات الصرف والمساعدات الطبية السابقة التي تم تقديمها. سيتم تفعيلها قريباً.
              </p>
            </Card>
          </TabsContent>

          {/* TAB 3: ANALYTICS */}
          <TabsContent value="analytics" className="outline-none">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/95 dark:bg-slate-900/95 p-12 text-center">
              <PieChart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">التحليلات الطبية</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                مؤشرات أداء الرعاية الصحية وتوزيع الأمراض والتكاليف سيتم عرضها هنا في تحديث قادم.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddRecordModal />
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/MedicalSummaryWidget.tsx -->
``tsx
import { useState, useEffect } from "react";
import { medicalApi } from "../../lib/api/medical-api";
import type { MedicalSummary } from "../../types/medical";

export function MedicalSummaryWidget({ householdId }: { householdId: string }) {
  const [summary, setSummary] = useState<MedicalSummary | null>(null);

  useEffect(() => {
    if (!householdId) return;
    medicalApi.getMedicalSummary(householdId)
      .then(setSummary)
      .catch(() => {});
  }, [householdId]);

  if (!summary) return <div className="animate-pulse h-40 bg-slate-100 rounded-xl" />;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-emerald-800">الملخص الطبي</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">إجمالي الصرفيات</p>
          <p className="text-xl font-bold">{summary.amounts.total} ج.م</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">حالات صرف تحت المراجعة</p>
          <p className="text-xl font-bold">{summary.hasUnverifiedDisbursements ? 'يوجد' : 'لا يوجد'}</p>
        </div>
      </div>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/modals/add-record-modal.tsx -->
``tsx
"use client";

import { X } from "lucide-react";
import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";
import { Step1HouseholdPerson } from "./step1-household-person";
import { Step2MedicalData } from "./step2-medical-data";
import { Step3AidSelection } from "./step3-aid-selection";

export function AddRecordModal() {
  const { isModalOpen, closeModal, currentStep } = useMedicalModalStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <button
            onClick={closeModal}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">إضافة سجل طبي جديد</h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-b border-gray-200">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? "bg-green-600 text-white"
                    : step < currentStep
                    ? "bg-green-200 text-green-800"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className="w-8 h-1 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 border-b border-gray-200 text-center text-sm font-medium text-gray-700">
          <div>الأسرة والشخص</div>
          <div>البيانات الطبية</div>
          <div>المساعدة</div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {currentStep === 1 && <Step1HouseholdPerson />}
          {currentStep === 2 && <Step2MedicalData />}
          {currentStep === 3 && <Step3AidSelection />}
        </div>
      </div>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/modals/step1-household-person.tsx -->
``tsx
"use client";

import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";
import { AgeCircle } from "../shared/age-circle";
import { Badge } from "../shared/badge";
import { useState, useEffect } from "react";
import client from "../../../lib/api/client";

export function Step1HouseholdPerson() {
  const {
    selectedHousehold,
    setSelectedHousehold,
    selectedPerson,
    setSelectedPerson,
    nextStep,
  } = useMedicalModalStore();

  const [households, setHouseholds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    client.get('/households?limit=100')
      .then(r => setHouseholds(r.data.data.households ?? r.data.data))
      .catch(() => {})
  }, []);

  const handleNextStep = () => {
    if (selectedHousehold && selectedPerson) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">اختر الأسرة</h3>
          <input
            type="text"
            placeholder="ابحث برقم الملف أو اسم رب الأسرة..."
            className="w-1/2 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {households
            .filter((h) => 
              h.name?.includes(searchQuery) || 
              h.householdHead?.includes(searchQuery) ||
              h.code?.includes(searchQuery)
            )
            .map((household) => (
            <button
              key={household.id}
              onClick={() => {
                setSelectedHousehold(household);
                setSelectedPerson(null);
              }}
              className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                selectedHousehold?.id === household.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{household.name} {household.code ? `(${household.code})` : ''}</p>
                  <p className="text-sm text-gray-600">رب الأسرة: {household.householdHead}</p>
                  <p className="text-xs text-gray-500 mt-1">عدد الأفراد: {household.size}</p>
                </div>
              </div>
            </button>
          ))}
          {households.length > 0 && households.filter((h) => h.name?.includes(searchQuery) || h.householdHead?.includes(searchQuery) || h.code?.includes(searchQuery)).length === 0 && (
             <p className="text-center text-gray-500 py-4 text-sm">لا توجد أسر مطابقة للبحث</p>
          )}
        </div>
      </div>

      {selectedHousehold && (
        <div>
          <h3 className="font-semibold mb-3">اختر الشخص</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(selectedHousehold.persons || selectedHousehold.members || []).map((person: any) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                  selectedPerson?.id === person.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex gap-3 items-start">
                  <AgeCircle age={person.age} size="md" />
                  <div className="flex-1">
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.relationship}</p>
                    {person.medicalCondition && (
                      <Badge
                        label={person.medicalCondition}
                        color="bg-blue-100 text-blue-800 border-blue-300"
                        size="sm"
                      />
                    )}
                    {person.disability && (
                      <Badge
                        label="معاق"
                        color="bg-red-100 text-red-800 border-red-300"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleNextStep}
        disabled={!selectedHousehold || !selectedPerson}
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
      >
        التالي
      </button>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/modals/step2-medical-data.tsx -->
``tsx
"use client";

import { useEffect, useMemo } from "react";
import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";

const DISEASE_WEIGHTS = {
  TREATMENT: { NONE: 0.0, PERIODIC_CHEAP: 0.2, PERIODIC_EXPENSIVE: 0.4, VERY_EXPENSIVE: 0.6 },
  FOLLOWUP: { NONE_OR_RARE: 0.0, REGULAR: 0.3, EXPENSIVE: 0.5 },
  WORK_IMPACT: { NONE: 0.0, MINOR: 0.2, MAJOR_WORKS: 0.4, CANNOT_WORK: 0.6 },
} as const;

const MAX_SCORE = 1.7;

const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export function Step2MedicalData() {
  const {
    selectedPerson,
    medicalCondition,
    setMedicalCondition,
    medicalNotes,
    setMedicalNotes,
    treatmentCost,
    setTreatmentCost,
    followup,
    setFollowup,
    workImpact,
    setWorkImpact,
    setSeverity,
    nextStep,
    prevStep,
  } = useMedicalModalStore();

  const handleNextStep = () => {
    if (selectedPerson && medicalCondition) {
      nextStep();
    }
  };

  // Calculate score based on weights
  const score = useMemo(() => {
    const tScore = DISEASE_WEIGHTS.TREATMENT[treatmentCost as keyof typeof DISEASE_WEIGHTS.TREATMENT] || 0;
    const fScore = DISEASE_WEIGHTS.FOLLOWUP[followup as keyof typeof DISEASE_WEIGHTS.FOLLOWUP] || 0;
    const wScore = DISEASE_WEIGHTS.WORK_IMPACT[workImpact as keyof typeof DISEASE_WEIGHTS.WORK_IMPACT] || 0;
    return tScore + fScore + wScore;
  }, [treatmentCost, followup, workImpact]);

  const percentage = Math.min(100, Math.max(0, (score / MAX_SCORE) * 100));
  const isCritical = percentage >= 50;

  useEffect(() => {
    setSeverity(isCritical ? "severe" : "mild");
  }, [isCritical, setSeverity]);

  const progressColor =
    percentage < 30 ? "#3b82f6" : percentage < 50 ? "#f59e0b" : percentage < 80 ? "#ef4444" : "#9f1239";
  const severityText = isCritical ? "حالة حرجة (أولوية واستثناء)" : "حالة عادية";
  const severityColor = isCritical ? "text-red-600 bg-red-50 border-red-200" : "text-blue-600 bg-blue-50 border-blue-200";

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-6">
        <CircularProgress percentage={percentage} color={progressColor} />
        <div className="flex-1 text-center md:text-right">
          <h3 className="text-lg font-bold text-slate-800 mb-1">تقييم شدة المرض</h3>
          <p className="text-sm text-slate-500 mb-3">
            يتم حساب التقييم بناءً على تكلفة العلاج وتأثير المرض على العمل ومدى الحاجة لمتابعة مستمرة.
          </p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${severityColor}`}>
            {severityText}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700">التشخيص أو الحالة الطبية</label>
        <input
          type="text"
          value={medicalCondition}
          onChange={(e) => setMedicalCondition(e.target.value)}
          placeholder="مثال: السكري، ارتفاع ضغط الدم، فشل كلوي..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">تكلفة العلاج الشهري</label>
          <select
            value={treatmentCost}
            onChange={(e) => setTreatmentCost(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
          >
            <option value="NONE">لا يوجد / مجاني</option>
            <option value="PERIODIC_CHEAP">تكلفة بسيطة دورية</option>
            <option value="PERIODIC_EXPENSIVE">مكلف دورياً</option>
            <option value="VERY_EXPENSIVE">مكلف جداً / مستمر</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">المتابعة الطبية</label>
          <select
            value={followup}
            onChange={(e) => setFollowup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
          >
            <option value="NONE_OR_RARE">نادرة أو لا يوجد</option>
            <option value="REGULAR">متابعة دورية منتظمة</option>
            <option value="EXPENSIVE">متابعة مكلفة ومكثفة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">تأثيره على العمل</label>
          <select
            value={workImpact}
            onChange={(e) => setWorkImpact(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
          >
            <option value="NONE">لا تأثير مباشر</option>
            <option value="MINOR">تأثير طفيف (محدود)</option>
            <option value="MAJOR_WORKS">تأثير كبير (لكن يعمل)</option>
            <option value="CANNOT_WORK">يعيقه عن العمل تماماً</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700">ملاحظات إضافية (اختياري)</label>
        <textarea
          value={medicalNotes}
          onChange={(e) => setMedicalNotes(e.target.value)}
          placeholder="أي معلومات إضافية عن الحالة الطبية..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={prevStep}
          className="flex-1 bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          رجوع للأسرة
        </button>
        <button
          onClick={handleNextStep}
          disabled={!medicalCondition}
          className="flex-[2] bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors shadow-md"
        >
          متابعة لتحديد الإجراء الطبي
        </button>
      </div>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/modals/step3-aid-selection.tsx -->
``tsx
"use client";

import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";
import { formatCurrency } from "@/lib/medical/utils";
import { AidTypeGrid } from "../shared/aid-type-grid";
import { EligibilityPanel } from "../shared/eligibility-panel";

import { useState, useEffect } from "react";
import { medicalApi } from "../../../lib/api/medical-api";
import { toast } from "sonner";

export function Step3AidSelection() {
  const {
    selectedPerson,
    selectedHousehold,
    medicalCondition,
    severity,
    medicalNotes,
    aidType,
    setAidType,
    amount,
    setAmount,
    aidNotes,
    setAidNotes,
    prevStep,
    closeModal,
  } = useMedicalModalStore();

  const [eligibility, setEligibility] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedHousehold || !aidType) return;
    medicalApi.checkEligibility(selectedHousehold.id, aidType, selectedPerson?.id)
      .then(setEligibility)
      .catch(() => {});
  }, [selectedHousehold?.id, aidType, selectedPerson?.id]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      let caseId: string | undefined;
      if (medicalCondition) {
        const newCase = await medicalApi.createCase({
          householdId: selectedHousehold!.id,
          personId: selectedPerson!.id,
          conditionName: medicalCondition,
          isCritical: severity === 'severe',
          isActive: true,
          notes: medicalNotes,
        });
        caseId = newCase.id;
      }

      const result = await medicalApi.createDisbursement({
        householdId: selectedHousehold!.id,
        personId: selectedPerson!.id,
        medicalCaseId: caseId,
        aidType: aidType!,
        amount,
        disbursementDate: new Date().toISOString(),
        notes: aidNotes,
      });

      if (result.amountWarning) {
        toast.error(result.amountWarning); // Or toast.warning if available
      } else {
        toast.success('تم حفظ السجل الطبي بنجاح');
      }

      closeModal();
      
      // Refresh the table and KPIs
      import("../../../lib/stores/medicalStore").then(module => {
        module.useMedicalStore.getState().loadCases();
        module.useMedicalStore.getState().loadKpis();
      });
      
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'حدث خطأ أثناء الحفظ';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedPerson || !selectedHousehold) {
    return <div>خطأ: لم يتم اختيار شخص أو أسرة</div>;
  }

  return (
    <div className="space-y-6">
      <EligibilityPanel
        eligibilityLevel={eligibility?.eligibilityLevel || 'pending'}
        personName={selectedPerson.name}
        personAge={selectedPerson.age}
      />

      <div>
        <label className="block text-sm font-semibold mb-3">الإجراء الطبي المطلوب</label>
        <p className="text-xs text-gray-500 mb-3">هذا الإجراء خاضع لمراجعة واعتماد اللجنة الطبية بناءً على الأهلية الموضحة أعلاه.</p>
        <AidTypeGrid selectedAidType={aidType} onSelect={setAidType} />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">التكلفة التقديرية (ج.م)</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
          />
          {amount > 0 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-right text-sm text-blue-800">
              المبلغ الإجمالي: {formatCurrency(amount)}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">ملاحظات إضافية</label>
        <textarea
          value={aidNotes}
          onChange={(e) => setAidNotes(e.target.value)}
          placeholder="أي ملاحظات على المساعدة..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-400 transition-colors"
        >
          السابق
        </button>
        <button
          onClick={handleSubmit}
          disabled={!aidType || amount <= 0 || submitting}
          className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
        >
          {submitting ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </div>
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/shared/age-circle.tsx -->
``tsx
"use client";

import { getAgeCircleColor, getAgeGroupLabel } from "@/lib/medical/utils";

interface AgeCircleProps {
  age: number;
  size?: "sm" | "md" | "lg";
}

export function AgeCircle({ age, size = "md" }: AgeCircleProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm font-medium",
    lg: "w-12 h-12 text-base font-semibold",
  };

  const colorClass = getAgeCircleColor(age);
  const label = getAgeGroupLabel(age);

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center`} title={`${age} سنة - ${label}`}>
      {age}
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/shared/aid-type-grid.tsx -->
``tsx
"use client";

import { getAidTypeLabel } from "@/lib/medical/utils";
import type { AidType } from "@/types/medical";

const AID_TYPES: AidType[] = ["TREATMENT", "LAB_TEST", "IMAGING", "CONSULTATION", "SURGERY", "MEDICATION", "EQUIPMENT", "FINANCIAL_AID", "MARRIAGE_AID"] as any[];

interface AidTypeGridProps {
  selectedAidType: AidType | null;
  onSelect: (type: AidType) => void;
}

export function AidTypeGrid({ selectedAidType, onSelect }: AidTypeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {AID_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`p-4 rounded-lg border-2 font-medium transition-all text-right ${
            selectedAidType === type
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          {getAidTypeLabel(type)}
        </button>
      ))}
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/shared/badge.tsx -->
``tsx
"use client";

interface BadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Badge({ label, color, size = "md", icon }: BadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <div className={`${sizeClasses[size]} ${color} rounded-md border inline-flex items-center gap-1.5 font-medium`}>
      {icon}
      {label}
    </div>
  );
}
````

<!-- SOURCE: frontend/components/medical/shared/combobox.tsx -->
``tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "اختر...",
  emptyText = "لم يتم العثور على خيارات",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
````

<!-- SOURCE: frontend/components/medical/shared/eligibility-panel.tsx -->
``tsx
"use client";

import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getEligibilityColor, getEligibilityLabel } from "@/lib/medical/utils";
import type { EligibilityLevel } from "@/types/medical";
import { Badge } from "./badge";

interface EligibilityPanelProps {
  eligibilityLevel: EligibilityLevel;
  personName: string;
  personAge: number;
}

export function EligibilityPanel({
  eligibilityLevel,
  personName,
  personAge,
}: EligibilityPanelProps) {
  const getIcon = () => {
    switch (eligibilityLevel) {
      case "fully_eligible":
        return <CheckCircle2 className="w-5 h-5" />;
      case "partial_eligible":
        return <AlertCircle className="w-5 h-5" />;
      case "not_eligible":
        return <XCircle className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getEligibilityColor(eligibilityLevel)}`}>
      <div className="flex items-center gap-3 mb-2">
        {getIcon()}
        <h3 className="font-semibold">نتيجة التقييم</h3>
      </div>
      <p className="text-sm mb-3 leading-relaxed">
        {personName} ({personAge} سنة) - <strong>{getEligibilityLabel(eligibilityLevel)}</strong>
      </p>
      <Badge
        label={getEligibilityLabel(eligibilityLevel)}
        color={getEligibilityColor(eligibilityLevel)}
        size="sm"
      />
    </div>
  );
}
````

<!-- SOURCE: frontend/app/[locale]/dashboard/medical/page.tsx -->
``tsx
import { MedicalPage } from '../../../../components/medical/MedicalPage'

export default function MedicalPageRoute() {
  return <MedicalPage />
}

export const metadata = {
  title: 'السجلات الطبية والاعانات — CharityHub',
}
````

<!-- SOURCE: frontend/components/family-profile/medical-tab.tsx -->
[NOT FOUND: frontend/components/family-profile/medical-tab.tsx]

<!-- SOURCE: frontend/lib/api/medical-api.ts -->
``ts
import client from './client'
import type {
  MedicalCase, MedicalDisbursement, EligibilityResult, MedicalSummary
} from '../../types/medical'

// ─── Types لـ API responses ───────────────────────────────

interface PaginatedCases {
  cases: MedicalCase[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface MedicalKpis {
  totalCases: number
  criticalCases: number
  monthlyEstimate: number
}

interface CreateDisbursementResponse {
  disbursement: MedicalDisbursement
  eligibilityResult: EligibilityResult
  amountWarning: string | null
}

// ─── Helper: تحويل Decimal string → number ───────────────
// Prisma يرجع Decimal كـ string — نحوّلها
function parseDecimal(val: unknown): number {
  if (val === null || val === undefined) return 0
  return parseFloat(String(val)) || 0
}

function normalizeCaseFromApi(raw: Record<string, unknown>): MedicalCase {
  const latestScore = (raw.household as Record<string, unknown[]> | undefined)
    ?.scoreResults?.[0] as Record<string, unknown> | undefined

  return {
    id: raw.id as string,
    householdId: raw.householdId as string,
    personId: raw.personId as string,
    personName: (raw.person as { name: string } | undefined)?.name ?? '',
    personGender: (raw.person as { gender: string } | undefined)?.gender as 'MALE' | 'FEMALE' ?? 'MALE',
    personBirthDate: (raw.person as { birthDate: string } | undefined)?.birthDate ?? '',
    householdCode: (raw.household as { code: string } | undefined)?.code ?? '',
    headName: '',   // يُملأ من الأسرة — يمكن إضافته في الباك إند لو احتجت
    assistanceType: latestScore?.assistanceType as any,
    normalizedPercent: parseDecimal(latestScore?.normalizedPercent),
    conditionName: raw.conditionName as string,
    isCritical: raw.isCritical as boolean,
    isActive: raw.isActive as boolean,
    estimatedMonthlyCost: raw.estimatedMonthlyCost
      ? parseDecimal(raw.estimatedMonthlyCost)
      : undefined,
    doctorName: raw.doctorName as string | undefined,
    hospitalName: raw.hospitalName as string | undefined,
    startDate: raw.startDate as string | undefined,
    notes: raw.notes as string | undefined,
    disbursements: ((raw.disbursements as unknown[]) ?? []).map(normalizeDisbursementFromApi),
    lastDisbursementDate: (raw.disbursements as Record<string, unknown>[])?.[0]?.disbursementDate as string | undefined,
    createdAt: raw.createdAt as string,
  }
}

function normalizeDisbursementFromApi(raw: unknown): MedicalDisbursement {
  const d = raw as Record<string, unknown>
  return {
    id: d.id as string,
    householdId: d.householdId as string,
    personId: d.personId as string,
    personName: (d.person as { name: string } | undefined)?.name ?? '',
    medicalCaseId: d.medicalCaseId as string | undefined,
    aidType: d.aidType as MedicalDisbursement['aidType'],
    amount: parseDecimal(d.amount),
    totalCost: d.totalCost ? parseDecimal(d.totalCost) : undefined,
    coveragePercent: d.coveragePercent ? parseDecimal(d.coveragePercent) : undefined,
    isCriticalOverride: d.isCriticalOverride as boolean,
    isRetroactive: d.isRetroactive as boolean,
    disbursementDate: d.disbursementDate as string,
    status: d.status as MedicalDisbursement['status'],
    approvedByName: (d.approvedBy as { name: string } | undefined)?.name,
    notes: d.notes as string | undefined,
    createdAt: d.createdAt as string,
  }
}

// ─── API Functions ────────────────────────────────────────

export const medicalApi = {

  // KPIs
  async getKpis(): Promise<MedicalKpis> {
    const res = await client.get('/medical-cases/kpis')
    return res.data.data
  },

  // List cases
  async listCases(params?: {
    search?: string
    criticalOnly?: boolean
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<PaginatedCases> {
    const res = await client.get('/medical-cases', { params })
    return {
      ...res.data.data,
      cases: res.data.data.cases.map(normalizeCaseFromApi),
    }
  },

  // Get case by ID
  async getCaseById(id: string): Promise<MedicalCase> {
    const res = await client.get(`/medical-cases/${id}`)
    return normalizeCaseFromApi(res.data.data)
  },

  // Get cases by household
  async getCasesByHousehold(householdId: string): Promise<MedicalCase[]> {
    const res = await client.get(`/medical-cases/household/${householdId}`)
    return res.data.data.map(normalizeCaseFromApi)
  },

  // Create case
  async createCase(data: Partial<MedicalCase>): Promise<MedicalCase> {
    const res = await client.post('/medical-cases', data)
    return normalizeCaseFromApi(res.data.data)
  },

  // Update case
  async updateCase(id: string, data: Partial<MedicalCase>): Promise<MedicalCase> {
    const res = await client.put(`/medical-cases/${id}`, data)
    return normalizeCaseFromApi(res.data.data)
  },

  // Delete case
  async deleteCase(id: string): Promise<void> {
    await client.delete(`/medical-cases/${id}`)
  },

  // Check eligibility
  async checkEligibility(
    householdId: string,
    aidType: string,
    personId?: string
  ): Promise<EligibilityResult> {
    const res = await client.get(`/medical-cases/eligibility/${householdId}`, {
      params: { aidType, personId }
    })
    const d = res.data.data
    return {
      ...d,
      appliedCap: d.appliedCap ? parseDecimal(d.appliedCap) : null,
      normalizedPercent: d.normalizedPercent ? parseDecimal(d.normalizedPercent) : null,
    }
  },

  // Create disbursement
  async createDisbursement(data: {
    householdId: string
    personId: string
    medicalCaseId?: string
    aidType: string
    amount: number
    totalCost?: number
    coveragePercent?: number
    isCritical?: boolean
    isRetroactive?: boolean
    disbursementDate?: string
    notes?: string
  }): Promise<CreateDisbursementResponse> {
    const res = await client.post('/medical-disbursements', data)
    return {
      disbursement: normalizeDisbursementFromApi(res.data.data.disbursement),
      eligibilityResult: res.data.data.eligibilityResult,
      amountWarning: res.data.data.amountWarning,
    }
  },

  // Get disbursements by household
  async getDisbursementsByHousehold(householdId: string): Promise<MedicalDisbursement[]> {
    const res = await client.get(`/medical-disbursements/household/${householdId}`)
    return res.data.data.map(normalizeDisbursementFromApi)
  },

  // Approve disbursement
  async approveDisbursement(id: string): Promise<MedicalDisbursement> {
    const res = await client.patch(`/medical-disbursements/${id}/approve`)
    return normalizeDisbursementFromApi(res.data.data)
  },

  // Pay disbursement
  async payDisbursement(id: string): Promise<MedicalDisbursement> {
    const res = await client.patch(`/medical-disbursements/${id}/pay`)
    return normalizeDisbursementFromApi(res.data.data)
  },

  // Reject disbursement
  async rejectDisbursement(id: string): Promise<MedicalDisbursement> {
    const res = await client.patch(`/medical-disbursements/${id}/reject`)
    return normalizeDisbursementFromApi(res.data.data)
  },

  // Medical summary (for evaluation tab)
  async getMedicalSummary(householdId: string): Promise<MedicalSummary> {
    const res = await client.get(`/medical-cases/summary/${householdId}`)
    const d = res.data.data
    // تحويل الأرقام من Prisma Decimal
    return {
      counts: d.counts,
      amounts: Object.fromEntries(
        Object.entries(d.amounts).map(([k, v]) => [k, parseDecimal(v)])
      ) as MedicalSummary['amounts'],
      hasUnverifiedDisbursements: d.hasUnverifiedDisbursements,
      lastDisbursementDate: d.lastDisbursementDate,
    }
  },
}
````

<!-- SOURCE: frontend/lib/stores/medicalStore.ts -->
``ts
import { create } from 'zustand'
import { medicalApi } from '../api/medical-api'
import type { MedicalCase, MedicalDisbursement } from '../../types/medical'

interface MedicalState {
  cases: MedicalCase[]
  selectedCase: MedicalCase | null
  isModalOpen: boolean
  isSheetOpen: boolean
  selectedHouseholdForSheet: string | null
  searchQuery: string
  filterAidType: string
  filterCriticalOnly: boolean
  
  isLoading: boolean
  error: string | null
  kpis: { totalCases: number; criticalCases: number; monthlyEstimate: number } | null
  totalPages: number
  currentPage: number

  // Actions
  setSelectedCase: (c: MedicalCase | null) => void
  openModal: (c?: MedicalCase) => void
  closeModal: () => void
  openSheet: (householdId: string) => void
  closeSheet: () => void
  setSearch: (q: string) => void
  setFilterAidType: (t: string) => void
  setFilterCritical: (v: boolean) => void
  addCase: (c: MedicalCase) => void
  addDisbursement: (caseId: string, d: MedicalDisbursement) => void

  loadCases: (params?: any) => Promise<void>
  loadKpis: () => Promise<void>
  refreshCase: (id: string) => Promise<void>
}

export const useMedicalStore = create<MedicalState>((set) => ({
  cases: [],
  kpis: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  selectedCase: null,
  isModalOpen: false,
  isSheetOpen: false,
  selectedHouseholdForSheet: null,
  searchQuery: '',
  filterAidType: '',
  filterCriticalOnly: false,
  
  setSelectedCase: (c) => set({ selectedCase: c }),
  openModal: (c) => set({ isModalOpen: true, selectedCase: c ?? null }),
  closeModal: () => set({ isModalOpen: false, selectedCase: null }),
  openSheet: (id) => set({ isSheetOpen: true, selectedHouseholdForSheet: id }),
  closeSheet: () => set({ isSheetOpen: false, selectedHouseholdForSheet: null }),
  setSearch: (q) => set({ searchQuery: q }),
  setFilterAidType: (t) => set({ filterAidType: t }),
  setFilterCritical: (v) => set({ filterCriticalOnly: v }),
  
  addCase: (c) => set((s) => ({ cases: [c, ...s.cases] })),
  addDisbursement: (caseId, d) => set((s) => ({
    cases: s.cases.map(c => c.id === caseId
      ? { ...c, disbursements: [d, ...(c.disbursements || [])], lastDisbursementDate: d.disbursementDate }
      : c)
  })),

  loadCases: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const result = await medicalApi.listCases(params)
      set({
        cases: result.cases,
        totalPages: result.totalPages,
        currentPage: result.page,
        isLoading: false,
      })
    } catch (err) {
      set({ error: 'تعذّر تحميل البيانات', isLoading: false })
    }
  },

  loadKpis: async () => {
    try {
      const kpis = await medicalApi.getKpis()
      set({ kpis })
    } catch (_) {}
  },

  refreshCase: async (id) => {
    const updated = await medicalApi.getCaseById(id)
    set(s => ({ cases: s.cases.map(c => c.id === id ? updated : c) }))
  },
}))
````

<!-- SOURCE: frontend/lib/stores/medicalModalStore.ts -->
``ts
import { create } from "zustand";
import type {
  AidType,
  EligibilityLevel,
  Household,
  Person,
} from "../../types/medical";

interface MedicalModalState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  currentStep: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;

  selectedHousehold: any | null;
  setSelectedHousehold: (household: any | null) => void;
  selectedPerson: any | null;
  setSelectedPerson: (person: any | null) => void;

  medicalCondition: string;
  setMedicalCondition: (condition: string) => void;
  severity: "mild" | "moderate" | "severe";
  setSeverity: (severity: "mild" | "moderate" | "severe") => void;
  medicalNotes: string;
  setMedicalNotes: (notes: string) => void;

  treatmentCost: string;
  setTreatmentCost: (v: string) => void;
  followup: string;
  setFollowup: (v: string) => void;
  workImpact: string;
  setWorkImpact: (v: string) => void;

  aidType: string | null;
  setAidType: (type: string | null) => void;
  amount: number;
  setAmount: (amount: number) => void;
  aidNotes: string;
  setAidNotes: (notes: string) => void;

  calculatedEligibility: string;
  setCalculatedEligibility: (level: string) => void;

  resetFormData: () => void;
}

export const useMedicalModalStore = create<MedicalModalState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () =>
    set({
      isModalOpen: false,
      currentStep: 1,
      selectedHousehold: null,
      selectedPerson: null,
      medicalCondition: "",
      severity: "mild",
      medicalNotes: "",
      treatmentCost: "NONE",
      followup: "NONE_OR_RARE",
      workImpact: "NONE",
      aidType: null,
      amount: 0,
      aidNotes: "",
      calculatedEligibility: "pending",
    }),

  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({
      currentStep: (state.currentStep + 1) as 1 | 2 | 3,
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as 1 | 2 | 3,
    })),
  resetSteps: () => set({ currentStep: 1 }),

  selectedHousehold: null,
  setSelectedHousehold: (household) => set({ selectedHousehold: household }),
  selectedPerson: null,
  setSelectedPerson: (person) => set({ selectedPerson: person }),

  medicalCondition: "",
  setMedicalCondition: (condition) => set({ medicalCondition: condition }),
  severity: "mild",
  setSeverity: (severity) => set({ severity }),
  setMedicalNotes: (notes) => set({ medicalNotes: notes }),

  treatmentCost: "NONE",
  setTreatmentCost: (v) => set({ treatmentCost: v }),
  followup: "NONE_OR_RARE",
  setFollowup: (v) => set({ followup: v }),
  workImpact: "NONE",
  setWorkImpact: (v) => set({ workImpact: v }),

  aidType: null,
  setAidType: (type) => set({ aidType: type }),
  amount: 0,
  setAmount: (amount) => set({ amount }),
  aidNotes: "",
  setAidNotes: (notes) => set({ aidNotes: notes }),

  calculatedEligibility: "pending",
  setCalculatedEligibility: (level) => set({ calculatedEligibility: level }),

  resetFormData: () =>
    set({
      selectedHousehold: null,
      selectedPerson: null,
      medicalCondition: "",
      severity: "mild",
      medicalNotes: "",
      treatmentCost: "NONE",
      followup: "NONE_OR_RARE",
      workImpact: "NONE",
      aidType: null,
      amount: 0,
      aidNotes: "",
      calculatedEligibility: "pending",
    }),
}));
````

<!-- SOURCE: frontend/lib/medical/utils.ts -->
``ts
import { MedicalRecord, EligibilityCheck, EligibilityStatus } from '@/types/medical'

const MONTHLY_LIMIT = 800 // الحد الأقصى للصرف الشهري
const SEASONAL_LIMIT = 400 // الحد الأقصى للصرف الموسمي
const CRITICAL_DISEASES = ['السرطان', 'أمراض القلب المزمنة', 'الفشل الكلوي', 'السكتة الدماغية']

export function calculateEligibility(record: MedicalRecord): EligibilityCheck {
  const conditions: { label: string; passed: boolean }[] = []

  // التحقق من نوع المرض
  const isCritical = CRITICAL_DISEASES.some(disease => record.disease.includes(disease))
  conditions.push({
    label: 'نوع المرض',
    passed: true,
  })

  // التحقق من المبلغ بناءً على نوع الصرف
  let isAmountValid = false
  if (record.disbursementType === 'شهري') {
    isAmountValid = record.treatmentCost <= MONTHLY_LIMIT
  } else if (record.disbursementType === 'موسمي') {
    isAmountValid = record.treatmentCost <= SEASONAL_LIMIT
  } else if (record.disbursementType === 'زواج') {
    isAmountValid = true
  }

  conditions.push({
    label: `حد الصرف (${record.disbursementType})`,
    passed: isAmountValid,
  })

  // التحقق من تاريخ الصرف السابق
  let enoughTimeElapsed = true
  if (record.lastDisbursementDate) {
    const lastDate = new Date(record.lastDisbursementDate)
    const currentDate = new Date(record.recordDate)
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (record.disbursementType === 'شهري') {
      enoughTimeElapsed = daysDiff >= 25
    } else if (record.disbursementType === 'موسمي') {
      enoughTimeElapsed = daysDiff >= 90
    }
  }

  conditions.push({
    label: 'تجاوز فترة الصرف السابق',
    passed: enoughTimeElapsed || !record.lastDisbursementDate,
  })

  // تحديد الحالة
  let status: EligibilityStatus = 'مقبول'
  let reason = 'مستوفي جميع الشروط'

  if (isCritical && !isAmountValid) {
    status = 'استثناء'
    reason = 'حالة حرجة تتطلب استثناء - تجاوز الحد المسموح به'
  } else if (!isAmountValid && !isCritical) {
    status = 'مرفوض'
    reason = `المبلغ يتجاوز الحد المسموح به للصرف ${record.disbursementType}`
  } else if (!enoughTimeElapsed && record.lastDisbursementDate) {
    status = 'قيد_المراجعة'
    reason = 'لم تنقضِ فترة كافية منذ آخر صرف'
  }

  return {
    isEligible: status === 'مقبول' || status === 'استثناء',
    status,
    reason,
    conditions,
  }
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ج.م`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getStatusColor(status: EligibilityStatus): string {
  switch (status) {
    case 'مقبول':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'مرفوض':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'قيد_المراجعة':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'استثناء':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function getEligibilityColor(level: string): string {
  switch (level) {
    case 'eligible':
    case 'OK':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'warning':
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'blocked':
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function getEligibilityLabel(level: string): string {
  switch (level) {
    case 'eligible':
    case 'OK':
      return 'مستحق'
    case 'warning':
    case 'WARNING':
      return 'تحذير'
    case 'blocked':
    case 'BLOCKED':
      return 'ممنوع'
    default:
      return 'غير محدد'
  }
}

export function getAgeCircleColor(age: number): string {
  if (age < 18) return 'bg-blue-100 text-blue-800 border-blue-300'
  if (age > 60) return 'bg-purple-100 text-purple-800 border-purple-300'
  return 'bg-gray-100 text-gray-800 border-gray-300'
}

export function getAgeGroupLabel(age: number): string {
  if (age < 18) return 'طفل'
  if (age > 60) return 'مسن'
  return 'بالغ'
}

export function getAidTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'TREATMENT': return 'علاج'
    case 'LAB_TEST': return 'تحاليل'
    case 'IMAGING': return 'أشعة'
    case 'CONSULTATION': return 'كشف طبي'
    case 'SURGERY': return 'عملية جراحية'
    case 'MEDICATION': return 'أدوية'
    case 'EQUIPMENT': return 'أجهزة طبية'
    case 'FINANCIAL_AID': return 'مساعدة نقدية'
    case 'MARRIAGE_AID': return 'مساعدة زواج (استثناء)'
    default: return type || 'غير محدد'
  }
}

export function formatDateShort(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG');
}
````

<!-- SOURCE: frontend/types/medical.ts -->
``ts
export type EligibilityStatus = 'مقبول' | 'مرفوض' | 'قيد_المراجعة' | 'استثناء'

export type DisbursementType = 'شهري' | 'موسمي' | 'زواج'

export type RelationshipType = 'الزوج' | 'الزوجة' | 'ابن' | 'ابنة' | 'والد' | 'والدة' | 'أخ' | 'أخت' | 'أخرى'

export interface MedicalRecord {
  id: string
  recordNumber: string
  classification: string
  husbandName: string
  wifeName: string
  patientRelationship: RelationshipType
  patientName: string
  disease: string
  doctorName: string
  treatmentCost: number
  disbursementType: DisbursementType
  recordDate: string
  lastDisbursementDate?: string
  notes: string
  eligibilityStatus: EligibilityStatus
  eligibilityReason: string
  previousDisbursements: {
    date: string
    amount: number
    type: DisbursementType
  }[]
}

export interface EligibilityCheck {
  isEligible: boolean
  status: EligibilityStatus
  reason: string
  conditions: {
    label: string
    passed: boolean
  }[]
}
````

### Medical Records Answers
1. Old design: the earlier concept appears to have been a narrower category/monthly-treatment aid flow, referenced by legacy medical-module files and monthly medical assistance labels. It focused on treatment-type support rather than a full case + disbursement lifecycle.
2. New design: the current module separates medical cases from medical disbursements, supports multiple aid types, eligibility/cooldown/amount validation, KPI dashboard, case table, modal workflow, household medical summary widget, and approval/payment status transitions.
3. Prisma schema changes: `MedicalAidType`, `MedicalDisbursementStatus`, `MedicalCase`, `MedicalDisbursement`, and relation fields on `User`, `Household`, and `Person` support the rebuilt module. Blocks are copied below.
<!-- SOURCE: backend/prisma/schema.prisma#MedicalAidType -->
````prisma
enum MedicalAidType {
  TREATMENT     // علاج — cooldown عام 30/40 يوم، سقف 800/400
  LAB_TEST      // تحاليل — قيمة فعلية
  IMAGING       // أشعة — قيمة فعلية
  CONSULTATION  // كشف طبي — افتراضي 200 ج.م.، قابل للتعديل
  SURGERY       // عملية — % من التكلفة، موافقة مشرف دائماً
  FINANCIAL_AID // إعانة مادية
  MARRIAGE_AID  // إعانة زواج — مرة واحدة / شخص، سقف 70000
}
````

<!-- SOURCE: backend/prisma/schema.prisma#MedicalDisbursementStatus -->
````prisma
enum MedicalDisbursementStatus {
  PENDING   // انتظار توثيق المشرف
  APPROVED  // موافقة المشرف
  PAID      // تم الصرف
  REJECTED  // مرفوض
}
````

<!-- SOURCE: backend/prisma/schema.prisma#MedicalCase -->
````prisma
model MedicalCase {
  id                   String    @id @default(cuid())
  householdId          String
  personId             String
  conditionName        String
  isCritical           Boolean   @default(false)
  isActive             Boolean   @default(true)
  estimatedMonthlyCost Decimal?  @db.Decimal(10,2)
  doctorName           String?
  hospitalName         String?
  startDate            DateTime?
  notes                String?
  createdById          String
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  household     Household             @relation(fields: [householdId], references: [id], onDelete: Cascade)
  person        Person                @relation(fields: [personId], references: [id], onDelete: Cascade)
  createdBy     User                  @relation(fields: [createdById], references: [id])
  disbursements MedicalDisbursement[]

  @@index([householdId])
  @@index([personId])
}
````

<!-- SOURCE: backend/prisma/schema.prisma#MedicalDisbursement -->
````prisma
model MedicalDisbursement {
  id                String                  @id @default(cuid())
  householdId       String
  personId          String
  medicalCaseId     String?
  aidType           MedicalAidType
  amount            Decimal                 @db.Decimal(10,2)
  totalCost         Decimal?                @db.Decimal(10,2)
  coveragePercent   Decimal?                @db.Decimal(5,2)
  isCriticalOverride Boolean               @default(false)
  isRetroactive     Boolean                @default(false)
  disbursementDate  DateTime               @default(now())
  status            MedicalDisbursementStatus @default(PENDING)
  approvedById      String?
  approvedAt        DateTime?
  notes             String?
  createdById       String
  createdAt         DateTime               @default(now())

  household   Household    @relation(fields: [householdId], references: [id], onDelete: Cascade)
  person      Person       @relation(fields: [personId], references: [id])
  medicalCase MedicalCase? @relation(fields: [medicalCaseId], references: [id])
  approvedBy  User?        @relation("MedicalApprover", fields: [approvedById], references: [id])
  createdBy   User         @relation("MedicalCreator", fields: [createdById], references: [id])

  @@index([householdId])
  @@index([personId])
  @@index([disbursementDate])
  @@index([status])
}
````

Removed/renamed old medical models/fields: no separate old Prisma medical model was found in the extracted previous context; legacy standalone frontend `frontend/medical-module/*` files are deleted in git status and the module is now integrated into the main app.
4. New API endpoints are listed below.
| Method | Path | Module | Description | Min Role |
|---|---|---|---|---|
| GET | / | medical | GET  /api/medical-cases | Authenticated |
| GET | /kpis | medical | GET  /api/medical-cases/kpis | Authenticated |
| GET | /household/:householdId | medical | GET  /api/medical-cases/household/:householdId | Authenticated |
| POST | / | medical | POST /api/medical-cases | Authenticated |
| GET | /:id | medical | GET  /api/medical-cases/:id | Authenticated |
| PUT | /:id | medical | PUT  /api/medical-cases/:id | Authenticated |
| DELETE | /:id | medical | DELETE /api/medical-cases/:id | Authenticated |
| GET | /eligibility/:householdId | medical | GET  /api/medical-cases/eligibility/:householdId?aidType=TREATMENT&personId=xxx | Authenticated |
| GET | /summary/:householdId | medical | GET  /api/medical-cases/summary/:householdId | Authenticated |
| POST | / | medical | POST /api/medical-disbursements | Authenticated |
| GET | /household/:householdId | medical | GET  /api/medical-disbursements/household/:householdId | Authenticated |
| PATCH | /:id/approve | medical | PATCH /api/medical-disbursements/:id/approve | Authenticated |
| PATCH | /:id/pay | medical | PATCH /api/medical-disbursements/:id/pay | Authenticated |
| PATCH | /:id/reject | medical | PATCH /api/medical-disbursements/:id/reject | Authenticated |
| GET | /:householdId/medical-summary | medical | GET /api/households/:householdId/medical-summary | Authenticated |

5. New frontend pages/components: copied above from `frontend/app/[locale]/dashboard/medical`, `frontend/components/medical`, medical stores, API client, utils, and types.
6. Relation to scoring: existing scoring DTO/repository references medical cases, but the rebuilt medical module mostly runs as a separate records/disbursement track; health scoring still comes from health/disability inputs unless scoring code explicitly maps medical cases.
7. Relation to disbursement: medical disbursements are a separate aid track with their own status lifecycle; the broader monthly disbursement module is included in Section 5.
8. Medical-related migrations are summarized and copied below.
| Migration File | Date | Summary |
|---|---|---|
| backend/prisma/migrations/20260509174619_charityhub_finance_ops/migration.sql | 20260509174619 | CREATE TABLE x2; ALTER TABLE x5; CREATE TYPE x7; CREATE INDEX x9; CREATE UNIQUE INDEX x1 |
| backend/prisma/migrations/add_notifications.sql | manual/unversioned | CREATE TABLE x1; ALTER TABLE x1; CREATE INDEX x2 |
| backend/prisma/migrations/pending.sql | manual/unversioned | SQL changes present; inspect copied migration |

<!-- SOURCE: backend/prisma/migrations/20260509174619_charityhub_finance_ops/migration.sql -->
``sql
-- CreateEnum
CREATE TYPE "AssistanceWorkflowStatus" AS ENUM ('REQUESTED', 'APPROVED', 'COMMITTED', 'DISBURSED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DonationCategory" AS ENUM ('CASH', 'MEDICAL', 'FOOD', 'EDUCATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "DonationAllocationStatus" AS ENUM ('UNALLOCATED', 'PARTIAL', 'FULLY_ALLOCATED');

-- CreateEnum
CREATE TYPE "DonationRecurrence" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('FINANCE', 'MEDICAL', 'FIELD_RESEARCH', 'SCORING', 'OPERATIONAL');

-- AlterTable
ALTER TABLE "assistances" ADD COLUMN     "approval_chain" JSONB,
ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "impact_note" TEXT,
ADD COLUMN     "workflow_status" "AssistanceWorkflowStatus" NOT NULL DEFAULT 'DISBURSED';

-- AlterTable
ALTER TABLE "families" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "donations" (
    "id" UUID NOT NULL,
    "source_display" TEXT,
    "donor_ref_code" TEXT,
    "category" "DonationCategory" NOT NULL DEFAULT 'GENERAL',
    "recurrence" "DonationRecurrence" NOT NULL DEFAULT 'ONE_TIME',
    "amount" DECIMAL(14,2) NOT NULL,
    "allocation_status" "DonationAllocationStatus" NOT NULL DEFAULT 'UNALLOCATED',
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "earmark_family_id" UUID,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_alerts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "category" "AlertCategory" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "family_id" UUID,
    "source_ref" TEXT,
    "acknowledged_by" UUID,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_donor_ref_code_key" ON "donations"("donor_ref_code");

-- CreateIndex
CREATE INDEX "donations_received_at_idx" ON "donations"("received_at");

-- CreateIndex
CREATE INDEX "donations_category_idx" ON "donations"("category");

-- CreateIndex
CREATE INDEX "donations_allocation_status_idx" ON "donations"("allocation_status");

-- CreateIndex
CREATE INDEX "donations_earmark_family_id_idx" ON "donations"("earmark_family_id");

-- CreateIndex
CREATE INDEX "operational_alerts_status_severity_idx" ON "operational_alerts"("status", "severity");

-- CreateIndex
CREATE INDEX "operational_alerts_category_idx" ON "operational_alerts"("category");

-- CreateIndex
CREATE INDEX "operational_alerts_created_at_idx" ON "operational_alerts"("created_at");

-- CreateIndex
CREATE INDEX "operational_alerts_family_id_idx" ON "operational_alerts"("family_id");

-- CreateIndex
CREATE INDEX "families_deleted_at_idx" ON "families"("deleted_at");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_earmark_family_id_fkey" FOREIGN KEY ("earmark_family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_acknowledged_by_fkey" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
````

<!-- SOURCE: backend/prisma/migrations/add_notifications.sql -->
``sql
-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

````

<!-- SOURCE: backend/prisma/migrations/pending.sql -->
``sql
node.exe : Error: You must pass the --shadow-database-url if you want to diff a migrations directory.
At line:1 char:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (Error: You must...ions directory.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 


````

9. Medical i18n keys/files copied below.
### Relevant i18n Keys - Medical
<!-- SOURCE: frontend/messages/ar/common.json -->
``json
{
  "app_name": "إدارة العمل الخيري",
  "search_placeholder": "بحث...",
  "filters": "تصفية النتائج",
  "actions": {
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "save": "حفظ",
    "cancel": "إلغاء",
    "view": "عرض",
    "confirm": "تأكيد"
  },
  "states": {
    "loading": "جاري التحميل...",
    "error": "حدث خطأ غير متوقع",
    "no_data": "لا توجد بيانات متاحة",
    "not_found": "العنصر المطلوب غير موجود"
  },
  "nav": {
    "dashboard": "لوحة التحكم",
    "households": "الأسر المستهدفة",
    "medical": "السجلات الطبية والاعانات",
    "education": "التعليم",
    "disbursement": "القبض الشهري",
    "volunteers": "المتطوعون",
    "analytics": "التحليلات",
    "verification": "مركز التوثيق",
    "ruleEditor": "إدارة القواعد",
    "auditLog": "سجل التدقيق",
    "reports": "التقارير",
    "users": "المستخدمين والصلاحيات",
    "groups": {
      "main": "الرئيسية",
      "management": "الإدارة",
      "system": "النظام"
    }
  },
  "sidebar": {
    "dashboard": "لوحة التحكم",
    "households": "الأسر المستهدفة",
    "analytics": "التحليلات",
    "verification": "مركز التوثيق",
    "admin": "إدارة القواعد",
    "audit": "سجل التدقيق",
    "families": "الأسر",
    "medical_record": "السجلات الطبية والاعانات",
    "education": "التعليم",
    "volunteers": "المتطوعين",
    "reports": "التقارير",
    "audit_log": "سجل التعديلات",
    "users_permissions": "المستخدمين والصلاحيات",
    "system_title": "نظام إدارة الجمعيات"
  },
  "topbar": {
    "search_placeholder": "بحث بالرقم القومي أو الهاتف...",
    "notifications": "الإشعارات",
    "profile": "الملف الشخصي",
    "logout": "تسجيل الخروج",
    "admin": "مدير النظام"
  },
  "theme": {
    "label": "مظهر الألوان",
    "light": "فاتح",
    "dark": "داكن",
    "system": "حسب النظام"
  },
  "language": {
    "menu_label": "لغة الواجهة",
    "ar": "العربية",
    "en": "English",
    "ar_hint": "RTL · العربية",
    "en_hint": "LTR · English"
  },
  "mobile": {
    "open_menu": "فتح القائمة",
    "menu_title": "التنقل"
  },
  "demo_notifications": {
    "n1": "تم تسجيل أسرة جديدة - عائلة محمد أحمد",
    "n2": "تحديث حالة طبية حرجة - فاطمة السيد",
    "n3": "اكتمال البحث الميداني - عائلة حسن علي",
    "n4": "موعد اجتماع لجنة التقييم غداً",
    "t1": "منذ 5 دقائق",
    "t2": "منذ ساعة",
    "t3": "منذ 3 ساعات",
    "t4": "منذ 5 ساعات"
  },
  "metadata": {
    "title": "CharityHub — إدارة الجمعيات الخيرية",
    "description": "نظام متكامل لإدارة الأسر والمساعدات والعمل الميداني."
  }
}
````

<!-- SOURCE: frontend/messages/en/common.json -->
``json
{
  "app_name": "Charity Hub",
  "search_placeholder": "Search...",
  "filters": "Filters",
  "actions": {
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "view": "View",
    "confirm": "Confirm"
  },
  "states": {
    "loading": "Loading...",
    "error": "An unexpected error occurred",
    "no_data": "No data available",
    "not_found": "Requested item not found"
  },
  "nav": {
    "dashboard": "Dashboard",
    "households": "Households",
    "medical": "Medical Records",
    "education": "Education",
    "volunteers": "Volunteers",
    "disbursement": "Monthly Disbursement",
    "analytics": "Analytics",
    "verification": "Verification Center",
    "ruleEditor": "Rule Engine",
    "auditLog": "Audit Log",
    "reports": "Reports",
    "users": "Users & Roles",
    "groups": {
      "main": "Main",
      "management": "Management",
      "system": "System"
    }
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "households": "Households",
    "analytics": "Analytics",
    "verification": "Verification",
    "admin": "Admin",
    "audit": "Audit Log",
    "families": "Families",
    "medical_record": "Medical Record",
    "education": "Education",
    "volunteers": "Volunteers",
    "reports": "Reports",
    "audit_log": "Audit Log",
    "users_permissions": "Users & Permissions",
    "system_title": "Charity Management"
  },
  "topbar": {
    "search_placeholder": "Search by National ID or phone...",
    "notifications": "Notifications",
    "profile": "Profile",
    "logout": "Logout",
    "admin": "System Admin"
  },
  "theme": {
    "label": "Color theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System"
  },
  "language": {
    "menu_label": "Interface language",
    "ar": "Arabic",
    "en": "English",
    "ar_hint": "RTL · العربية",
    "en_hint": "LTR · English"
  },
  "mobile": {
    "open_menu": "Open menu",
    "menu_title": "Navigation"
  },
  "demo_notifications": {
    "n1": "New family registered — Mohammed Ahmed family",
    "n2": "Critical medical status update — Fatima Al-Sayed",
    "n3": "Field research completed — Hassan Ali family",
    "n4": "Evaluation committee meeting scheduled for tomorrow",
    "t1": "5 minutes ago",
    "t2": "1 hour ago",
    "t3": "3 hours ago",
    "t4": "5 hours ago"
  },
  "metadata": {
    "title": "CharityHub — Charity management",
    "description": "Manage families, aid distributions, and field operations."
  }
}
````

<!-- SOURCE: frontend/messages/ar/dashboard.json -->
``json
{
  "header": {
    "title": "نظرة عامة",
    "subtitle": "ملخص شامل لأداء الجمعية"
  },
  "sections": {
    "workflow_alerts": "تنبيهات وإجراءات",
    "financial_kpis": "المؤشرات المالية المتقدمة",
    "financial_kpis_monthly": "المؤشرات المالية الشهرية",
    "family_stats": "إحصائيات الأسر",
    "analytics": "تحليلات وبيانات",
    "regions": "المراقبة الإقليمية",
    "action_center": "مركز الإجراءات",
    "smart_alerts": "لوحة التنبيهات الذكية",
    "command_strip": "التشغيل",
    "financial_intel": "ذكاء مالي",
    "core_analytics": "التحليلات الأساسية",
    "activity_feed": "آخر التنبيهات"
  },
  "strip": {
    "pending_evaluations": "تقييمات معلّقة",
    "critical_cases": "تصنيفات حرجة",
    "pending_field_research": "بحث ميداني معلّق",
    "overdue_reviews": "قائمة تقييم متأخرة",
    "urgent_medical": "متابعات طبية متأخرة",
    "submitted_not_evaluated": "أسر مقدّمة وغير مُقيَّمة",
    "critical_not_evaluated": "أسر حرجة غير مُقيَّمة",
    "research_in_progress": "بحث قيد التنفيذ",
    "awaiting_final_review": "بحث بانتظار التقييم النهائي",
    "needing_immediate_intervention": "أسر تحتاج تدخّلاً فورياً",
    "critical_medical_cases": "حالات طبية حرجة"
  },
  "family_strip": {
    "total_families": "إجمالي الأسر",
    "out_of_priority": "خارج الأولوية",
    "critical_families": "أسر حرجة",
    "extremely_needy": "أشدّ احتياجاً",
    "average_families": "أسر متوسطة",
    "field_activity": "مؤشر النشاط الميداني",
    "field_activity_hint": "طابور + تراكم + بحث معلّق",
    "pct_of_total": "{pct}٪ من إجمالي الأسر"
  },
  "financial_row": {
    "monthly_income": "الدخل الشهري",
    "monthly_expenses": "المصروفات الشهرية",
    "predicted_balance": "الرصيد المتوقّع للشهر القادم",
    "medical_spend": "الإنفاق الطبي",
    "vs_prior": "مقارنة بالشهر السابق",
    "from_last_month": "عن الشهر الماضي",
    "from_current_month": "عن الشهر الحالي"
  },
  "workflow": {
    "queue_title": "قائمة المتابعة الميدانية الخاصة بالتقييم المتأخر",
    "queue_hint": "أسر لم يتم تحديث تقييمها منذ أكثر من ١٥٠ يوماً",
    "alerts_stub": "مؤشر الخطورة التشغيلية",
    "backlog_registered": "أسر لم يُكمّل لها احتساب الهشاشة",
    "overdue_medical": "حالات تحتاج متابعة طبية فورية",
    "empty_queue": "لا توجد مهام تأخيرة في هذا العرض الآن.",
    "view_family": "عرض",
    "vulnerability": "مؤشر الهشاشة",
    "last_score": "آخر حساب تقييم"
  },
  "financial": {
    "predicted_next_balance": "الرصيد المتوقّع للشهر القادم",
    "expected_income": "الدخل الشهري المتوقع للأسر (تلمّس)",
    "expected_expenses": "المصروفات المتوقعة",
    "expected_aid": "المساعدات النقدية المتوقعة",
    "confidence": "الثقة في التنبؤ",
    "risk": "مؤشر مخاطرة مالية",
    "risk_low": "مخاطر منخفضة",
    "risk_medium": "مخاطر متوسطة",
    "risk_high": "مخاطر عالية",
    "stable": "مستقر",
    "medical_exposure": "ضغط تكلفة الطبية المتوقعة",
    "critical_signals": "حالات سريرية نشطة حساسة"
  },
  "stats": {
    "totalFamilies": "إجمالي الأسر المسجلة",
    "criticalFamilies": "أسر حرجة (تصنيف هشّ)",
    "incompleteFamilies": "أسر بياناتها غير مكتملة",
    "totalNeed": "مجموع الاحتياج المقدّر",
    "totalIncome": "مجموع الدخل المحسوب",
    "currency": " ج.م",
    "criticalMedical": "حالات سريرية نشطة حساسة",
    "avgVulnerability": "متوسط مؤشر الهشاشة الوطني"
  },
  "charts": {
    "classification_distribution": "توزيع الأسر حسب التصنيف",
    "expenses_by_class": "إجمالي مصروفات الأسر بحسب الهشاشة",
    "expense_distribution_donut": "توزيع المصروفات الشهرية",
    "financial_pulse": "نبض مالي شهرية (مصادر دخل ومخارج)",
    "financial_trend_six_months": "الاتجاه المالي (آخر ٦ أشهر)",
    "monthly_financial_trend": "الاتجاه المالي الشهري",
    "medical_spend_series": "تكلفة الخدمات الطبية المرصودة شهراً",
    "medical_spend_monthly": "الإنفاق الطبي الشهري",
    "registrations_series": "تسجيل أسر شهري",
    "families_axis": "الأسر",
    "series_income": "دخل الأسرة",
    "series_expenses": "المصروفات",
    "series_aid": "المساعدات النقدية",
    "series_medical": "الإنفاق الطبي المرصود",
    "empty_classification": "لا توجد بيانات توزيع للتصنيفات بعد.",
    "empty_expenses_by_class": "لا توجد بيانات مصروفات حسب التصنيف بعد.",
    "empty_series": "لا توجد بيانات زمنية كافية بعد."
  },
  "classification": {
    "VERY_FRAGILE": "هش جداً",
    "FRAGILE": "هشّ",
    "WEAK": "ضعيف",
    "MODERATE": "متوسط",
    "OUT_OF_PRIORITY": "خارج الأولوية النسبية"
  },
  "regions": {
    "title_hint": "مقاييس حقولية ومشرفين حسب عنوان المنطقة",
    "monitor_subtitle": "حسب المنطقة — الأسر والطوابير والهشاشة",
    "pending_research": "بحث معلّق",
    "critical_cases": "حالات حرجة",
    "supervisors": "مشرفون",
    "avg_vuln": "متوسط الهشاشة",
    "unknown_region": "منطقة غير محددة",
    "sort_label": "الترتيب",
    "sort_families_desc": "الأسر تنازلياً",
    "sort_critical_desc": "الحالات الحرجة تنازلياً",
    "sort_avg_vuln_desc": "أعلى هشاشة أولاً",
    "filter_all": "كل المناطق",
    "empty": "لا توجد توزيعات جغرافية بعد."
  },
  "action": {
    "open_intake_route": "الدخول لممر التسجيل",
    "register_family": "تسجيل أسرة",
    "families_board": "قائمة الأسر",
    "medical_dashboard": "المراقبة الطبية المركّزة",
    "reports_placeholder": "تقارير الأداء (قيد التفعيل الكامل)",
    "export_hint": "يُخطط لمخرجات بيانات مؤتمتة"
  },
  "smartAlerts": {
    "headline": "الأولوية التشغيلية والخطورة المتزامنة",
    "priority_families": "أسر ذات أولوية قصوى",
    "recent_intake": "أسر مضافة حديثاً",
    "no_priority": "لا توجد أسرة في أعلى نطاق الأولوية بعرض هذا المقطع."
  },
  "tables": {
    "registration": "رقم الملف",
    "region": "المنطقة",
    "classification": "التصنيف",
    "vi": "مؤشر",
    "need_index": "مؤشر الاحتياج",
    "action_open": "إجراء",
    "families_count": "الأسر",
    "recent_families_title": "أسر مضافة حديثاً",
    "highest_need_title": "أسر الأشدّ احتياجاً",
    "latest_alerts_title": "آخر التنبيهات",
    "actions": "",
    "empty_recent": "لا توجد أسر حديثة.",
    "empty_priority": "لا توجد أسر ذات أولوية عالية في هذا العرض."
  },
  "feed": {
    "backlog": "أسر بانتظار أول تقييم للهشاشة",
    "overdue_medical": "متابعات طبية تجاوزت الموعد",
    "stale_queue": "أسر في قائمة إعادة التقييم المتأخرة",
    "stale_research": "عناصر بحث متأخرة",
    "risk_high": "نطاق مخاطرة مرتفع في التوقعات — راجع الوضع النقدي",
    "overdue_evaluations": "تقييمات متأخرة",
    "new_family_urgent_eval": "أسرة جديدة تحتاج تقييماً عاجلاً",
    "urgent_medical_cases": "حالات طبية عاجلة",
    "critical_financial_signal": "مؤشر مالي حرج — راجع الوضع",
    "minutes_ago": "منذ {count} دقيقة"
  },
  "common": {
    "loading": "جاري التحميل…",
    "error": "تعذّر تحميل لوحة الذكاء. حاول تحديث الصفحة.",
    "retry": "تحديث",
    "partial_banner": "تعذّر تحديث بعض الأقسام؛ قد تكون البيانات جزئية.",
    "widget_failed": "غير متاح",
    "empty_feed": "لا توجد تنبيهات في هذه النافذة.",
    "view_details": "عرض التفاصيل",
    "view_all": "عرض الكل"
  },
  "kpi": {
    "trend_up": "اتجاه صاعد",
    "trend_down": "اتجاه منخفض",
    "trend_flat": "مستقر"
  }
}
````

<!-- SOURCE: frontend/messages/en/dashboard.json -->
``json
{
  "header": {
    "title": "Overview",
    "subtitle": "Operational snapshot of association performance"
  },
  "sections": {
    "workflow_alerts": "Alerts & actions",
    "financial_kpis": "Advanced financial KPIs",
    "financial_kpis_monthly": "Monthly financial indicators",
    "family_stats": "Family statistics",
    "analytics": "Analytics & charts",
    "regions": "Regional monitoring",
    "action_center": "Action center",
    "smart_alerts": "Smart alerts panel",
    "command_strip": "Operations",
    "financial_intel": "Financial intelligence",
    "core_analytics": "Core analytics",
    "activity_feed": "Latest alerts"
  },
  "strip": {
    "pending_evaluations": "Pending evaluations",
    "critical_cases": "Critical classifications",
    "pending_field_research": "Pending field research",
    "overdue_reviews": "Stale scoring queue",
    "urgent_medical": "Overdue medical reviews",
    "submitted_not_evaluated": "Families submitted, not evaluated",
    "critical_not_evaluated": "Critical families not evaluated",
    "research_in_progress": "Research in progress",
    "awaiting_final_review": "Awaiting final evaluation",
    "needing_immediate_intervention": "Families needing immediate intervention",
    "critical_medical_cases": "Critical medical cases"
  },
  "family_strip": {
    "total_families": "Total families",
    "out_of_priority": "Out of priority",
    "critical_families": "Critical families",
    "extremely_needy": "Extremely needy",
    "average_families": "Average families",
    "field_activity": "Field activity index",
    "field_activity_hint": "Queue + backlog + pending research",
    "pct_of_total": "{pct}% of total"
  },
  "financial_row": {
    "monthly_income": "Monthly income",
    "monthly_expenses": "Monthly expenses",
    "predicted_balance": "Predicted next month balance",
    "medical_spend": "Medical spending",
    "vs_prior": "vs prior month",
    "from_last_month": "from last month",
    "from_current_month": "from current month"
  },
  "workflow": {
    "queue_title": "Stale scoring revisit queue",
    "queue_hint": "Households with scoring older than 30 days outside \"out-of-priority\" band",
    "alerts_stub": "Operational risk pulse",
    "backlog_registered": "Families awaiting first vulnerability scoring snapshot",
    "overdue_medical": "Clinical follow-ups breached",
    "empty_queue": "No stale-queue items surfaced for now.",
    "view_family": "Open",
    "vulnerability": "Vulnerability index",
    "last_score": "Last scoring run"
  },
  "financial": {
    "predicted_next_balance": "Predicted next month balance",
    "expected_income": "Expected household-income inflow outlook",
    "expected_expenses": "Expected aggregated expenses outlook",
    "expected_aid": "Expected cash-aid outflow outlook",
    "confidence": "Forecast confidence",
    "risk": "Financial risk stance",
    "risk_low": "Low risk",
    "risk_medium": "Medium risk",
    "risk_high": "High risk",
    "stable": "Stable",
    "medical_exposure": "Projected weighted medical strain",
    "critical_signals": "Active high-sensitivity clinical cases"
  },
  "stats": {
    "totalFamilies": "Families registered",
    "criticalFamilies": "Critical classifications",
    "incompleteFamilies": "Incomplete profiles",
    "totalNeed": "Aggregated indicative need",
    "totalIncome": "Aggregated reported income",
    "currency": " EGP",
    "criticalMedical": "High-sensitivity medical cases",
    "avgVulnerability": "Population vulnerability mean"
  },
  "charts": {
    "classification_distribution": "Family distribution by classification",
    "expenses_by_class": "Expense mass by vulnerability class",
    "expense_distribution_donut": "Monthly expense distribution",
    "financial_pulse": "Monthly fiscal pulse",
    "financial_trend_six_months": "Financial trend (last 6 months)",
    "monthly_financial_trend": "Monthly financial trend",
    "medical_spend_series": "Captured medical expenditure",
    "medical_spend_monthly": "Monthly medical spending",
    "registrations_series": "Monthly registrations",
    "families_axis": "Families",
    "series_income": "Income",
    "series_expenses": "Expenses",
    "series_aid": "Cash aid",
    "series_medical": "Medical spend",
    "empty_classification": "No classification distribution data yet.",
    "empty_expenses_by_class": "No expense breakdown by classification yet.",
    "empty_series": "Not enough timeline data yet."
  },
  "classification": {
    "VERY_FRAGILE": "Very fragile",
    "FRAGILE": "Fragile",
    "WEAK": "Weak",
    "MODERATE": "Moderate",
    "OUT_OF_PRIORITY": "Out of prioritisation"
  },
  "regions": {
    "title_hint": "Field density & coordinators derived from relational truth",
    "monitor_subtitle": "By region — families, queues, vulnerability",
    "pending_research": "Pending research",
    "critical_cases": "Critical cases",
    "supervisors": "Coordinators",
    "avg_vuln": "Avg. VI",
    "unknown_region": "Unspecified locality",
    "sort_label": "Sort",
    "sort_families_desc": "Families (desc)",
    "sort_critical_desc": "Critical cases (desc)",
    "sort_avg_vuln_desc": "Highest vulnerability",
    "filter_all": "All regions",
    "empty": "No regional dispersion yet."
  },
  "action": {
    "open_intake_route": "Hop to intake desks",
    "register_family": "Register family",
    "families_board": "Families board",
    "medical_dashboard": "Medical intelligence",
    "reports_placeholder": "Executive reports *(roadmap)*",
    "export_hint": "Automated export pipeline planned"
  },
  "smartAlerts": {
    "headline": "Synchronised urgency / clinical pressure",
    "priority_families": "Highest need families",
    "recent_intake": "Recently added families",
    "no_priority": "No priority dossiers in scope."
  },
  "tables": {
    "registration": "Reg. #",
    "region": "Region",
    "classification": "Classification",
    "vi": "VI",
    "need_index": "Need index",
    "action_open": "Action",
    "families_count": "Families",
    "recent_families_title": "Recently added families",
    "highest_need_title": "Highest need families",
    "latest_alerts_title": "Latest alerts",
    "actions": "",
    "empty_recent": "No recent families.",
    "empty_priority": "No high-priority families in this view."
  },
  "feed": {
    "backlog": "Families awaiting first vulnerability score",
    "overdue_medical": "Medical follow-ups past due date",
    "stale_queue": "Stale research queue",
    "stale_research": "Stale research items",
    "risk_high": "Forecast risk band: high — review cash posture",
    "overdue_evaluations": "Overdue evaluations",
    "new_family_urgent_eval": "New family needs urgent evaluation",
    "urgent_medical_cases": "Urgent medical cases",
    "critical_financial_signal": "Critical financial outlook — review posture",
    "minutes_ago": "{count} min ago"
  },
  "common": {
    "loading": "Loading intelligence…",
    "error": "Unable to hydrate dashboard aggregates.",
    "retry": "Refresh",
    "partial_banner": "Some panels could not refresh; data shown may be partial.",
    "widget_failed": "Unavailable",
    "empty_feed": "No alerts in this window.",
    "view_details": "View details",
    "view_all": "View all"
  },
  "kpi": {
    "trend_up": "Upward impulse",
    "trend_down": "Downwards impulse",
    "trend_flat": "Neutral"
  }
}
````

<!-- SOURCE: frontend/messages/ar/surface.json -->
``json
{
  "education": {
    "title": "المتابعة التعليمية",
    "subtitle": "متابعة المستوى الدراسي وحفظ القرآن",
    "stats": {
      "totalStudents": "إجمالي الطلاب",
      "averageGrades": "متوسط الدرجات",
      "topPerformers": "المتفوقون"
    },
    "searchPlaceholder": "بحث بالاسم أو الأسرة أو المرحلة…",
    "table": {
      "student": "اسم الطالب",
      "family": "الأسرة",
      "grade": "المرحلة الدراسية",
      "level": "المستوى",
      "quran": "حفظ القرآن",
      "updated": "آخر تحديث"
    },
    "levels": {
      "excellent": "ممتاز",
      "veryGood": "جيد جداً",
      "good": "جيد",
      "weak": "ضعيف"
    },
    "demo": {
      "s1_name": "محمد أحمد",
      "s1_family": "عائلة أحمد محمد",
      "s1_grade": "الصف الأول الثانوي",
      "s1_quran": "سورة البقرة",
      "s2_name": "سارة أحمد",
      "s2_family": "عائلة أحمد محمد",
      "s2_grade": "الصف السادس الابتدائي",
      "s2_quran": "سورة آل عمران",
      "s3_name": "علي فاطمة",
      "s3_family": "عائلة فاطمة السيد",
      "s3_grade": "الصف الثالث الإعدادي",
      "s3_quran": "سورة النساء",
      "s4_name": "نور محمود",
      "s4_family": "عائلة محمود علي",
      "s4_grade": "الصف الثاني الابتدائي",
      "s4_quran": "جزء عم",
      "s5_name": "ياسمين محمود",
      "s5_family": "عائلة محمود علي",
      "s5_grade": "الصف الرابع الابتدائي",
      "s5_quran": "سورة يس",
      "s6_name": "أحمد حسن",
      "s6_family": "عائلة حسن محمد",
      "s6_grade": "الصف الثاني الثانوي",
      "s6_quran": "سورة الكهف"
    }
  },
  "medical": {
    "title": "السجل الطبي",
    "subtitle": "متابعة الحالات الطبية والعلاجية",
    "addRecord": "إضافة سجل طبي",
    "stats": {
      "totalCases": "إجمالي الحالات",
      "criticalCases": "حالات حرجة",
      "monthlyCost": "التكلفة الشهرية التقديرية"
    },
    "searchPlaceholder": "بحث بالأسرة أو الفرد أو الحالة…",
    "table": {
      "family": "الأسرة",
      "member": "الفرد",
      "condition": "الحالة",
      "severity": "الخطورة",
      "cost": "التكلفة الشهرية",
      "status": "الحالة"
    },
    "severityStyle": {
      "moderate": "متوسط",
      "chronic": "مزمن",
      "acute": "حاد",
      "severe": "شديد"
    },
    "demo": {
      "r1_family": "عائلة أحمد محمد",
      "r1_member": "أحمد محمد",
      "r1_condition": "ضغط دم مرتفع",
      "r1_severity": "متوسط",
      "r1_status": "مستمر",
      "r2_family": "عائلة أحمد محمد",
      "r2_member": "فاطمة علي",
      "r2_condition": "سكري النوع الثاني",
      "r2_severity": "مزمن",
      "r2_status": "مستمر",
      "r3_family": "عائلة فاطمة السيد",
      "r3_member": "فاطمة السيد",
      "r3_condition": "روماتيزم",
      "r3_severity": "متوسط",
      "r3_status": "مستمر",
      "r4_family": "عائلة محمود علي",
      "r4_member": "محمود علي",
      "r4_condition": "كسر في الساق",
      "r4_severity": "حاد",
      "r4_status": "علاج مؤقت",
      "r5_family": "عائلة زينب عبدالرحمن",
      "r5_member": "علي زينب",
      "r5_condition": "إعاقة ذهنية",
      "r5_severity": "شديد",
      "r5_status": "مستمر",
      "r6_family": "عائلة مريم أحمد",
      "r6_member": "مريم أحمد",
      "r6_condition": "أنيميا حادة",
      "r6_severity": "متوسط",
      "r6_status": "علاج مؤقت"
    }
  },
  "audit": {
    "title": "سجل التعديلات",
    "subtitle": "متابعة جميع العمليات والتعديلات على النظام",
    "filterAction": "نوع الإجراء",
    "filterEntity": "الكيان",
    "filterDateRange": "الفترة الزمنية",
    "filterAll": "الكل",
    "exportCSV": "تصدير CSV",
    "colTime": "الوقت",
    "colUser": "المستخدم",
    "colAction": "الإجراء",
    "colEntity": "الكيان",
    "colField": "الحقل",
    "colHousehold": "رقم القيد",
    "detailsBefore": "البيانات السابقة",
    "detailsAfter": "البيانات الحالية",
    "detailsDiff": "التغييرات",
    "emptyState": "لا توجد سجلات",
    "actions": {
      "CREATE": "إنشاء",
      "UPDATE": "تحديث",
      "DELETE": "حذف",
      "VERIFY": "توثيق",
      "REJECT": "رفض",
      "LOGIN": "تسجيل دخول"
    },
    "entities": {
      "Household": "أسرة",
      "Income": "دخل",
      "MedicalRecord": "سجل طبي",
      "EducationRecord": "سجل تعليمي",
      "RuleOverride": "قاعدة استهداف",
      "User": "مستخدم"
    }
  },
  "reports": {
    "title": "التقارير",
    "subtitle": "إنشاء وتصدير التقارير المتنوعة",
    "filterPlaceholder": "نوع التقرير",
    "filterAll": "جميع التقارير",
    "types": {
      "comprehensive": "شامل",
      "financial": "مالي",
      "analytical": "تحليلي",
      "periodic": "دوري",
      "operations": "عمليات",
      "educational": "تعليمي"
    },
    "lastGenerated": "آخر إنشاء: {date}",
    "exportExcel": "تصدير Excel",
    "cards": {
      "r1_title": "تقرير الأسر الشامل",
      "r1_desc": "تقرير يحتوي على جميع بيانات الأسر المسجلة مع التصنيفات والمؤشرات",
      "r2_title": "تقرير الدخل والمصروفات",
      "r2_desc": "تحليل مفصل لمصادر الدخل والمصروفات الشهرية لجميع الأسر",
      "r3_title": "تقرير مؤشرات الهشاشة",
      "r3_desc": "تحليل مؤشرات الهشاشة والتصنيفات مع التوزيع الجغرافي",
      "r4_title": "تقرير الأداء الشهري",
      "r4_desc": "ملخص النشاط الشهري من تسجيلات وزيارات ميدانية وتوزيعات",
      "r5_title": "تقرير التوزيعات",
      "r5_desc": "سجل كامل لجميع التوزيعات المادية والغذائية والعينية",
      "r6_title": "تقرير المتابعة التعليمية",
      "r6_desc": "متابعة المستوى الدراسي لأبناء الأسر وحفظ القرآن"
    }
  }
}
````

<!-- SOURCE: frontend/messages/en/surface.json -->
``json
{
  "education": {
    "title": "Education tracking",
    "subtitle": "Monitor schooling level and Quran memorization",
    "stats": {
      "totalStudents": "Total students",
      "averageGrades": "Average grades",
      "topPerformers": "High achievers"
    },
    "searchPlaceholder": "Search by name, family, or grade…",
    "table": {
      "student": "Student",
      "family": "Family",
      "grade": "Grade level",
      "level": "Performance",
      "quran": "Quran memorization",
      "updated": "Last updated"
    },
    "levels": {
      "excellent": "Excellent",
      "veryGood": "Very good",
      "good": "Good",
      "weak": "Weak"
    },
    "demo": {
      "s1_name": "Mohamed Ahmed",
      "s1_family": "Ahmed Mohamed family",
      "s1_grade": "First year secondary",
      "s1_quran": "Surah Al-Baqarah",
      "s2_name": "Sara Ahmed",
      "s2_family": "Ahmed Mohamed family",
      "s2_grade": "Sixth grade primary",
      "s2_quran": "Surah Al Imran",
      "s3_name": "Ali Fatima",
      "s3_family": "Fatima Al-Sayed family",
      "s3_grade": "Third year preparatory",
      "s3_quran": "Surah An-Nisa",
      "s4_name": "Nour Mahmoud",
      "s4_family": "Mahmoud Ali family",
      "s4_grade": "Second grade primary",
      "s4_quran": "Juz Amma",
      "s5_name": "Yasmin Mahmoud",
      "s5_family": "Mahmoud Ali family",
      "s5_grade": "Fourth grade primary",
      "s5_quran": "Surah Ya-Sin",
      "s6_name": "Ahmed Hassan",
      "s6_family": "Hassan Mohamed family",
      "s6_grade": "Second year secondary",
      "s6_quran": "Surah Al-Kahf"
    }
  },
  "medical": {
    "title": "Medical records",
    "subtitle": "Track medical cases and treatment costs",
    "addRecord": "Add medical record",
    "stats": {
      "totalCases": "Total cases",
      "criticalCases": "Critical cases",
      "monthlyCost": "Estimated monthly cost"
    },
    "searchPlaceholder": "Search family, member, or condition…",
    "table": {
      "family": "Family",
      "member": "Member",
      "condition": "Condition",
      "severity": "Severity",
      "cost": "Monthly cost",
      "status": "Status"
    },
    "severityStyle": {
      "moderate": "moderate",
      "chronic": "chronic",
      "acute": "acute",
      "severe": "severe"
    },
    "demo": {
      "r1_family": "Ahmed Mohamed family",
      "r1_member": "Ahmed Mohamed",
      "r1_condition": "Hypertension",
      "r1_severity": "Moderate",
      "r1_status": "Ongoing",
      "r2_family": "Ahmed Mohamed family",
      "r2_member": "Fatima Ali",
      "r2_condition": "Type 2 diabetes",
      "r2_severity": "Chronic",
      "r2_status": "Ongoing",
      "r3_family": "Fatima Al-Sayed family",
      "r3_member": "Fatima Al-Sayed",
      "r3_condition": "Rheumatism",
      "r3_severity": "Moderate",
      "r3_status": "Ongoing",
      "r4_family": "Mahmoud Ali family",
      "r4_member": "Mahmoud Ali",
      "r4_condition": "Leg fracture",
      "r4_severity": "Acute",
      "r4_status": "Temporary care",
      "r5_family": "Zainab Abd El-Rahman family",
      "r5_member": "Ali Zainab",
      "r5_condition": "Intellectual disability",
      "r5_severity": "Severe",
      "r5_status": "Ongoing",
      "r6_family": "Mariam Ahmed family",
      "r6_member": "Mariam Ahmed",
      "r6_condition": "Severe anemia",
      "r6_severity": "Moderate",
      "r6_status": "Temporary care"
    }
  },
  "audit": {
    "title": "Audit log",
    "subtitle": "Track all actions and changes in the system",
    "filterAction": "Action Type",
    "filterEntity": "Entity",
    "filterDateRange": "Date Range",
    "filterAll": "All",
    "exportCSV": "Export CSV",
    "colTime": "Time",
    "colUser": "User",
    "colAction": "Action",
    "colEntity": "Entity",
    "colField": "Field",
    "colHousehold": "Household Code",
    "detailsBefore": "Before",
    "detailsAfter": "After",
    "detailsDiff": "Changes",
    "emptyState": "No records found",
    "actions": {
      "CREATE": "Create",
      "UPDATE": "Update",
      "DELETE": "Delete",
      "VERIFY": "Verify",
      "REJECT": "Reject",
      "LOGIN": "Login"
    },
    "entities": {
      "Household": "Household",
      "Income": "Income",
      "MedicalRecord": "Medical Record",
      "EducationRecord": "Education Record",
      "RuleOverride": "Rule Override",
      "User": "User"
    }
  },
  "reports": {
    "title": "Reports",
    "subtitle": "Generate and export reports",
    "filterPlaceholder": "Report type",
    "filterAll": "All reports",
    "types": {
      "comprehensive": "Comprehensive",
      "financial": "Financial",
      "analytical": "Analytical",
      "periodic": "Periodic",
      "operations": "Operations",
      "educational": "Educational"
    },
    "lastGenerated": "Last generated: {date}",
    "exportExcel": "Export Excel",
    "cards": {
      "r1_title": "Families overview report",
      "r1_desc": "All registered families with classifications and indicators",
      "r2_title": "Income & expenses report",
      "r2_desc": "Monthly income and expense breakdown for every family",
      "r3_title": "Vulnerability indicators report",
      "r3_desc": "Vulnerability scores and classifications with regional breakdown",
      "r4_title": "Monthly performance report",
      "r4_desc": "Monthly activity: registrations, field visits, and distributions",
      "r5_title": "Distributions report",
      "r5_desc": "Full log of material, food, and in-kind distributions",
      "r6_title": "Education follow-up report",
      "r6_desc": "Schooling progress and Quran memorization by household"
    }
  }
}
````

<!-- SOURCE: frontend/messages/ar/families.json -->
``json
{
  "list": {
    "title": "الأسر",
    "subtitle": "إدارة بيانات الأسر المسجلة ({count})",
    "familyUnit": "أسرة",
    "addFamily": "إضافة أسرة",
    "dialogAdd": "إضافة أسرة جديدة",
    "dialogEdit": "تعديل بيانات الأسرة",
    "searchPlaceholder": "بحث بالاسم، الرقم القومي، أو الهاتف…",
    "filterClassification": "التصنيف",
    "classificationAll": "جميع التصنيفات",
    "table": {
      "headName": "اسم رب الأسرة",
      "nationalId": "الرقم القومي",
      "phone": "الهاتف",
      "members": "عدد الأفراد",
      "totalIncome": "إجمالي الدخل",
      "vulnerabilityIndex": "مؤشر الهشاشة",
      "classification": "التصنيف",
      "actions": "إجراءات"
    },
    "loading": "جاري تحميل البيانات…",
    "empty": "لا توجد نتائج مطابقة",
    "deleteConfirm": "هل أنت متأكد من حذف هذه الأسرة؟",
    "deleteSuccess": "تم حذف الأسرة بنجاح",
    "currency": "ج.م",
    "percent": "%",
    "pagination": "عرض {from} - {to} من {total}",
    "sr": {
      "view": "عرض",
      "edit": "تعديل",
      "delete": "حذف"
    }
  },
  "detail": {
    "notFoundTitle": "لم يتم العثور على الأسرة",
    "notFoundBody": "الأسرة المطلوبة غير موجودة في النظام.",
    "backToList": "العودة للقائمة",
    "backSr": "رجوع"
  },
  "profile": {
    "misc": {
      "tier": "فئة {code}",
      "points": "نقطة"
    },
    "tabs": {
      "basicInfo": "البيانات الأساسية",
      "members": "الأفراد",
      "income": "الدخل",
      "expenses": "المصروفات",
      "medical": "السجل الطبي",
      "scoring": "نتيجة التقييم"
    },
    "basicInfo": {
      "title": "البيانات الأساسية",
      "verified": "موثق",
      "fieldResearch": "بحث ميداني",
      "familyData": "بيانات الأسرة",
      "headName": "اسم رب الأسرة",
      "wifeName": "اسم الزوجة",
      "nationalId": "الرقم القومي",
      "wifeNationalId": "الرقم القومي للزوجة",
      "phone": "الهاتف",
      "phone2": "هاتف بديل",
      "address": "العنوان",
      "registrationDate": "تاريخ التسجيل",
      "membersCount": "عدد الأفراد",
      "membersSuffix": "أفراد",
      "financialData": "البيانات المالية والإدارية",
      "meezaCard": "رقم بطاقة ميزة",
      "notRegistered": "لم يتم التسجيل",
      "classification": "تصنيف الحالة",
      "caseCategory": "نوع الحالة",
      "categoryReason": "سبب التصنيف",
      "aidDecision": "قرار المساعدة",
      "monthlyAid": "مبلغ المساعدة الشهرية",
      "fieldResearchNotes": "ملاحظات البحث الميداني",
      "generalNotes": "ملاحظات عامة"
    },
    "members": {
      "title": "أفراد الأسرة",
      "addMember": "إضافة فرد",
      "dialogTitle": "إضافة فرد جديد",
      "emptyState": "لا يوجد أفراد مسجلون بعد",
      "deleteSuccess": "تم حذف الفرد",
      "addSuccess": "تم إضافة الفرد بنجاح",
      "addError": "فشل إضافة الفرد",
      "saveMember": "حفظ الفرد",
      "fullName": "الاسم الكامل",
      "fullNamePh": "الاسم الرباعي",
      "nationalId": "الرقم القومي",
      "nationalIdPh": "14 رقم",
      "relation": "صلة القرابة",
      "selectPh": "اختر",
      "birthDate": "تاريخ الميلاد",
      "gender": "النوع",
      "education": "المستوى التعليمي",
      "job": "الوظيفة / العمل",
      "jobPh": "طالب، عامل يومي، ربة منزل...",
      "jobIncome": "دخل الوظيفة (ج.م)",
      "maritalStatus": "الحالة الاجتماعية",
      "hasDisability": "هل يعاني من إعاقة؟",
      "disabilityClass": "تصنيف الإعاقة",
      "selectClass": "اختر الفئة",
      "disabilityDesc": "وصف الإعاقة",
      "disabilityDescPh": "وصف تفصيلي للإعاقة...",
      "hasChronicIllness": "هل يعاني من مرض مزمن؟",
      "illnessName": "اسم المرض",
      "illnessNamePh": "مثال: سكري، ضغط دم، قلب...",
      "severity": "درجة الخطورة",
      "notes": "ملاحظات",
      "notesPh": "ملاحظات إضافية...",
      "male": "ذكر",
      "female": "أنثى",
      "disability": "إعاقة",
      "chronicIllness": "مرض مزمن",
      "years": "سنة",
      "noJob": "بدون وظيفة",
      "notRegistered": "غير مسجل",
      "noIncome": "بدون دخل",
      "currentJob": "العمل الحالي"
    },
    "income": {
      "title": "مصادر الدخل",
      "addIncome": "إضافة دخل",
      "dialogTitle": "إضافة مصدر دخل",
      "emptyState": "لا توجد مصادر دخل مسجلة",
      "addSuccess": "تم إضافة مصدر الدخل",
      "addError": "فشل إضافة مصدر الدخل",
      "source": "مصدر الدخل",
      "sourcePh": "اختر المصدر",
      "amount": "المبلغ (ج.م)",
      "frequency": "التكرار",
      "verified": "موثق (تم التحقق)",
      "save": "حفظ",
      "total": "إجمالي الدخل",
      "currency": "ج.م",
      "monthly": "شهري",
      "daily": "يومي",
      "weekly": "أسبوعي",
      "seasonal": "موسمي",
      "deleteSuccess": "تم حذف مصدر الدخل"
    },
    "expenses": {
      "title": "المصروفات",
      "addExpense": "إضافة مصروف",
      "dialogTitle": "إضافة مصروف",
      "emptyState": "لا توجد مصروفات مسجلة",
      "addSuccess": "تم إضافة المصروف",
      "addError": "فشل إضافة المصروف",
      "category": "الفئة",
      "categoryPh": "اختر الفئة",
      "amount": "المبلغ (ج.م)",
      "frequency": "التكرار",
      "notes": "ملاحظات",
      "save": "حفظ",
      "total": "إجمالي المصروفات",
      "netBalance": "صافي الرصيد",
      "currency": "ج.م",
      "deleteSuccess": "تم حذف المصروف"
    },
    "medical": {
      "title": "السجل الطبي",
      "addRecord": "إضافة سجل",
      "dialogTitle": "إضافة سجل طبي",
      "emptyState": "لا توجد سجلات طبية",
      "addSuccess": "تم إضافة السجل",
      "addError": "فشل إضافة السجل",
      "patientName": "اسم المريض",
      "diagnosis": "التشخيص",
      "hospital": "المستشفى / العيادة",
      "monthlyCost": "التكلفة الشهرية (ج.م)",
      "notes": "ملاحظات",
      "save": "حفظ",
      "totalCost": "إجمالي التكلفة الشهرية",
      "currency": "ج.م",
      "deleteSuccess": "تم حذف السجل",
      "personRequired": "اسم المريض مطلوب",
      "conditionType": "نوع الحالة",
      "typechronic": "مرض مزمن",
      "typedisability": "إعاقة",
      "typetemp_injury": "إصابة مؤقتة",
      "typesurgery": "عملية جراحية",
      "diagnosisPh": "أدخل تفاصيل التشخيص",
      "treatment": "العلاج / الأدوية",
      "treatmentPh": "مثال: أنسولين، علاج طبيعي",
      "startDate": "تاريخ البداية",
      "hospitalPh": "أدخل اسم المستشفى",
      "needsFollowup": "يحتاج متابعة مستمرة",
      "followup": "متابعة"
    },
    "scoring": {
      "title": "تحليل التسجيل",
      "vulnerabilityIndex": "مؤشر الضعف",
      "classificationTitle": "مؤشر الضعف والتصنيف",
      "recalculate": "إعادة حساب",
      "recalculating": "جاري إعادة الحساب...",
      "aidDecision": "قرار المساعدة",
      "monthlyAid": "شهري",
      "currency": "ج.م",
      "membersChronicTitle": "نقاط المرض المزمن (من الأفراد)",
      "membersChronicTotal": "إجمالي نقاط المرض المزمن",
      "medicalRecordsScore": "نقاط السجل الطبي",
      "outOfPriority": "خارج الأولوية (0٪)",
      "moderate": "متوسط (15٪)",
      "weak": "ضعيف (30٪)",
      "fragile": "هش (50٪+)",
      "descCritical": "هذه العائلة تحتاج إلى مساعدة مادية وعينية عاجلة",
      "descFragile": "هذه العائلة هشة وتحتاج إلى دعم مستمر ومتابعة",
      "descWeak": "هذه العائلة ضعيفة وتحتاج إلى دعم ومتابعة",
      "descModerate": "هذه العائلة تحتاج إلى مساعدة موسمية ومتابعة",
      "descOutOfPriority": "هذه العائلة خارج الأولوية حالياً",
      "financialSummary": "الملخص المالي",
      "totalIncome": "إجمالي الدخل",
      "totalExpenses": "إجمالي المصروفات",
      "medicalCost": "التكلفة الطبية",
      "netBalance": "صافي الرصيد",
      "monthlyAidApproved": "المساعدة الشهرية المقررة",
      "disabilityPointsTitle": "نقاط الإعاقة (من الأفراد)",
      "disabilityPointsTotal": "إجمالي نقاط الإعاقة",
      "recalculateSuccess": "تم إعادة الحساب بنجاح",
      "recalculateError": "حدث خطأ أثناء إعادة الحساب",
      "systemRecommendation": "توصية النظام",
      "humanDecision": "قرار الباحث/المراجع",
      "reviewStatus": "حالة المراجعة",
      "pointsOutOf100": "نقطة من 100",
      "vulnerabilityScore": "مؤشر الهشاشة",
      "reductionScore": "نقاط الخصم",
      "confidenceScore": "مؤشر الثقة",
      "fraudRiskScore": "مؤشر التناقض/الاحتيال",
      "warning": "تحذير",
      "recommendation": "توصية",
      "layerBreakdown": "تفصيل نتائج التقييم (الطبقات)",
      "points": "نقاط",
      "rulesTriggered": "قواعد مطبقة",
      "noRulesTriggered": "لم يتم تطبيق أي قواعد في هذه الطبقة",
      "noBreakdownAvailable": "تفاصيل التقييم غير متوفرة",
      "layer_L1": "L1: التكوين الأسري",
      "layer_L2": "L2: تقييم الدخل",
      "layer_L3": "L3: السكن والأصول",
      "layer_L4": "L4: الصحة والإعاقة",
      "layer_L5": "L5: التعليم",
      "layer_L6": "L6: الحالة الاجتماعية",
      "layer_L7": "L7: محرك الخصم (الإقصاء)",
      "layer_L8": "L8: محرك الثقة",
      "FIELD_REVIEW_NEEDED": "تحتاج زيارة ميدانية ومراجعة",
      "FRAUD_INVESTIGATION_NEEDED": "تحتاج تحقيق للتأكد من التناقضات",
      "URGENT_ASSISTANCE_RECOMMENDED": "يوصى بمساعدة عاجلة",
      "PRIORITY_ASSISTANCE_RECOMMENDED": "يوصى بمساعدة ذات أولوية"
    }
  },
  "housing": {
    "RENT": "إيجار",
    "OWNED": "تمليك",
    "SHARED": "مشترك / عائلة"
  },
  "dictionaries": {
    "incomeSources": {
      "daily_work": "عمل يومي",
      "freelance": "عمل حر",
      "fixed_salary": "راتب ثابت",
      "pension": "معاش تأميني",
      "takafol": "تكافل وكرامة",
      "family_aid_1": "مساعدات أهالي 1",
      "family_aid_2": "مساعدات أهالي 2",
      "family_aid_3": "مساعدات أهالي 3",
      "charity_aid_1": "مساعدات جمعية خيرية 1",
      "charity_aid_2": "مساعدات جمعية خيرية 2",
      "monthly_food_aid": "مساعدات غذائية شهرية",
      "project_income": "دخل من مشاريع",
      "real_estate_income": "دخل من عقارات",
      "children_support": "شهريات الأبناء العاملين",
      "husband_income_activity": "أنشطة مكسبة للمال (الزوج)",
      "wife_income_activity": "أنشطة مكسبة للمال (الزوجة)",
      "ration_card": "بطاقة التموين",
      "smoking_deterrent": "تدخين يومي × 30 (ردع)",
      "other": "أخرى"
    },
    "expenseCategories": {
      "rent": "إيجار المسكن",
      "installments": "أقساط",
      "food": "غذاء",
      "utilities": "كهرباء ومياه وغاز",
      "transport": "مواصلات",
      "medical": "علاج ودواء",
      "education": "تعليم ومصاريف مدرسة",
      "clothing": "ملابس",
      "household": "مستلزمات منزلية",
      "communications": "اتصالات",
      "debts": "ديون مستحقة",
      "other": "أخرى"
    },
    "caseCategories": {
      "orphans": "أسرة أيتام",
      "divorced": "مطلقات",
      "poor": "فقراء",
      "needy": "مساكين",
      "disability": "أسر إعاقة",
      "student": "طالب علم",
      "prisoner": "أسر سجناء",
      "elderly": "كبار سن",
      "absence": "حالات هجر واختفاء الزوج",
      "chronic": "أمراض مزمنة",
      "temporary_injury": "إصابة مؤقتة",
      "widows": "أرامل",
      "ineligible": "لا يستحق"
    },
    "aidDecisions": {
      "monthly_material": "مساعدات مادية شهرية",
      "monthly_medical": "مساعدات علاجية شهرية",
      "seasonal_food": "مساعدات موسمية غذائية",
      "seasonal_material": "مساعدات موسمية مادية",
      "seasonal_both": "مساعدات موسمية غذائية ومادية",
      "none": "لا يستحق"
    },
    "memberRelations": {
      "head": "رب الأسرة",
      "wife": "الزوجة",
      "son": "ابن",
      "daughter": "ابنة",
      "mother": "الأم",
      "father": "الأب",
      "brother": "أخ",
      "sister": "أخت",
      "grandson": "حفيد",
      "granddaughter": "حفيدة",
      "other_relative": "قريب آخر"
    },
    "educationLevels": {
      "illiterate": "أمي (لا يقرأ ولا يكتب)",
      "literate": "يقرأ ويكتب",
      "primary": "ابتدائي",
      "preparatory": "إعدادي",
      "secondary": "ثانوي عام",
      "technical_secondary": "ثانوي فني",
      "diploma": "دبلوم",
      "university": "جامعي",
      "postgraduate": "دراسات عليا",
      "kindergarten": "حضانة",
      "infant_na": "لا ينطبق (رضيع)"
    },
    "disability": {
      "a_label": "إعاقة خفيفة",
      "a_desc": "لا تمنع العمل، لا تحتاج مرافق، لا أدوية (ضعف سمع بسيط، ضعف بصر قابل للتعديل، تشوه بسيط)",
      "b_label": "إعاقة متوسطة",
      "b_desc": "تؤثر على العمل جزئيًا، لا تحتاج مرافق، أدوية غير مكلفة (بتر جزئي، شلل جزئي، ضعف شديد في البصر)",
      "c_label": "إعاقة شديدة",
      "c_desc": "تمنع العمل، يعتمد على الغير في الحركة (شلل نصفي، إعاقة ذهنية، كفيف)",
      "d_label": "إعاقة كاملة",
      "d_desc": "غير قادر على الحركة ولا أي عمل، يحتاج مرافق دائم (شلل رباعي، تخلف عقلي شديد، ضمور كامل)"
    },
    "chronicSeverity": {
      "mild": "خفيف",
      "mild_desc": "لا يحتاج علاج مستمر",
      "moderate": "متوسط",
      "moderate_desc": "يحتاج أدوية غير مكلفة",
      "severe": "شديد",
      "severe_desc": "يحتاج علاج مكلف مستمر",
      "critical": "حرج",
      "critical_desc": "يحتاج عناية طبية دائمة"
    },
    "incomeFrequency": {
      "monthly": "شهري",
      "weekly": "أسبوعي",
      "daily": "يومي",
      "once": "مرة واحدة"
    },
    "gender": {
      "male": "ذكر",
      "female": "أنثى"
    },
    "marital": {
      "single_m": "أعزب",
      "married_m": "متزوج",
      "married_f": "متزوجة",
      "divorced_m": "مطلق",
      "divorced_f": "مطلقة",
      "widower": "أرمل",
      "widow": "أرملة",
      "single_f": "غير متزوجة"
    }
  },
  "form": {
    "section_basic": "البيانات الأساسية",
    "section_contact": "بيانات الاتصال",
    "section_financial": "البيانات المالية",
    "section_classification": "التصنيف والحالة",
    "section_aid": "المساعدة المقررة",
    "headName": "اسم رب الأسرة *",
    "headNamePh": "الاسم الرباعي",
    "wifeName": "اسم الزوجة",
    "wifeNamePh": "اسم الزوجة (يُستخدم لتسمية ملف PDF)",
    "nationalId": "الرقم القومي لرب الأسرة *",
    "nationalIdPh": "14 رقم",
    "wifeNationalId": "الرقم القومي للزوجة",
    "phone": "رقم الهاتف الأساسي *",
    "phonePh": "01xxxxxxxxx",
    "phone2": "رقم هاتف بديل",
    "address": "العنوان بالتفصيل *",
    "addressPh": "الشارع، الحي، المدينة، المحافظة",
    "housingType": "نوع السكن *",
    "housingPlaceholder": "اختر نوع السكن",
    "meezaCard": "رقم بطاقة ميزة (فيزا)",
    "meezaPh": "رقم البطاقة (16 رقم)",
    "meezaHint": "رقم البطاقة المستخدمة لصرف المساعدات عبر البنك",
    "category": "تصنيف الحالة *",
    "categoryPh": "اختر التصنيف",
    "aidDecision": "قرار المساعدة *",
    "aidDecisionPh": "نوع المساعدة",
    "categoryReason": "سبب التصنيف *",
    "categoryReasonPh": "اكتب سبب تصنيف هذه الأسرة في هذه الفئة…",
    "monthlyAidAmount": "مبلغ المساعدة الشهرية (ج.م)",
    "monthlyAidPlaceholder": "الحد الأقصى 4 أرقام",
    "notes": "ملاحظات",
    "notesPh": "ملاحظات إضافية",
    "pdfName": "اسم ملف PDF",
    "pdfNamePh": "عادةً يكون اسم الزوجة",
    "pdfNameHint": "اسم الزوجة لأنها الأكثر ترددًا على الجمعية",
    "monthlyAidHint": "المبلغ لا يتجاوز 9999 ج.م (4 أرقام) للتوافق مع نظام البنك",
    "fieldResearchTitle": "تم إجراء بحث ميداني",
    "fieldResearchHint": "هل تم إرسال متطوع لزيارة الأسرة؟",
    "dataVerifiedTitle": "تم التحقق من البيانات",
    "dataVerifiedHint": "هل تم مراجعة المستندات وتأكيد صحة البيانات؟",
    "fieldResearch": "اكتمال البحث الميداني",
    "dataVerified": "توثيق البيانات",
    "submitAdd": "تسجيل الأسرة",
    "submitEdit": "حفظ التعديلات",
    "saving": "جاري الحفظ…",
    "toast_edit_ok": "تم تعديل الأسرة وحفظها بنجاح",
    "toast_add_ok": "تم تسجيل الأسرة بنجاح",
    "toast_edit_err": "حدث خطأ أثناء تعديل الأسرة.",
    "toast_add_err": "حدث خطأ أثناء تسجيل الأسرة."
  }
}
````

<!-- SOURCE: frontend/messages/en/families.json -->
``json
{
  "list": {
    "title": "Families",
    "subtitle": "Manage registered families ({count})",
    "familyUnit": "families",
    "addFamily": "Add family",
    "dialogAdd": "Add new family",
    "dialogEdit": "Edit family details",
    "searchPlaceholder": "Search by name, national ID, or phone…",
    "filterClassification": "Classification",
    "classificationAll": "All classifications",
    "table": {
      "headName": "Head of household",
      "nationalId": "National ID",
      "phone": "Phone",
      "members": "Household size",
      "totalIncome": "Total income",
      "vulnerabilityIndex": "Vulnerability index",
      "classification": "Classification",
      "actions": "Actions"
    },
    "loading": "Loading data…",
    "empty": "No matching results",
    "deleteConfirm": "Delete this family?",
    "deleteSuccess": "Family deleted",
    "currency": "EGP",
    "percent": "%",
    "pagination": "{from}–{to} of {total}",
    "sr": {
      "view": "View",
      "edit": "Edit",
      "delete": "Delete"
    }
  },
  "detail": {
    "notFoundTitle": "Family not found",
    "notFoundBody": "This family does not exist in the system.",
    "backToList": "Back to list",
    "backSr": "Back"
  },
  "profile": {
    "misc": {
      "tier": "Class {code}",
      "points": "points"
    },
    "tabs": {
      "basicInfo": "Basic Info",
      "members": "Members",
      "income": "Income",
      "expenses": "Expenses",
      "medical": "Medical Record",
      "scoring": "Evaluation Result"
    },
    "basicInfo": {
      "title": "Basic Information",
      "verified": "Verified",
      "fieldResearch": "Field Research",
      "familyData": "Family Data",
      "headName": "Head Name",
      "wifeName": "Wife Name",
      "nationalId": "National ID",
      "wifeNationalId": "Wife National ID",
      "phone": "Phone",
      "phone2": "Alt Phone",
      "address": "Address",
      "registrationDate": "Registration Date",
      "membersCount": "Members Count",
      "membersSuffix": "members",
      "financialData": "Financial & Admin Data",
      "meezaCard": "Meeza Card No.",
      "notRegistered": "Not Registered",
      "classification": "Classification",
      "caseCategory": "Case Category",
      "categoryReason": "Classification Reason",
      "aidDecision": "Aid Decision",
      "monthlyAid": "Monthly Aid Amount",
      "fieldResearchNotes": "Field Research Notes",
      "generalNotes": "General Notes"
    },
    "members": {
      "title": "Family Members",
      "addMember": "Add Member",
      "dialogTitle": "Add New Member",
      "emptyState": "No members registered yet",
      "deleteSuccess": "Member deleted",
      "addSuccess": "Member added successfully",
      "addError": "Failed to add member",
      "saveMember": "Save Member",
      "fullName": "Full Name",
      "fullNamePh": "Full name",
      "nationalId": "National ID",
      "nationalIdPh": "14 digits",
      "relation": "Relationship",
      "selectPh": "Select",
      "birthDate": "Date of Birth",
      "gender": "Gender",
      "education": "Education Level",
      "job": "Job / Occupation",
      "jobPh": "Student, worker, housewife...",
      "jobIncome": "Job Income (EGP)",
      "maritalStatus": "Marital Status",
      "hasDisability": "Has a disability?",
      "disabilityClass": "Disability Classification",
      "selectClass": "Select class",
      "disabilityDesc": "Disability Description",
      "disabilityDescPh": "Detailed description...",
      "hasChronicIllness": "Has a chronic illness?",
      "illnessName": "Illness Name",
      "illnessNamePh": "e.g. Diabetes, Hypertension...",
      "severity": "Severity",
      "notes": "Notes",
      "notesPh": "Additional notes...",
      "male": "Male",
      "female": "Female",
      "disability": "Disability",
      "chronicIllness": "Chronic Illness",
      "years": "years",
      "noJob": "Unemployed",
      "notRegistered": "Not registered",
      "noIncome": "No income",
      "currentJob": "Current Job"
    },
    "income": {
      "title": "Income Sources",
      "addIncome": "Add Income",
      "dialogTitle": "Add Income Source",
      "emptyState": "No income sources registered",
      "addSuccess": "Income source added",
      "addError": "Failed to add income source",
      "source": "Income Source",
      "sourcePh": "Select source",
      "amount": "Amount (EGP)",
      "frequency": "Frequency",
      "verified": "Verified",
      "save": "Save",
      "total": "Total Income",
      "currency": "EGP",
      "monthly": "Monthly",
      "daily": "Daily",
      "weekly": "Weekly",
      "seasonal": "Seasonal",
      "deleteSuccess": "Income source deleted"
    },
    "expenses": {
      "title": "Expenses",
      "addExpense": "Add Expense",
      "dialogTitle": "Add Expense",
      "emptyState": "No expenses registered",
      "addSuccess": "Expense added",
      "addError": "Failed to add expense",
      "category": "Category",
      "categoryPh": "Select category",
      "amount": "Amount (EGP)",
      "frequency": "Frequency",
      "notes": "Notes",
      "save": "Save",
      "total": "Total Expenses",
      "netBalance": "Net Balance",
      "currency": "EGP",
      "deleteSuccess": "Expense deleted"
    },
    "medical": {
      "title": "Medical Records",
      "addRecord": "Add Record",
      "dialogTitle": "Add Medical Record",
      "emptyState": "No medical records",
      "addSuccess": "Record added",
      "addError": "Failed to add record",
      "patientName": "Patient Name",
      "diagnosis": "Diagnosis",
      "hospital": "Hospital / Clinic",
      "monthlyCost": "Monthly Cost (EGP)",
      "notes": "Notes",
      "save": "Save",
      "totalCost": "Total Monthly Medical Cost",
      "currency": "EGP",
      "deleteSuccess": "Record deleted",
      "personRequired": "Patient name is required",
      "conditionType": "Condition Type",
      "typechronic": "Chronic Illness",
      "typedisability": "Disability",
      "typetemp_injury": "Temporary Injury",
      "typesurgery": "Surgery",
      "diagnosisPh": "Enter diagnosis details",
      "treatment": "Treatment / Medication",
      "treatmentPh": "e.g., Insulin, Physical Therapy",
      "startDate": "Start Date",
      "hospitalPh": "Enter hospital name",
      "needsFollowup": "Needs continuous follow-up",
      "followup": "Follow-up"
    },
    "scoring": {
      "title": "Scoring Breakdown",
      "vulnerabilityIndex": "Vulnerability Index",
      "classificationTitle": "Vulnerability Index & Classification",
      "recalculate": "Recalculate Score",
      "recalculating": "Recalculating...",
      "aidDecision": "Aid Decision",
      "monthlyAid": "monthly",
      "currency": "EGP",
      "membersChronicTitle": "Chronic Illness Points (from members)",
      "membersChronicTotal": "Total Chronic Points",
      "medicalRecordsScore": "Medical Records Score",
      "outOfPriority": "Out of Priority (0%)",
      "moderate": "Moderate (15%)",
      "weak": "Weak (30%)",
      "fragile": "Fragile (50%+)",
      "descCritical": "This family is in urgent need of material and in-kind support",
      "descFragile": "This family is fragile and needs continuous support and follow-up",
      "descWeak": "This family is weak and needs support and monitoring",
      "descModerate": "This family needs seasonal assistance and follow-up",
      "descOutOfPriority": "This family is currently out of priority",
      "financialSummary": "Financial Summary",
      "totalIncome": "Total Income",
      "totalExpenses": "Total Expenses",
      "medicalCost": "Medical Cost",
      "netBalance": "Net Balance",
      "monthlyAidApproved": "Approved Monthly Aid",
      "disabilityPointsTitle": "Disability Points (from members)",
      "disabilityPointsTotal": "Total Disability Points",
      "recalculateSuccess": "Score recalculated successfully",
      "recalculateError": "Failed to recalculate score",
      "systemRecommendation": "System Recommendation",
      "humanDecision": "Human Decision",
      "reviewStatus": "Review Status",
      "pointsOutOf100": "points out of 100",
      "vulnerabilityScore": "Vulnerability Score",
      "reductionScore": "Reduction Score",
      "confidenceScore": "Confidence Score",
      "fraudRiskScore": "Fraud Risk Score",
      "warning": "Warning",
      "recommendation": "Recommendation",
      "layerBreakdown": "Layer Breakdown",
      "points": "points",
      "rulesTriggered": "rules triggered",
      "noRulesTriggered": "No rules triggered in this layer",
      "noBreakdownAvailable": "Breakdown data not available",
      "layer_L1": "L1: Family Composition",
      "layer_L2": "L2: Income Assessment",
      "layer_L3": "L3: Housing & Assets",
      "layer_L4": "L4: Health & Disability",
      "layer_L5": "L5: Education",
      "layer_L6": "L6: Social Status",
      "layer_L7": "L7: Reduction Engine",
      "layer_L8": "L8: Confidence Engine",
      "FIELD_REVIEW_NEEDED": "Field review and verification needed",
      "FRAUD_INVESTIGATION_NEEDED": "Fraud investigation needed to clarify contradictions",
      "URGENT_ASSISTANCE_RECOMMENDED": "Urgent assistance recommended",
      "PRIORITY_ASSISTANCE_RECOMMENDED": "Priority assistance recommended"
    }
  },
  "housing": {
    "RENT": "Rented",
    "OWNED": "Owned",
    "SHARED": "Shared / family"
  },
  "dictionaries": {
    "incomeSources": {
      "daily_work": "Daily labor",
      "freelance": "Freelance",
      "fixed_salary": "Fixed salary",
      "pension": "Insurance pension",
      "takafol": "Takaful & Karama",
      "family_aid_1": "Family aid 1",
      "family_aid_2": "Family aid 2",
      "family_aid_3": "Family aid 3",
      "charity_aid_1": "Charity aid 1",
      "charity_aid_2": "Charity aid 2",
      "monthly_food_aid": "Monthly food aid",
      "project_income": "Income from projects",
      "real_estate_income": "Income from property",
      "children_support": "Working children support",
      "husband_income_activity": "Income activity (husband)",
      "wife_income_activity": "Income activity (wife)",
      "ration_card": "Ration card",
      "smoking_deterrent": "Daily smoking × 30 (deterrent)",
      "other": "Other"
    },
    "expenseCategories": {
      "rent": "Housing rent",
      "installments": "Installments",
      "food": "Food",
      "utilities": "Electricity, water & gas",
      "transport": "Transport",
      "medical": "Treatment & medicine",
      "education": "School expenses",
      "clothing": "Clothing",
      "household": "Household supplies",
      "communications": "Communications",
      "debts": "Outstanding debts",
      "other": "Other"
    },
    "caseCategories": {
      "orphans": "Orphan families",
      "divorced": "Divorced women",
      "poor": "Poor",
      "needy": "Needy",
      "disability": "Disability families",
      "student": "Student",
      "prisoner": "Prisoner families",
      "elderly": "Elderly",
      "absence": "Abandonment / missing spouse",
      "chronic": "Chronic illness",
      "temporary_injury": "Temporary injury",
      "widows": "Widows",
      "ineligible": "Not eligible"
    },
    "aidDecisions": {
      "monthly_material": "Monthly material aid",
      "monthly_medical": "Monthly medical aid",
      "seasonal_food": "Seasonal food aid",
      "seasonal_material": "Seasonal material aid",
      "seasonal_both": "Seasonal food & material aid",
      "none": "Not eligible"
    },
    "memberRelations": {
      "head": "Head of household",
      "wife": "Wife",
      "son": "Son",
      "daughter": "Daughter",
      "mother": "Mother",
      "father": "Father",
      "brother": "Brother",
      "sister": "Sister",
      "grandson": "Grandson",
      "granddaughter": "Granddaughter",
      "other_relative": "Other relative"
    },
    "educationLevels": {
      "illiterate": "Illiterate",
      "literate": "Literate",
      "primary": "Primary",
      "preparatory": "Preparatory",
      "secondary": "General secondary",
      "technical_secondary": "Technical secondary",
      "diploma": "Diploma",
      "university": "University",
      "postgraduate": "Postgraduate",
      "kindergarten": "Kindergarten",
      "infant_na": "Not applicable (infant)"
    },
    "disability": {
      "a_label": "Mild disability",
      "a_desc": "Does not prevent work; no attendant; no costly medication (mild hearing/vision, minor deformity)",
      "b_label": "Moderate disability",
      "b_desc": "Partially affects work; no attendant; inexpensive medication (partial amputation, partial paralysis, severe vision loss)",
      "c_label": "Severe disability",
      "c_desc": "Prevents work; depends on others for mobility (hemiplegia, intellectual disability, blind)",
      "d_label": "Profound disability",
      "d_desc": "Unable to move or work; needs full-time care (quadriplegia, severe intellectual disability, full atrophy)"
    },
    "chronicSeverity": {
      "mild": "Mild",
      "mild_desc": "No continuous treatment",
      "moderate": "Moderate",
      "moderate_desc": "Inexpensive medication",
      "severe": "Severe",
      "severe_desc": "Costly continuous treatment",
      "critical": "Critical",
      "critical_desc": "Needs permanent medical care"
    },
    "incomeFrequency": {
      "monthly": "Monthly",
      "weekly": "Weekly",
      "daily": "Daily",
      "once": "One-time"
    },
    "gender": {
      "male": "Male",
      "female": "Female"
    },
    "marital": {
      "single_m": "Single (male)",
      "married_m": "Married (male)",
      "married_f": "Married (female)",
      "divorced_m": "Divorced (male)",
      "divorced_f": "Divorced (female)",
      "widower": "Widower",
      "widow": "Widow",
      "single_f": "Single (female)"
    }
  },
  "form": {
    "section_basic": "Basic information",
    "section_contact": "Contact details",
    "section_financial": "Financial details",
    "section_classification": "Classification & status",
    "section_aid": "Approved assistance",
    "headName": "Head of household name *",
    "headNamePh": "Full name",
    "wifeName": "Wife's name",
    "wifeNamePh": "Wife's name (used for PDF naming)",
    "nationalId": "Head national ID *",
    "nationalIdPh": "14 digits",
    "wifeNationalId": "Wife national ID",
    "phone": "Primary phone *",
    "phonePh": "01xxxxxxxxx",
    "phone2": "Alternate phone",
    "address": "Full address *",
    "addressPh": "Street, district, city, governorate",
    "housingType": "Housing type *",
    "housingPlaceholder": "Select housing type",
    "meezaCard": "Meeza card number (Visa)",
    "meezaPh": "Card number (16 digits)",
    "meezaHint": "Card used for bank disbursements",
    "category": "Case category *",
    "categoryPh": "Select category",
    "aidDecision": "Aid decision *",
    "aidDecisionPh": "Aid type",
    "categoryReason": "Reason for classification *",
    "categoryReasonPh": "Why this family fits this category…",
    "monthlyAidAmount": "Monthly aid amount (EGP)",
    "monthlyAidPlaceholder": "0–9999",
    "notes": "Notes",
    "notesPh": "Optional notes",
    "pdfName": "PDF file name",
    "pdfNamePh": "Usually the wife's name",
    "pdfNameHint": "The wife's name is used most often at the charity",
    "monthlyAidHint": "Maximum 9999 EGP (4 digits) for bank system compatibility",
    "fieldResearchTitle": "Field research done",
    "fieldResearchHint": "Was a volunteer sent to visit the family?",
    "dataVerifiedTitle": "Data verified",
    "dataVerifiedHint": "Were documents reviewed and data confirmed?",
    "fieldResearch": "Field research completed",
    "dataVerified": "Data verified",
    "submitAdd": "Register family",
    "submitEdit": "Save changes",
    "saving": "Saving…",
    "toast_edit_ok": "Family updated successfully",
    "toast_add_ok": "Family registered successfully",
    "toast_edit_err": "Could not update family.",
    "toast_add_err": "Could not register family."
  }
}
````

<!-- SOURCE: frontend/messages/ar/volunteers.json -->
``json
{
  "title": "المتطوعين",
  "subtitle": "إدارة فريق المتطوعين والمهام",
  "addVolunteer": "إضافة متطوع",
  "toastComingSoon": "ميزة إضافة متطوع قيد التطوير",
  "searchPlaceholder": "بحث بالاسم أو المنطقة أو الهاتف…",
  "tasksCount": "{count} مهمة",
  "status": {
    "active": "نشط",
    "inactive": "غير نشط"
  },
  "specialty": {
    "field": "أبحاث ميدانية",
    "data": "إدخال بيانات",
    "medical": "صرف علاج",
    "education": "متابعة تعليمية"
  },
  "demo": {
    "v5_name": "محمد إبراهيم علي",
    "v1_area": "المنصورة",
    "v2_area": "طنطا",
    "v3_area": "دمنهور",
    "v4_area": "كفر الشيخ",
    "v5_area": "الزقازيق",
    "v6_area": "بنها"
  }
}
````

<!-- SOURCE: frontend/messages/en/volunteers.json -->
``json
{
  "title": "Volunteers",
  "subtitle": "Manage the volunteer team and assignments",
  "addVolunteer": "Add volunteer",
  "toastComingSoon": "Adding volunteers is not available yet.",
  "searchPlaceholder": "Search by name, area, or phone…",
  "tasksCount": "{count} tasks",
  "status": {
    "active": "Active",
    "inactive": "Inactive"
  },
  "specialty": {
    "field": "Field research",
    "data": "Data entry",
    "medical": "Medical disbursement",
    "education": "Education follow-up"
  },
  "demo": {
    "v5_name": "Mohamed Ibrahim Ali",
    "v1_area": "Mansoura",
    "v2_area": "Tanta",
    "v3_area": "Damanhur",
    "v4_area": "Kafr El Sheikh",
    "v5_area": "Zagazig",
    "v6_area": "Banha"
  }
}
````

## SECTION 4 - Schema and API Changes
### Full Current Prisma Schema
<!-- SOURCE: backend/prisma/schema.prisma -->
``prisma
// =============================================================================
// Social Assistance Targeting Platform — Phase 1 Schema
// Single source of truth. Decimal for all scores/weights/monetary values.
// =============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── CRITICAL ─────────────────────────────────────────────────────
// Use Decimal for ALL weights, scores, and monetary values.
// Never use Float for anything that affects scoring calculations.
// ─────────────────────────────────────────────────────────────────

// ════ EDUCATION MODULE ═══════════════════════════════════════

enum GradeInputType {
  LETTER
  NUMERIC
}

enum LetterGrade {
  FAIL
  PASS
  GOOD
  VERY_GOOD
  EXCELLENT
}

enum QuranInstitute {
  IBN_MASOOD
  UQBA_BIN_AAMER
  DESOUKI_MOSQUE
  SHARIA_SOCIETY
  IQRAA
  OTHER
}

// ════ ENUMS ══════════════════════════════════════════════════════

enum Gender {
  MALE
  FEMALE
}

enum MaritalStatus {
  MARRIED
  DIVORCED
  WIDOWED
  SINGLE
  WIDOWED_MARRIED
  SINGLE_OTHER
}

enum ResidencyStatus {
  RESIDENT
  ABSENT_DEATH
  ABSENT_PRISON
  ABSENT_DIVORCE
  ABSENT_OTHER
}

enum EmploymentType {
  NONE
  WEAK
  SEASONAL
  REGULAR
  ABROAD_WEAK
  ABROAD_MEDIUM
  ABROAD_REGULAR
}

enum EmploymentQuality {
  SUFFICIENT
  UNSTABLE
  WEAK
}

enum EducationLevel {
  ILLITERATE
  MEDIUM
  HIGHER_LIMITED
  HIGHER_STABLE
}

enum StudentLevel {
  NONE
  KINDERGARTEN
  PRIMARY
  PREPARATORY
  SECONDARY_GENERAL
  SECONDARY_INDUSTRIAL_COMMERCIAL_BOYS
  SECONDARY_INDUSTRIAL_COMMERCIAL_GIRLS
  UNIVERSITY_SCIENTIFIC
  UNIVERSITY_THEORETICAL
  SPECIAL_EDUCATION
}

enum PersonRole {
  HEAD
  SPOUSE
  CHILD
  DEPENDENT_ADULT
  INDEPENDENT
  OTHER
}

enum AlimonyStatus {
  FORMAL
  INFORMAL_SUFFICIENT
  INFORMAL_INSUFFICIENT
  NONE
}

enum PrisonTerm {
  SHORT
  MEDIUM
  LONG
}

enum HousingType {
  OWNED
  SHARED
  DONATED_RENT
  RENTED
}

enum SeverityGrade {
  A
  B
  C
  D
  E
  F
}

enum DiseaseTreatmentCost {
  NONE
  PERIODIC_CHEAP
  PERIODIC_EXPENSIVE
  VERY_EXPENSIVE
}

enum DiseaseFollowup {
  NONE_OR_RARE
  REGULAR
  EXPENSIVE
}

enum DiseaseWorkImpact {
  NONE
  MINOR
  MAJOR_WORKS
  CANNOT_WORK
}

enum DisabilityWorkImpact {
  NONE
  LIMITED
  SPECIAL_WORK
  CANNOT_WORK
}

enum DisabilityCompanion {
  NONE
  OUTSIDE_ONLY
  FULLY_DEPENDENT
}

enum BurdenType {
  DEBT
  INJURY
  SURGERY
  BRIDE
  SON_IN_PRISON
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
}

enum IncomeChannel {
  PENSION
  TAKAFUL_KARAMA
  CHARITY_1
  CHARITY_2
  CHARITY_3
  DONOR_1
  DONOR_2
  ALIMONY
}

enum EligibilityLevel {
  CRITICAL
  HIGH_NEED
  MODERATE_NEED
  LOW_NEED
  NOT_ELIGIBLE
}

enum HumanDecision {
  PENDING
  APPROVED
  REJECTED
  NEEDS_REVIEW
  ESCALATED
}

enum ReviewStatus {
  AWAITING_SCORE
  SCORE_READY
  UNDER_REVIEW
  FIELD_VISIT_REQUIRED
  DECIDED
}

enum UserRole {
  ADMIN
  SUPERVISOR
  WORKER
  VIEWER
}

enum Locale {
  AR
  EN
}

enum MedicalAidType {
  TREATMENT     // علاج — cooldown عام 30/40 يوم، سقف 800/400
  LAB_TEST      // تحاليل — قيمة فعلية
  IMAGING       // أشعة — قيمة فعلية
  CONSULTATION  // كشف طبي — افتراضي 200 ج.م.، قابل للتعديل
  SURGERY       // عملية — % من التكلفة، موافقة مشرف دائماً
  FINANCIAL_AID // إعانة مادية
  MARRIAGE_AID  // إعانة زواج — مرة واحدة / شخص، سقف 70000
}

enum MedicalDisbursementStatus {
  PENDING   // انتظار توثيق المشرف
  APPROVED  // موافقة المشرف
  PAID      // تم الصرف
  REJECTED  // مرفوض
}

// ════ MODELS ═════════════════════════════════════════════════════

model User {
  id                   String         @id @default(cuid())
  name                 String
  nameAr               String?
  email                String         @unique
  passwordHash         String
  role                 UserRole       @default(WORKER)
  preferredLocale      Locale         @default(AR)
  active               Boolean        @default(true)
  assignedGovernorate  String?
  assignedDistrict     String?
  customPermissions    String[]       @default([])
  mustChangePassword   Boolean        @default(false)
  passwordResetRequest Boolean        @default(false)
  passwordResetAt      DateTime?
  lastLoginAt          DateTime?
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  households           Household[]    @relation("CreatedBy")
  auditLogs            AuditLog[]
  decisions            ScoreResult[]  @relation("DecidedBy")
  decidedHouseholds    Household[]    @relation("HouseholdDecidedBy")
  refreshTokens        RefreshToken[]
  notifications        Notification[] @relation("UserNotifications")
  householdNotes       HouseholdNote[]
  medicalCasesCreated          MedicalCase[]
  medicalDisbursementsApproved MedicalDisbursement[]  @relation("MedicalApprover")
  medicalDisbursementsCreated  MedicalDisbursement[]  @relation("MedicalCreator")
  disbursementsCreated         DisbursementMonth[]    @relation("DisbursementCreatedBy")
  disbursementsLocked          DisbursementMonth[]    @relation("DisbursementLockedBy")
  disbursementsReopened        DisbursementMonth[]    @relation("DisbursementReopenedBy")
  paymentsAdjusted             MonthlyPayment[]       @relation("PaymentAdjustedBy")

  @@index([email])
  @@index([role])
  @@index([assignedGovernorate, assignedDistrict])
  @@index([passwordResetRequest])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  type      String   @default("info")
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, read])
  @@index([createdAt])
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  createdAt DateTime  @default(now())
  revokedAt DateTime?

  @@index([userId])
  @@index([expiresAt])
}

model Household {
  id               String            @id @default(cuid())
  code             String            @unique
  familyName       String?
  governorate      String
  district         String
  village          String
  address          String?
  primaryPhone     String?
  secondaryPhone   String?
  backupPhone      String?
  whatsappPhone    String?
  socialStatus     String?
  divorceYear      Int?
  divorceDocNumber String?
  marriageCount    Int?
  deathCertNumber  String?
  deathDate        DateTime?
  addressRegion    String?
  addressStreet    String?
  addressDetails   String?
  registrationDate DateTime?
  searchType       String?           @default("office")
  isModest         Boolean           @default(false)
  officeDealings   Boolean           @default(false)
  fieldNotes       String?
  housingType      HousingType       @default(OWNED)
  hasRationCard    Boolean           @default(true)
  hasFamilySupport Boolean           @default(false)
  hasFoodAid       Boolean           @default(false)
  bankAssetGrade   SeverityGrade?
  notes            String?
  pdfUrl           String?
  pastSpouses      Json?
  isDraft          Boolean           @default(true)
  lastDraftSavedAt DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  createdById      String
  createdBy        User              @relation("CreatedBy", fields: [createdById], references: [id])
  humanDecision    HumanDecision     @default(PENDING)
  reviewStatus     ReviewStatus      @default(SCORE_READY)
  decisionNote     String?
  decidedById      String?
  decidedBy        User?             @relation("HouseholdDecidedBy", fields: [decidedById], references: [id])
  decidedAt        DateTime?
  classificationTag String?
  persons          Person[]
  incomeSources    IncomeSource[]
  temporaryBurdens TemporaryBurden[]
  scoreResults     ScoreResult[]
  auditLogs        AuditLog[]
  academicRecords  StudentAcademicRecord[]
  notesArray       HouseholdNote[]
  hasMerge             Boolean           @default(false)
  meezaCardNumber      String?
  medicalCases         MedicalCase[]
  medicalDisbursements MedicalDisbursement[]
  externalContributions ExternalContribution[]
  monthlyPayments      MonthlyPayment[]

  @@index([governorate, district])
  @@index([isDraft])
  @@index([createdById])
  @@index([code])
}

model HouseholdNote {
  id          String    @id @default(cuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  content     String
  createdAt   DateTime  @default(now())

  @@index([householdId])
  @@index([userId])
  @@index([createdAt])
}

model Person {
  id                String             @id @default(cuid())
  householdId       String
  household         Household          @relation(fields: [householdId], references: [id], onDelete: Cascade)
  name              String
  nationalId        String?
  gender            Gender
  birthDate         DateTime
  role              PersonRole
  maritalStatus     MaritalStatus      @default(SINGLE)
  residencyStatus   ResidencyStatus    @default(RESIDENT)
  isHead            Boolean            @default(false)
  isStudent         Boolean            @default(false)
  studentLevel      StudentLevel?
  isSpecialEducation Boolean           @default(false)
  employmentType    EmploymentType     @default(NONE)
  employmentQuality EmploymentQuality?
  educationLevel    EducationLevel     @default(ILLITERATE)
  alimonyStatus     AlimonyStatus?
  isSonContributor  Boolean            @default(false)
  sonMarried        Boolean            @default(false)
  sonSameHouse      Boolean            @default(true)
  isBride           Boolean            @default(false)
  brideHasSponsor   Boolean            @default(false)
  isPrisoner        Boolean            @default(false)
  prisonTerm        PrisonTerm?
  prisonSuspicion   String?
  isOrphan          Boolean            @default(false)
  isDisplaced       Boolean            @default(false)
  relationship      String?
  notes             String?
  diseases          Disease[]
  disabilities      Disability[]
  academicRecords   StudentAcademicRecord[]
  medicalCases        MedicalCase[]
  medicalDisbursements MedicalDisbursement[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  @@index([householdId])
  @@index([isHead])
  @@index([role])
  @@index([isStudent])
}

model Disease {
  id            String               @id @default(cuid())
  personId      String
  person        Person               @relation(fields: [personId], references: [id], onDelete: Cascade)
  name          String
  treatmentCost DiseaseTreatmentCost @default(NONE)
  followup      DiseaseFollowup      @default(NONE_OR_RARE)
  workImpact    DiseaseWorkImpact    @default(NONE)
  createdAt     DateTime             @default(now())

  @@index([personId])
}

model Disability {
  id            String               @id @default(cuid())
  personId      String
  person        Person               @relation(fields: [personId], references: [id], onDelete: Cascade)
  description   String
  workImpact    DisabilityWorkImpact @default(NONE)
  companion     DisabilityCompanion  @default(NONE)
  treatmentCost DiseaseTreatmentCost @default(NONE)
  createdAt     DateTime             @default(now())

  @@index([personId])
}

model TemporaryBurden {
  id          String         @id @default(cuid())
  householdId String
  household   Household      @relation(fields: [householdId], references: [id], onDelete: Cascade)
  type        BurdenType
  grade       SeverityGrade?
  description String?
  createdAt   DateTime       @default(now())

  @@index([householdId])
}

model IncomeSource {
  id               String             @id @default(cuid())
  householdId      String
  household        Household          @relation(fields: [householdId], references: [id], onDelete: Cascade)
  channel          IncomeChannel
  monthlyAmount    Decimal            @db.Decimal(10, 2)
  verified         VerificationStatus @default(UNVERIFIED)
  verificationNote String?
  verifiedAt       DateTime?
  verifiedById     String?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@unique([householdId, channel])
  @@index([householdId])
  @@index([verified])
  @@index([channel, verified])
}

model MedicalCase {
  id                   String    @id @default(cuid())
  householdId          String
  personId             String
  conditionName        String
  isCritical           Boolean   @default(false)
  isActive             Boolean   @default(true)
  estimatedMonthlyCost Decimal?  @db.Decimal(10,2)
  doctorName           String?
  hospitalName         String?
  startDate            DateTime?
  notes                String?
  createdById          String
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  household     Household             @relation(fields: [householdId], references: [id], onDelete: Cascade)
  person        Person                @relation(fields: [personId], references: [id], onDelete: Cascade)
  createdBy     User                  @relation(fields: [createdById], references: [id])
  disbursements MedicalDisbursement[]

  @@index([householdId])
  @@index([personId])
}

model MedicalDisbursement {
  id                String                  @id @default(cuid())
  householdId       String
  personId          String
  medicalCaseId     String?
  aidType           MedicalAidType
  amount            Decimal                 @db.Decimal(10,2)
  totalCost         Decimal?                @db.Decimal(10,2)
  coveragePercent   Decimal?                @db.Decimal(5,2)
  isCriticalOverride Boolean               @default(false)
  isRetroactive     Boolean                @default(false)
  disbursementDate  DateTime               @default(now())
  status            MedicalDisbursementStatus @default(PENDING)
  approvedById      String?
  approvedAt        DateTime?
  notes             String?
  createdById       String
  createdAt         DateTime               @default(now())

  household   Household    @relation(fields: [householdId], references: [id], onDelete: Cascade)
  person      Person       @relation(fields: [personId], references: [id])
  medicalCase MedicalCase? @relation(fields: [medicalCaseId], references: [id])
  approvedBy  User?        @relation("MedicalApprover", fields: [approvedById], references: [id])
  createdBy   User         @relation("MedicalCreator", fields: [createdById], references: [id])

  @@index([householdId])
  @@index([personId])
  @@index([disbursementDate])
  @@index([status])
}

model ScoreResult {
  id           String    @id @default(cuid())
  householdId  String
  household    Household @relation(fields: [householdId], references: [id])
  calculatedAt DateTime  @default(now())

  engineVersion   String
  ruleVersion     String
  weightsSnapshot Json

  vulnerabilityScore Decimal @db.Decimal(8, 4)
  reductionScore     Decimal @db.Decimal(8, 4)
  confidenceScore    Decimal @db.Decimal(4, 3)
  fraudRiskScore     Decimal @db.Decimal(4, 3)

  finalScore        Decimal @db.Decimal(8, 4)
  normalizedPercent Decimal @db.Decimal(6, 3)

  systemRecommendation EligibilityLevel
  humanDecision        HumanDecision    @default(PENDING)
  reviewStatus         ReviewStatus     @default(SCORE_READY)
  decisionNote         String?
  classificationTag    String?
  assistanceType       String?
  decidedById          String?
  decidedBy            User?            @relation("DecidedBy", fields: [decidedById], references: [id])
  decidedAt            DateTime?

  previousScore Decimal? @db.Decimal(8, 4)
  scoreDelta    Decimal? @db.Decimal(8, 4)

  calculationSnapshot Json
  layerBreakdown      Json
  topPositiveFactors  Json
  topNegativeFactors  Json
  recommendations     Json
  warnings            Json
  rawInputSnapshot    Json

  @@index([householdId])
  @@index([calculatedAt])
  @@index([systemRecommendation])
  @@index([humanDecision])
  @@index([householdId, calculatedAt])
  @@index([calculatedAt, systemRecommendation])
}

model RuleOverride {
  id            String    @id @default(cuid())
  ruleId        String    @unique
  overrideValue Decimal   @db.Decimal(6, 3)
  reason        String
  active        Boolean   @default(true)
  setById       String
  setAt         DateTime  @default(now())
  expiresAt     DateTime?

  @@index([active])
  @@index([ruleId])
}

model AuditLog {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  householdId String?
  household   Household? @relation(fields: [householdId], references: [id])
  action      String
  entity      String
  entityId    String?
  fieldName   String?
  before      Json?
  after       Json?
  ip          String?
  userAgent   String?
  createdAt   DateTime   @default(now())

  @@index([householdId])
  @@index([userId])
  @@index([createdAt])
  @@index([entity, entityId])
}

model StudentAcademicRecord {
  id                   String         @id @default(cuid())
  personId             String
  person               Person         @relation(fields: [personId], references: [id], onDelete: Cascade)
  householdId          String
  household            Household      @relation(fields: [householdId], references: [id], onDelete: Cascade)
  academicYear         String
  studentLevel         StudentLevel
  isSpecialEducation   Boolean        @default(false)
  gradeYear            Int?
  schoolName           String?
  isRepeating          Boolean        @default(false)
  gradeInputType       GradeInputType @default(LETTER)
  subjects             Json           @default("[]")
  averageScore         Decimal?       @db.Decimal(5, 2)
  overallGrade         LetterGrade?
  quranJuzCount        Decimal?       @db.Decimal(4, 1)
  quranProgress        Decimal?       @db.Decimal(5, 2)
  quranLastSurah       String?
  quranCustomText      String?
  quranTeacher         String?
  quranInstitute       QuranInstitute?
  quranCustomInstitute String?
  quranGrade           Decimal?       @db.Decimal(5, 2)
  quranAttendancePercent Int?
  quranOverallScore    Decimal?       @db.Decimal(5, 2)
  totalScore           Decimal?       @db.Decimal(5, 2)
  notes                String?
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  createdById          String?

  @@unique([personId, academicYear])
  @@index([householdId])
  @@index([personId])
  @@index([academicYear])
  @@index([studentLevel])
  @@index([totalScore])
  @@index([quranProgress])
}

// ════ DISBURSEMENT MODULE ════════════════════════════════════════

enum MonthStatus {
  DRAFT
  CALCULATED
  APPROVED
  PAID
}

enum DisbursementMethod {
  VULNERABILITY
  PROPORTIONAL
  SCORE_BASED
}

enum FundSource {
  GENERAL
  ZAKAT
  SADAQA
  ORPHAN_FUND
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  CANCELLED
}

enum GrantType {
  MONTHLY
  ANNUAL
  PERIODIC
}

enum PaymentAuditTrigger {
  CALCULATE
  MANUAL_EDIT
  APPROVE
  REOPEN
  STATUS_CHANGE
}

// Category configuration (caps, limits per category code)
model CategoryConfig {
  id                  String   @id @default(cuid())
  code                String   @unique  // '1','2'...'10'
  nameAr              String
  nameEn              String
  active              Boolean  @default(true)
  maxAmount           Decimal? @db.Decimal(10, 2)   // base max
  maxPerChild         Decimal? @db.Decimal(10, 2)   // orphans: per child
  widowBonus          Decimal? @db.Decimal(10, 2)   // orphans: widow bonus
  baseMax             Decimal? @db.Decimal(10, 2)   // students/prisoners: base part
  perDepMax           Decimal? @db.Decimal(10, 2)   // per dependent
  poorScoreThreshold  Decimal? @db.Decimal(5, 2)    // cat 5: score threshold %
  capWithDeps         Decimal  @db.Decimal(10, 2)   // hard cap with dependents
  capNoDeps           Decimal  @db.Decimal(10, 2)   // hard cap without dependents
  updatedAt           DateTime @updatedAt
  updatedById         String?

  @@index([active])
  @@index([code])
}

// Grant/incentive configuration
model GrantConfig {
  id             String    @id @default(cuid())
  code           String    @unique
  nameAr         String
  nameEn         String
  active         Boolean   @default(true)
  type           GrantType @default(MONTHLY)
  amount         Decimal   @db.Decimal(10, 2)
  maxAmount      Decimal?  @db.Decimal(10, 2)  // ceiling when isPerUnit
  isPerUnit      Boolean   @default(false)      // multiply by orphans/deps count
  condition      String    // 'isOrphan' | 'hasStudents' | 'hasQuranStudents' | 'hasMerge'
  categoryFilter String?   // JSON array of category codes, null = all
  updatedAt      DateTime  @updatedAt

  @@index([active])
  @@index([type])
}

// External institution contributions per household per period
model ExternalContribution {
  id              String    @id @default(cuid())
  householdId     String
  household       Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  period          DateTime  // first day of month
  institutionName String
  amount          Decimal   @db.Decimal(10, 2)
  confirmed       Boolean   @default(false)
  notes           String?
  createdById     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([householdId, period, institutionName])
  @@index([householdId])
  @@index([period])
  @@index([householdId, period])
}

// Monthly disbursement session
model DisbursementMonth {
  id           String             @id @default(cuid())
  period       DateTime           // first day of month  e.g. 2026-06-01
  status       MonthStatus        @default(DRAFT)
  method       DisbursementMethod @default(VULNERABILITY)
  totalBudget  Decimal?           @db.Decimal(12, 2)  // required only for PROPORTIONAL
  scoreSum     Decimal?           @db.Decimal(10, 4)  // Σ normalizedPercent for PROPORTIONAL
  ratePerPoint Decimal?           @db.Decimal(8, 4)   // totalBudget ÷ scoreSum
  notes        String?
  createdById  String
  createdBy    User               @relation("DisbursementCreatedBy", fields: [createdById], references: [id])
  lockedAt     DateTime?
  lockedById   String?
  lockedBy     User?              @relation("DisbursementLockedBy", fields: [lockedById], references: [id])
  reopenedAt   DateTime?
  reopenedById String?
  reopenedBy   User?              @relation("DisbursementReopenedBy", fields: [reopenedById], references: [id])
  reopenReason String?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  payments     MonthlyPayment[]

  @@unique([period])
  @@index([status])
  @@index([period])
}

// Per-household payment record for a month
model MonthlyPayment {
  id                 String            @id @default(cuid())
  monthId            String
  month              DisbursementMonth @relation(fields: [monthId], references: [id], onDelete: Cascade)
  householdId        String
  household          Household         @relation(fields: [householdId], references: [id])

  // Snapshot & scoring
  householdSnapshot  Json              // frozen copy at calculation time
  category           String            // classificationTag at calc time
  autoSubCategory    String?           // 'POOR' | 'NEEDY' for cat 5
  normalizedPercent  Decimal           @db.Decimal(6, 3)
  dependentCount     Int               @default(0)
  orphanCount        Int               @default(0)
  totalIncome        Decimal           @db.Decimal(10, 2)
  isWidowNotRemarried Boolean          @default(false)

  // Amounts breakdown
  baseAmount         Decimal           @db.Decimal(10, 2)
  grantsBreakdown    Json              @default("[]")
  grantsTotal        Decimal           @db.Decimal(10, 2) @default(0)
  mergeBonus         Decimal           @db.Decimal(10, 2) @default(0)
  rawTotal           Decimal           @db.Decimal(10, 2)
  appliedCap         Decimal           @db.Decimal(10, 2)
  calculatedAmount   Decimal           @db.Decimal(10, 2)
  externalTotal      Decimal           @db.Decimal(10, 2) @default(0)
  compensationAmount Decimal           @db.Decimal(10, 2)

  // Manual override
  manualAdjustment   Decimal           @db.Decimal(10, 2) @default(0)
  adjustmentReason   String?
  adjustedById       String?
  adjustedBy         User?             @relation("PaymentAdjustedBy", fields: [adjustedById], references: [id])
  adjustedAt         DateTime?

  // Final amounts
  finalAmount        Decimal           @db.Decimal(10, 2)
  fundSource         FundSource        @default(GENERAL)

  // Payment channels
  meezaAmount        Decimal           @db.Decimal(10, 2) @default(0)
  meezaCardNumber    String?
  meezaStatus        PaymentStatus     @default(PENDING)
  cashAmount         Decimal           @db.Decimal(10, 2) @default(0)
  cashStatus         PaymentStatus     @default(PENDING)
  meezaPaidAt        DateTime?
  cashPaidAt         DateTime?

  notes              String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  audits             PaymentAudit[]

  @@unique([monthId, householdId])
  @@index([monthId])
  @@index([householdId])
  @@index([category])
  @@index([meezaStatus])
  @@index([cashStatus])
}

// Immutable audit trail for every payment change
model PaymentAudit {
  id          String             @id @default(cuid())
  paymentId   String
  payment     MonthlyPayment     @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  changedById String             // userId who triggered the change
  triggerType String             // CALCULATE | MANUAL_EDIT | APPROVE | REOPEN | STATUS_CHANGE
  oldAmount   Decimal?           @db.Decimal(10, 2)
  newAmount   Decimal?           @db.Decimal(10, 2)
  oldStatus   String?            // previous meezaStatus / cashStatus
  newStatus   String?            // updated meezaStatus / cashStatus
  reason      String?
  meta        Json?              // extra context
  createdAt   DateTime           @default(now())

  @@index([paymentId])
  @@index([triggerType])
  @@index([createdAt])
}

````

### Schema Diff Against Previous Context
| Change Type | Model/Enum | Field/Value | Description |
|---|---|---|---|
| Unknown | schema.prisma | Previous schema unavailable | Could not extract prior schema from PROJECT_BOOK_CONTEXT.md |

### New Migration Files Since Last Export
| Migration File | Date | Summary |
|---|---|---|
| backend/prisma/migrations/20260606000000_add_independent_person_role/migration.sql | 20260606000000 | SQL changes present; inspect copied migration |
| backend/prisma/migrations/20260606120000_move_decision_fields_to_household/migration.sql | 20260606120000 | ALTER TABLE x6 |
| backend/prisma/migrations/20260606123000_add_classification_tag_to_household/migration.sql | 20260606123000 | ALTER TABLE x1 |
| backend/prisma/migrations/add_notifications.sql | manual/unversioned | CREATE TABLE x1; ALTER TABLE x1; CREATE INDEX x2 |
| backend/prisma/migrations/pending.sql | manual/unversioned | SQL changes present; inspect copied migration |

<!-- SOURCE: backend/prisma/migrations/20260606000000_add_independent_person_role/migration.sql -->
``sql
ALTER TYPE "PersonRole" ADD VALUE IF NOT EXISTS 'INDEPENDENT';
````

<!-- SOURCE: backend/prisma/migrations/20260606120000_move_decision_fields_to_household/migration.sql -->
``sql
-- Add decision workflow state to Household.
ALTER TABLE "Household" ADD COLUMN "humanDecision" "HumanDecision" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Household" ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'SCORE_READY';
ALTER TABLE "Household" ADD COLUMN "decisionNote" TEXT;
ALTER TABLE "Household" ADD COLUMN "decidedById" TEXT;
ALTER TABLE "Household" ADD COLUMN "decidedAt" TIMESTAMP(3);

-- Link household decisions to the deciding user without changing ScoreResult relations.
ALTER TABLE "Household" ADD CONSTRAINT "Household_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
````

<!-- SOURCE: backend/prisma/migrations/20260606123000_add_classification_tag_to_household/migration.sql -->
``sql
-- Store mutable family assistance category on Household.
ALTER TABLE "Household" ADD COLUMN "classificationTag" TEXT;
````

<!-- SOURCE: backend/prisma/migrations/add_notifications.sql -->
``sql
-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

````

<!-- SOURCE: backend/prisma/migrations/pending.sql -->
``sql
node.exe : Error: You must pass the --shadow-database-url if you want to diff a migrations directory.
At line:1 char:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (Error: You must...ions directory.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 


````

### Current API Router and New Endpoint Registrations
<!-- SOURCE: backend/src/routes/api.js -->
``js
/**
 * Phase 3 API router — /api/*
 */

const express = require('express');
const { optionalAttachUser } = require('../middleware/auth');
const { getApiLimiter } = require('../middleware/rateLimit');
const medicalCasesRouter = require('../modules/medical/medical.routes')
const medicalDisbursementsRouter = require('../modules/medical/medical-disbursements.routes')
const medicalSummaryRouter = require('../modules/medical/medical-summary.routes')
const disbursementRouter = require('../modules/disbursement/disbursement.routes')

const router = express.Router();

router.use(optionalAttachUser);
router.use(getApiLimiter);

router.use('/auth',         require('../modules/auth/auth.routes'));
router.use('/households',   require('../modules/households/households.routes'));
router.use('/simulate',     require('../modules/simulate/simulate.routes'));
router.use('/admin',        require('../modules/admin/admin.routes'));
router.use('/analytics',    require('../modules/analytics/analytics.routes'));
router.use('/audit-logs',   require('../modules/audit/audit.routes'));
router.use('/verification', require('../modules/verification/verification.routes'));
router.use('/education',    require('../modules/education/education.routes'));
router.use('/users',        require('../modules/users/users.routes'));
router.use('/notifications', require('../modules/notifications/notifications.routes'));
router.use('/public',       require('../modules/public/public.routes'));
router.use('/medical-cases', medicalCasesRouter)
router.use('/medical-disbursements', medicalDisbursementsRouter)
router.use('/households', medicalSummaryRouter)
router.use('/disbursement', disbursementRouter)

module.exports = router;

````

| Method | Path | Module | Description | Min Role |
|---|---|---|---|---|
| GET | / | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| POST | /send | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| PUT | /read-all | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| PUT | /:id/read | notifications | Route defined in backend/src/modules/notifications/notifications.routes.js | Authenticated |
| POST | /contact | public | Route defined in backend/src/modules/public/public.routes.js | Public or inherited |
| GET | / | medical | GET  /api/medical-cases | Authenticated |
| GET | /kpis | medical | GET  /api/medical-cases/kpis | Authenticated |
| GET | /household/:householdId | medical | GET  /api/medical-cases/household/:householdId | Authenticated |
| POST | / | medical | POST /api/medical-cases | Authenticated |
| GET | /:id | medical | GET  /api/medical-cases/:id | Authenticated |
| PUT | /:id | medical | PUT  /api/medical-cases/:id | Authenticated |
| DELETE | /:id | medical | DELETE /api/medical-cases/:id | Authenticated |
| GET | /eligibility/:householdId | medical | GET  /api/medical-cases/eligibility/:householdId?aidType=TREATMENT&personId=xxx | Authenticated |
| GET | /summary/:householdId | medical | GET  /api/medical-cases/summary/:householdId | Authenticated |
| POST | / | medical | POST /api/medical-disbursements | Authenticated |
| GET | /household/:householdId | medical | GET  /api/medical-disbursements/household/:householdId | Authenticated |
| PATCH | /:id/approve | medical | PATCH /api/medical-disbursements/:id/approve | Authenticated |
| PATCH | /:id/pay | medical | PATCH /api/medical-disbursements/:id/pay | Authenticated |
| PATCH | /:id/reject | medical | PATCH /api/medical-disbursements/:id/reject | Authenticated |
| GET | /:householdId/medical-summary | medical | GET /api/households/:householdId/medical-summary | Authenticated |

## SECTION 5 - Other Changes
### Git History / Status Evidence
<!-- SOURCE: git log --oneline -30 -->
````text
7cae674 After adding the medical module and before editing3
52d9e6b After adding the medical module and before editing2
b31d8eb After adding the medical module and before editing
3b30fd5 After adding the landing page Notifications 2
c8f64f1 After adding the landing page Notifications
b90ea02 After adding the landing page
aa4e034 general updates and audits will be start
cfe04b1 After handling basics of housholder module not final Version yet
90952a2 the last phase of editing persons tab3
4f07219 the last phase of editing persons tab2
0b0532b the last phase of editing persons tab
72405f0 حين اصلاح خطا حذف جميع التعديلات
1e19e3d feat: move SON_IN_PRISON to individual persons and fix TS types
0311775 after handling persons tab for maried case
5a52b56 After handling basics of housholder module not final Version
c542354 After adding the MAIN PAGE OF FAMILY MODULE AND BEFORE EDITING THE TABES
5001c34 chore: remove backend node_modules from tracking and finalize root gitignore
b6ef575 After adding the scoring system and updatting families module
a8e1f88  Before editing the scoring
4175594  before editing 8/5/2026
196fc69 charityHub
````

<!-- SOURCE: git status --short -->
````text
 M backend/prisma/schema.prisma
 M backend/prisma/seed.ts
 M backend/src/modules/households/households.repository.js
 M backend/src/modules/households/households.service.js
 M backend/src/modules/medical/medical-eligibility.js
 M backend/src/modules/scoring/scoring.service.js
 M backend/src/routes/api.js
 M frontend/app/[locale]/dashboard/households/page.tsx
 M frontend/components/app-sidebar.tsx
 M frontend/components/dashboard/households-table.tsx
 M frontend/components/households/HouseholdsTable.tsx
 M frontend/components/wizard/steps/EvaluationStep.tsx
 M frontend/i18n/request.ts
 M frontend/lib/api/client.ts
 D frontend/medical-module/.gitignore
 D frontend/medical-module/app/dashboard/medical/layout.tsx
 D frontend/medical-module/app/dashboard/medical/page.tsx
 D frontend/medical-module/app/globals.css
 D frontend/medical-module/app/layout.tsx
 D frontend/medical-module/app/page.tsx
 D frontend/medical-module/components.json
 D frontend/medical-module/components/add-edit-record-modal.tsx
 D frontend/medical-module/components/eligibility-modal.tsx
 D frontend/medical-module/components/medical-records-table.tsx
 D frontend/medical-module/components/medical/dashboard/dashboard-header.tsx
 D frontend/medical-module/components/medical/dashboard/kpi-cards.tsx
 D frontend/medical-module/components/medical/dashboard/records-table.tsx
 D frontend/medical-module/components/medical/dashboard/search-filters.tsx
 D frontend/medical-module/components/medical/dashboard/warning-banner.tsx
 D frontend/medical-module/components/medical/modals/add-record-modal.tsx
 D frontend/medical-module/components/medical/modals/step1-household-person.tsx
 D frontend/medical-module/components/medical/modals/step2-medical-data.tsx
 D frontend/medical-module/components/medical/modals/step3-aid-selection.tsx
 D frontend/medical-module/components/medical/shared/age-circle.tsx
 D frontend/medical-module/components/medical/shared/aid-type-grid.tsx
 D frontend/medical-module/components/medical/shared/badge.tsx
 D frontend/medical-module/components/medical/shared/combobox.tsx
 D frontend/medical-module/components/medical/shared/eligibility-panel.tsx
 D frontend/medical-module/components/ui/button.tsx
 D frontend/medical-module/components/ui/command.tsx
 D frontend/medical-module/components/ui/dialog.tsx
 D frontend/medical-module/components/ui/input-group.tsx
 D frontend/medical-module/components/ui/input.tsx
 D frontend/medical-module/components/ui/popover.tsx
 D frontend/medical-module/components/ui/textarea.tsx
 D frontend/medical-module/lib/medical/mock-data.ts
 D frontend/medical-module/lib/medical/store.ts
 D frontend/medical-module/lib/medical/utils.ts
 D frontend/medical-module/lib/utils.ts
 D frontend/medical-module/next-env.d.ts
 D frontend/medical-module/next.config.mjs
 D frontend/medical-module/package.json
 D frontend/medical-module/pnpm-lock.yaml
 D frontend/medical-module/postcss.config.mjs
 D frontend/medical-module/public/apple-icon.png
 D frontend/medical-module/public/icon-dark-32x32.png
 D frontend/medical-module/public/icon-light-32x32.png
 D frontend/medical-module/public/icon.svg
 D frontend/medical-module/public/placeholder-logo.png
 D frontend/medical-module/public/placeholder-logo.svg
 D frontend/medical-module/public/placeholder-user.jpg
 D frontend/medical-module/public/placeholder.jpg
 D frontend/medical-module/public/placeholder.svg
 D frontend/medical-module/tsconfig.json
 D frontend/medical-module/types/medical.ts
 M frontend/messages/ar/common.json
 M frontend/messages/en/common.json
 M frontend/next-env.d.ts
 M frontend/package-lock.json
 M frontend/package.json
 M frontend/tsconfig.json
 M frontend/tsconfig.tsbuildinfo
?? backend/src/modules/disbursement/
?? frontend/app/[locale]/dashboard/disbursement/
?? frontend/components/disbursement/
?? frontend/lib/api/disbursement-api.ts
?? frontend/lib/disbursement/
?? frontend/messages/ar/disbursement.json
?? frontend/messages/en/disbursement.json
?? "frontend/\331\205\331\210\330\257\331\212\331\210\331\204 \330\247\331\204\331\202\330\250\330\266/"
````

### Additional Feature: Monthly Disbursement Module
This appears as a new/untracked module in git status. It adds category/grant configuration, monthly payment calculation, approvals/reopen, Meeza export, payment status updates, and frontend pages/components/stores for monthly assistance disbursement.
<!-- SOURCE: backend/src/modules/disbursement/disbursement.repository.js -->
``js
/**
 * Disbursement Repository
 * All Prisma queries for the disbursement module.
 * No business logic — data access only.
 */

'use strict';

const prisma = require('../../config/prisma');

// ─── Household include for calculation ───────────────────────────────────────

const HOUSEHOLD_INCLUDE_FOR_CALC = {
  persons: {
    include: {
      diseases:     true,
      disabilities: true,
    },
  },
  incomeSources: true,
  scoreResults: {
    orderBy: { calculatedAt: 'desc' },
    take: 1,
  },
};

// ─── Month CRUD ───────────────────────────────────────────────────────────────

const disbursementRepository = {

  // ── Eligible households ────────────────────────────────────────────────────

  async findEligibleHouseholds() {
    const households = await prisma.household.findMany({
      where: {
        humanDecision:     'APPROVED',
        isDraft:           false,
        classificationTag: { not: null },
      },
      include: HOUSEHOLD_INCLUDE_FOR_CALC,
    });

    // Post-filter: must have a score result with normalizedPercent >= 20
    return households.filter((h) => {
      const latest = h.scoreResults?.[0];
      return latest && Number(latest.normalizedPercent) >= 20;
    });
  },

  // ── Month operations ───────────────────────────────────────────────────────

  async createMonth(data) {
    return prisma.disbursementMonth.create({ data });
  },

  async findMonth(id) {
    return prisma.disbursementMonth.findUnique({
      where: { id },
      include: {
        payments: {
          include: {
            household: {
              select: { id: true, code: true, familyName: true },
            },
            audits: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        createdBy:  { select: { id: true, name: true } },
        lockedBy:   { select: { id: true, name: true } },
        reopenedBy: { select: { id: true, name: true } },
      },
    });
  },

  async findMonthByPeriod(period) {
    return prisma.disbursementMonth.findUnique({
      where: { period },
    });
  },

  async updateMonth(id, data) {
    return prisma.disbursementMonth.update({ where: { id }, data });
  },

  async listMonths({ skip = 0, take = 20, status } = {}) {
    const where = status ? { status } : {};
    const [months, total] = await Promise.all([
      prisma.disbursementMonth.findMany({
        where,
        orderBy: { period: 'desc' },
        skip,
        take,
        include: {
          createdBy: { select: { id: true, name: true } },
          _count:    { select: { payments: true } },
        },
      }),
      prisma.disbursementMonth.count({ where }),
    ]);
    return { months, total };
  },

  // ── Payment CRUD ───────────────────────────────────────────────────────────

  async createPayment(data) {
    return prisma.monthlyPayment.create({ data });
  },

  async createManyPayments(dataArray, tx) {
    const client = tx || prisma;
    // createMany doesn't support nested creates — use loop inside transaction
    return Promise.all(dataArray.map((d) => client.monthlyPayment.create({ data: d })));
  },

  async findPayment(id) {
    return prisma.monthlyPayment.findUnique({
      where: { id },
      include: {
        month:     { select: { id: true, status: true, period: true } },
        household: { select: { id: true, code: true, familyName: true } },
        adjustedBy:{ select: { id: true, name: true } },
      },
    });
  },

  async updatePayment(id, data) {
    return prisma.monthlyPayment.update({ where: { id }, data });
  },

  async deleteMonthPayments(monthId, tx) {
    const client = tx || prisma;
    return client.monthlyPayment.deleteMany({ where: { monthId } });
  },

  async getMonthPayments(monthId, { search, category, paymentStatus, skip = 0, take = 100 } = {}) {
    const where = { monthId };
    if (category && category !== 'all') where.category = category;
    if (paymentStatus === 'meeza_pending') where.meezaStatus = 'PENDING';
    if (paymentStatus === 'cash_pending')  where.cashStatus  = 'PENDING';

    const [payments, total] = await Promise.all([
      prisma.monthlyPayment.findMany({
        where,
        include: {
          household: { select: { id: true, code: true, familyName: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      prisma.monthlyPayment.count({ where }),
    ]);
    return { payments, total };
  },

  // ── Audit ──────────────────────────────────────────────────────────────────

  async createAudit(data) {
    return prisma.paymentAudit.create({ data });
  },

  async createManyAudits(dataArray, tx) {
    const client = tx || prisma;
    return client.paymentAudit.createMany({ data: dataArray });
  },

  // ── Config ─────────────────────────────────────────────────────────────────

  async getCategoryConfigs() {
    return prisma.categoryConfig.findMany({
      where:   { active: true },
      orderBy: { code: 'asc' },
    });
  },

  async getAllCategoryConfigs() {
    return prisma.categoryConfig.findMany({ orderBy: { code: 'asc' } });
  },

  async updateCategoryConfig(code, data, updatedById) {
    return prisma.categoryConfig.update({
      where: { code },
      data:  { ...data, updatedById },
    });
  },

  async upsertCategoryConfig(data) {
    return prisma.categoryConfig.upsert({
      where:  { code: data.code },
      update: data,
      create: data,
    });
  },

  async getGrantConfigs() {
    return prisma.grantConfig.findMany({
      where:   { active: true },
      orderBy: { code: 'asc' },
    });
  },

  async getAllGrantConfigs() {
    return prisma.grantConfig.findMany({ orderBy: { code: 'asc' } });
  },

  async updateGrantConfig(code, data) {
    return prisma.grantConfig.update({ where: { code }, data });
  },

  async upsertGrantConfig(data) {
    return prisma.grantConfig.upsert({
      where:  { code: data.code },
      update: data,
      create: data,
    });
  },

  // ── External Contributions ─────────────────────────────────────────────────

  async createExternalContribution(data) {
    return prisma.externalContribution.create({ data });
  },

  async getExternalContributions(householdId, period) {
    // Match contributions for the same month
    const start = new Date(period);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return prisma.externalContribution.findMany({
      where: {
        householdId,
        period: { gte: start, lt: end },
      },
    });
  },

  // ── Payment status update ──────────────────────────────────────────────────

  async updatePaymentStatus(paymentId, { meezaStatus, cashStatus }, userId, tx) {
    const client = tx || prisma;
    const data   = {};
    if (meezaStatus) data.meezaStatus = meezaStatus;
    if (cashStatus)  data.cashStatus  = cashStatus;

    const [payment] = await Promise.all([
      client.monthlyPayment.update({ where: { id: paymentId }, data }),
      client.paymentAudit.create({
        data: {
          paymentId,
          triggeredBy: userId,
          triggerType: 'STATUS_CHANGE',
          meta: { meezaStatus, cashStatus },
        },
      }),
    ]);
    return payment;
  },
};

module.exports = disbursementRepository;
````

<!-- SOURCE: backend/src/modules/disbursement/disbursement.routes.js -->
``js
/**
 * Disbursement Routes
 * Routes + inline controllers for the monthly disbursement module.
 *
 * Permissions:
 *   GET endpoints:                 SCORE_READ
 *   calculate, approve, adjust:    SCORE_DECIDE
 *   reopen, config PUT:            RULES_WRITE
 *   simulate:                      SCORE_SIMULATE
 */

'use strict';

const express = require('express');
const { requireAuth }       = require('../../middleware/auth');
const { requirePermission, requireRoles, PERMISSIONS } = require('../../shared/permissions');
const { UserRole }          = require('../../shared/constants/enums');
const service               = require('./disbursement.service');

const router = express.Router();

// All disbursement routes require authentication
router.use(requireAuth);

// ─── Helper ───────────────────────────────────────────────────────────────────

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// ══════════════════════════════════════════════════════════════════════════════
// STATIC routes first (must come before /:monthId to avoid conflicts)
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/disbursement/simulate
router.post(
  '/simulate',
  requirePermission(PERMISSIONS.SCORE_SIMULATE),
  asyncHandler(async (req, res) => {
    const result = await service.simulateMonth(req.body);
    res.json({ success: true, data: result });
  }),
);

// POST /api/disbursement/contributions
router.post(
  '/contributions',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const contribution = await service.addExternalContribution(req.user, req.body);
    res.status(201).json({ success: true, data: contribution });
  }),
);

// GET /api/disbursement/config/categories
router.get(
  '/config/categories',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (_req, res) => {
    const configs = await service.getCategoryConfigs();
    res.json({ success: true, data: configs });
  }),
);

// PUT /api/disbursement/config/categories/:code
router.put(
  '/config/categories/:code',
  requireRoles(UserRole.ADMIN),
  requirePermission(PERMISSIONS.RULES_WRITE),
  asyncHandler(async (req, res) => {
    const updated = await service.updateCategoryConfig(
      req.user,
      req.params.code,
      req.body,
    );
    res.json({ success: true, data: updated });
  }),
);

// GET /api/disbursement/config/grants
router.get(
  '/config/grants',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (_req, res) => {
    const grants = await service.getGrantConfigs();
    res.json({ success: true, data: grants });
  }),
);

// PUT /api/disbursement/config/grants/:code
router.put(
  '/config/grants/:code',
  requireRoles(UserRole.ADMIN),
  requirePermission(PERMISSIONS.RULES_WRITE),
  asyncHandler(async (req, res) => {
    const updated = await service.updateGrantConfig(
      req.user,
      req.params.code,
      req.body,
    );
    res.json({ success: true, data: updated });
  }),
);

// ══════════════════════════════════════════════════════════════════════════════
// Collection routes
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/disbursement
router.get(
  '/',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (req, res) => {
    const skip   = parseInt(req.query.skip)  || 0;
    const take   = parseInt(req.query.take)  || 20;
    const status = req.query.status          || undefined;
    const result = await service.listMonths({ skip, take, status });
    res.json({ success: true, ...result });
  }),
);

// POST /api/disbursement
router.post(
  '/',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const month = await service.openMonth(req.user, req.body);
    res.status(201).json({ success: true, data: month });
  }),
);

// ══════════════════════════════════════════════════════════════════════════════
// Month-level routes  /:monthId
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/disbursement/:monthId
router.get(
  '/:monthId',
  requirePermission(PERMISSIONS.SCORE_READ),
  asyncHandler(async (req, res) => {
    const month = await service.getMonth(req.params.monthId);
    res.json({ success: true, data: month });
  }),
);

// POST /api/disbursement/:monthId/calculate
router.post(
  '/:monthId/calculate',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const result = await service.calculateMonth(req.user, req.params.monthId);
    res.json({ success: true, data: result });
  }),
);

// PATCH /api/disbursement/:monthId/approve
router.patch(
  '/:monthId/approve',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const result = await service.approveMonth(req.user, req.params.monthId, req.body);
    res.json({ success: true, data: result });
  }),
);

// PATCH /api/disbursement/:monthId/reopen   (ADMIN only)
router.patch(
  '/:monthId/reopen',
  requireRoles(UserRole.ADMIN),
  requirePermission(PERMISSIONS.RULES_WRITE),
  asyncHandler(async (req, res) => {
    const result = await service.reopenMonth(req.user, req.params.monthId, req.body);
    res.json({ success: true, data: result });
  }),
);

// GET /api/disbursement/:monthId/export/meeza
router.get(
  '/:monthId/export/meeza',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const csv = await service.exportMeezaFile(req.params.monthId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="meeza-${req.params.monthId}.csv"`,
    );
    res.send('\uFEFF' + csv); // BOM for Excel Arabic compatibility
  }),
);

// ══════════════════════════════════════════════════════════════════════════════
// Payment-level routes  /:monthId/payments/:id
// ══════════════════════════════════════════════════════════════════════════════

// PATCH /api/disbursement/:monthId/payments/:id/adjust
router.patch(
  '/:monthId/payments/:id/adjust',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const payment = await service.adjustPayment(req.user, req.params.id, req.body);
    res.json({ success: true, data: payment });
  }),
);

// PATCH /api/disbursement/:monthId/payments/:id/status
router.patch(
  '/:monthId/payments/:id/status',
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  asyncHandler(async (req, res) => {
    const payment = await service.updatePaymentStatus(req.user, req.params.id, req.body);
    res.json({ success: true, data: payment });
  }),
);

module.exports = router;
````

<!-- SOURCE: backend/src/modules/disbursement/disbursement.service.js -->
``js
/**
 * Disbursement Service
 * Business logic for monthly disbursement calculation, approval, and management.
 *
 * RULES:
 * ✗ All monetary values use Decimal — never raw JS floats for money
 * ✗ No hardcoded amounts — all caps/limits come from CategoryConfig / GrantConfig
 * ✓ Every write operation inserts a PaymentAudit record
 * ✓ ScoreResult is READ ONLY — never modified here
 */

'use strict';

const Decimal = require('decimal.js');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  AppError,
} = require('../../utils/errors');
const repo = require('./disbursement.repository');
const prisma = require('../../config/prisma');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundToNearest50(amount) {
  return Math.round(Number(amount) / 50) * 50;
}

function countDependents(persons) {
  return persons.filter(
    (p) =>
      p.role === 'DEPENDENT_ADULT' ||
      (p.role === 'CHILD' && (p.isStudent || p.isOrphan)),
  ).length;
}

function checkWidowStatus(household) {
  const head = household.persons?.find((p) => p.isHead);
  return (
    head?.residencyStatus === 'ABSENT_DEATH' &&
    household.socialStatus !== 'REMARRIED'
  );
}

function buildSnapshot(household) {
  const latest = household.scoreResults?.[0];
  return {
    score:           { normalizedPercent: latest?.normalizedPercent },
    income:          household.incomeSources?.map((i) => ({
      channel:       i.channel,
      monthlyAmount: i.monthlyAmount,
    })),
    persons: household.persons?.map((p) => ({
      role:      p.role,
      gender:    p.gender,
      birthDate: p.birthDate,
      isOrphan:  p.isOrphan,
      isStudent: p.isStudent,
    })),
    category:        household.classificationTag,
    hasStudents:     household.persons?.some((p) => p.isStudent),
    hasMerge:        household.hasMerge,
    socialStatus:    household.socialStatus,
  };
}

function serializeDecimal(v) {
  return v instanceof Decimal ? v.toFixed(2) : String(v ?? '0');
}

function serializePayment(p) {
  if (!p) return p;
  return {
    ...p,
    normalizedPercent:  serializeDecimal(p.normalizedPercent),
    totalIncome:        serializeDecimal(p.totalIncome),
    externalTotal:      serializeDecimal(p.externalTotal),
    compensationAmount: serializeDecimal(p.compensationAmount),
    baseAmount:         serializeDecimal(p.baseAmount),
    grantsTotal:        serializeDecimal(p.grantsTotal),
    mergeBonus:         serializeDecimal(p.mergeBonus),
    rawTotal:           serializeDecimal(p.rawTotal),
    appliedCap:         serializeDecimal(p.appliedCap),
    calculatedAmount:   serializeDecimal(p.calculatedAmount),
    manualAdjustment:   serializeDecimal(p.manualAdjustment),
    finalAmount:        serializeDecimal(p.finalAmount),
    meezaAmount:        serializeDecimal(p.meezaAmount),
    cashAmount:         serializeDecimal(p.cashAmount),
  };
}

function serializeMonth(m) {
  if (!m) return m;
  return {
    ...m,
    totalBudget: m.totalBudget ? serializeDecimal(m.totalBudget) : null,
    payments:    m.payments?.map(serializePayment),
  };
}

// ─── Core calculation for a single household ──────────────────────────────────

async function calcOneFamily(household, configs, grants, method, ratePerPoint) {
  const latestScore = household.scoreResults?.[0];
  if (!latestScore) return null;

  const score  = Number(latestScore.normalizedPercent) / 100; // 0→1
  const cat    = household.classificationTag;
  const config = configs.find((c) => c.code === cat && c.active);
  if (!config) return null;

  const deps    = countDependents(household.persons);
  const orphans = household.persons.filter((p) => p.isOrphan).length;
  const income  = household.incomeSources.reduce(
    (s, i) => s + Number(i.monthlyAmount),
    0,
  );
  const isWidowNotRemarried = checkWidowStatus(household);

  let base = 0;

  if (method === 'PROPORTIONAL') {
    base = roundToNearest50(Number(latestScore.normalizedPercent) * ratePerPoint);
  } else {
    // VULNERABILITY — category-specific formulas
    switch (cat) {
      case '1':
      case 'كفالة أيتام':
      case 'أيتام': {
        const perOrphan = roundToNearest50(
          score * Number(config.maxPerChild ?? 700),
        );
        base = perOrphan * Math.max(orphans, 1);
        if (isWidowNotRemarried) base += Number(config.widowBonus ?? 200);
        break;
      }
      case '2':
      case 'ملف إعاقة':
      case 'إعاقة': {
        base = roundToNearest50(score * Number(config.maxAmount ?? 700));
        break;
      }
      case '3':
      case 'طلاب علم':
      case 'طالب علم':
      case '4':
      case 'أسر سجناء':
      case '9':
      case 'مطلقات': {
        const basePart = roundToNearest50(score * Number(config.baseMax ?? 400));
        const perDep   = roundToNearest50(score * Number(config.perDepMax ?? 200));
        base = basePart + perDep * deps;
        break;
      }
      case '5':
      case 'مساعدات':
      case 'مساعدات موسمية': {
        const threshold  = Number(config.poorScoreThreshold ?? 60) / 100;
        const resolvedMax = score >= threshold
          ? Number(config.maxAmount ?? 700)
          : Number(config.maxAmount ?? 700) * 0.7;
        base = roundToNearest50(score * resolvedMax);
        break;
      }
      case '6':
      case 'دعم خارجي': {
        base = Math.max(income, 250);
        break;
      }
      case '7':
      case 'منفردون':
      case '10':
      case 'مساكين':
      case 'فقراء':
      case 'مسنون':
      case 'كبار سن':
      case 'علاج شهري':
      case 'أمراض مزمنة':
      case 'حالات هجر': {
        base = roundToNearest50(score * Number(config.maxAmount ?? 500));
        break;
      }
      default:
        return null;
    }
  }

  // ── Grants / incentives ──────────────────────────────────────────────────
  const grantsBreakdown = [];
  const condMap = {
    isOrphan:         orphans > 0,
    hasStudents:      household.persons.some((p) => p.isStudent),
    hasQuranStudents: household.persons.some((p) => p.isStudent), // TODO: from StudentAcademicRecord
    hasMerge:         household.hasMerge ?? false,
  };

  for (const grant of grants) {
    if (!grant.active) continue;

    // Category filter
    if (grant.categoryFilter) {
      let allowed;
      try { allowed = JSON.parse(grant.categoryFilter); } catch { allowed = []; }
      if (!allowed.includes(cat)) continue;
    }

    if (!condMap[grant.condition]) continue;

    const unitCount = Math.max(orphans, deps, 1);
    const rawAmount = grant.isPerUnit
      ? Number(grant.amount) * unitCount
      : Number(grant.amount);
    const amount = grant.maxAmount
      ? Math.min(rawAmount, Number(grant.maxAmount))
      : rawAmount;

    grantsBreakdown.push({
      code:   grant.code,
      nameAr: grant.nameAr,
      amount,
    });
  }

  const grantsTotal = grantsBreakdown.reduce((s, g) => s + g.amount, 0);
  const mergeBonus  = 0; // sourced from GrantConfig (MERGE grant above)

  // ── Hard cap ─────────────────────────────────────────────────────────────
  const hasKids          = deps > 0 || orphans > 0;
  const cap              = hasKids
    ? Number(config.capWithDeps)
    : Number(config.capNoDeps);
  const rawTotal         = base + grantsTotal + mergeBonus;
  const calculatedAmount = Math.min(rawTotal, cap);

  // ── External contributions (deduct what others already give) ─────────────
  const period = new Date(); // set by calling context
  const externalContribs = await repo.getExternalContributions(
    household.id,
    period,
  );
  const externalTotal = externalContribs
    .filter((c) => c.confirmed)
    .reduce((s, c) => s + Number(c.amount), 0);
  const compensationAmount = Math.max(0, calculatedAmount - externalTotal);

  // ── Payment split ─────────────────────────────────────────────────────────
  const finalAmount = compensationAmount;
  const meezaAmount = Math.round(finalAmount * 0.9);
  const cashAmount  = finalAmount - meezaAmount;

  // ── Auto sub-category ─────────────────────────────────────────────────────
  const autoSubCategory =
    cat === '5'
      ? score >= Number(config.poorScoreThreshold ?? 60) / 100
        ? 'POOR'
        : 'NEEDY'
      : null;

  return {
    householdId:        household.id,
    householdSnapshot:  buildSnapshot(household),
    category:           cat,
    autoSubCategory,
    normalizedPercent:  new Decimal(latestScore.normalizedPercent),
    dependentCount:     deps,
    orphanCount:        orphans,
    totalIncome:        new Decimal(income),
    isWidowNotRemarried,
    externalTotal:      new Decimal(externalTotal),
    compensationAmount: new Decimal(compensationAmount),
    baseAmount:         new Decimal(base),
    grantsBreakdown:    JSON.stringify(grantsBreakdown),
    grantsTotal:        new Decimal(grantsTotal),
    mergeBonus:         new Decimal(mergeBonus),
    rawTotal:           new Decimal(rawTotal),
    appliedCap:         new Decimal(cap),
    calculatedAmount:   new Decimal(calculatedAmount),
    finalAmount:        new Decimal(finalAmount),
    meezaAmount:        new Decimal(meezaAmount),
    meezaCardNumber:    household.meezaCardNumber ?? null,
    cashAmount:         new Decimal(cashAmount),
    fundSource:         'GENERAL',
    meezaStatus:        'PENDING',
    cashStatus:         'PENDING',
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

const disbursementService = {

  // ── List months ────────────────────────────────────────────────────────────

  async listMonths({ skip, take, status } = {}) {
    const { months, total } = await repo.listMonths({ skip, take, status });
    return { months: months.map(serializeMonth), total };
  },

  // ── Open new month ─────────────────────────────────────────────────────────

  async openMonth(user, { period, method, totalBudget, notes }) {
    // Normalise period to first of month (UTC midnight)
    const periodDate = new Date(period);
    periodDate.setUTCDate(1);
    periodDate.setUTCHours(0, 0, 0, 0);

    const existing = await repo.findMonthByPeriod(periodDate);
    if (existing) {
      throw new ConflictError(
        `يوجد شهر مفتوح بالفعل لـ ${periodDate.toISOString().slice(0, 7)}`,
      );
    }

    if (method === 'PROPORTIONAL' && !totalBudget) {
      throw new ValidationError('الميزانية مطلوبة عند اختيار طريقة التوزيع النسبي');
    }

    const month = await repo.createMonth({
      period:      periodDate,
      method:      method || 'VULNERABILITY',
      totalBudget: totalBudget ? new Decimal(totalBudget) : null,
      notes:       notes || null,
      createdById: user.userId,
      status:      'DRAFT',
    });

    return serializeMonth(month);
  },

  // ── Get month detail ───────────────────────────────────────────────────────

  async getMonth(monthId) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    return serializeMonth(month);
  },

  // ── Calculate month ────────────────────────────────────────────────────────

  async calculateMonth(user, monthId) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    if (month.status === 'APPROVED' || month.status === 'PAID') {
      throw new AppError('لا يمكن إعادة الحساب بعد الاعتماد', 400, 'MONTH_LOCKED');
    }

    // Load config from DB — no hardcoded values
    const [configs, grants, households] = await Promise.all([
      repo.getCategoryConfigs(),
      repo.getGrantConfigs(),
      repo.findEligibleHouseholds(),
    ]);

    // Calculate ratePerPoint for PROPORTIONAL method
    let ratePerPoint = 0;
    if (month.method === 'PROPORTIONAL' && month.totalBudget) {
      const totalPercent = households.reduce(
        (s, h) => s + Number(h.scoreResults?.[0]?.normalizedPercent ?? 0),
        0,
      );
      ratePerPoint = totalPercent > 0
        ? Number(month.totalBudget) / totalPercent
        : 0;
    }

    // Run calculation for each eligible household
    const results = await Promise.all(
      households.map((h) => calcOneFamily(h, configs, grants, month.method, ratePerPoint)),
    );
    const valid = results.filter(Boolean);

    // Persist inside a transaction
    await prisma.$transaction(async (tx) => {
      // Delete previous calculations (only safe if not APPROVED)
      await repo.deleteMonthPayments(monthId, tx);

      // Insert new payments + audit records
      for (const paymentData of valid) {
        const payment = await tx.monthlyPayment.create({
          data: { monthId, ...paymentData },
        });
        await tx.paymentAudit.create({
          data: {
            paymentId:   payment.id,
            changedById: user.userId,
            triggerType: 'CALCULATE',
            newAmount:   paymentData.finalAmount,
            meta:        { method: month.method },
          },
        });
      }

      // Update month status + persist scoreSum/ratePerPoint
      await tx.disbursementMonth.update({
        where: { id: monthId },
        data:  {
          status:      'CALCULATED',
          scoreSum:    month.method === 'PROPORTIONAL'
            ? new Decimal(households.reduce((s, h) => s + Number(h.scoreResults?.[0]?.normalizedPercent ?? 0), 0))
            : null,
          ratePerPoint: month.method === 'PROPORTIONAL' ? new Decimal(ratePerPoint) : null,
        },
      });
    });

    return {
      monthId,
      status:    'CALCULATED',
      processed: valid.length,
      skipped:   households.length - valid.length,
    };
  },

  // ── Approve month ──────────────────────────────────────────────────────────

  async approveMonth(user, monthId, { notes } = {}) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    if (month.status !== 'CALCULATED') {
      throw new AppError(
        'يجب أن يكون الشهر في حالة "محسوب" قبل الاعتماد',
        400,
        'INVALID_STATUS',
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.disbursementMonth.update({
        where: { id: monthId },
        data: {
          status:      'APPROVED',
          lockedAt:    new Date(),
          lockedById:  user.userId,
          notes:       notes || month.notes,
        },
      });

      // Audit all payments
      const payments = await tx.monthlyPayment.findMany({
        where:  { monthId },
        select: { id: true, finalAmount: true },
      });
      await tx.paymentAudit.createMany({
        data: payments.map((p) => ({
          paymentId:   p.id,
          changedById: user.userId,
          triggerType: 'APPROVE',
          newAmount:   p.finalAmount,
          reason:      notes || null,
        })),
      });
    });

    return { monthId, status: 'APPROVED' };
  },

  // ── Reopen month ───────────────────────────────────────────────────────────

  async reopenMonth(user, monthId, { reopenReason }) {
    if (!reopenReason?.trim()) {
      throw new ValidationError('سبب إعادة الفتح مطلوب');
    }

    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    if (month.status !== 'APPROVED') {
      throw new AppError(
        'يمكن إعادة فتح الشهور المعتمدة فقط',
        400,
        'INVALID_STATUS',
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.disbursementMonth.update({
        where: { id: monthId },
        data: {
          status:       'CALCULATED',
          reopenedAt:   new Date(),
          reopenedById: user.userId,
          reopenReason: reopenReason.trim(),
        },
      });

      const payments = await tx.monthlyPayment.findMany({
        where:  { monthId },
        select: { id: true },
      });
      await tx.paymentAudit.createMany({
        data: payments.map((p) => ({
          paymentId:   p.id,
          changedById: user.userId,
          triggerType: 'REOPEN',
          reason:      reopenReason.trim(),
        })),
      });
    });

    return { monthId, status: 'CALCULATED' };
  },

  // ── Manual adjustment ──────────────────────────────────────────────────────

  async adjustPayment(user, paymentId, { manualAdjustment, adjustmentReason, fundSource }) {
    if (!adjustmentReason?.trim()) {
      throw new ValidationError('سبب التعديل مطلوب');
    }

    const payment = await repo.findPayment(paymentId);
    if (!payment) throw new NotFoundError('MonthlyPayment');
    if (payment.month.status === 'APPROVED' || payment.month.status === 'PAID') {
      throw new AppError('الشهر معتمد — لا يمكن إجراء تعديلات', 400, 'MONTH_LOCKED');
    }

    const oldAmount    = Number(payment.finalAmount);
    const adjustment   = Number(manualAdjustment);
    const newFinal     = Number(payment.calculatedAmount) + adjustment;
    const newMeeza     = Math.round(newFinal * 0.9);
    const newCash      = newFinal - newMeeza;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.monthlyPayment.update({
        where: { id: paymentId },
        data: {
          manualAdjustment: new Decimal(adjustment),
          adjustmentReason: adjustmentReason.trim(),
          adjustedById:     user.userId,
          adjustedAt:       new Date(),
          finalAmount:      new Decimal(newFinal),
          meezaAmount:      new Decimal(newMeeza),
          cashAmount:       new Decimal(newCash),
          fundSource:       fundSource || payment.fundSource,
        },
      });
      await tx.paymentAudit.create({
        data: {
          paymentId,
          changedById: user.userId,
          triggerType: 'MANUAL_EDIT',
          oldAmount:   new Decimal(oldAmount),
          newAmount:   new Decimal(newFinal),
          reason:      adjustmentReason.trim(),
        },
      });
      return p;
    });

    return serializePayment(updated);
  },

  // ── Update payment status ──────────────────────────────────────────────────

  async updatePaymentStatus(user, paymentId, { meezaStatus, cashStatus }) {
    const payment = await repo.findPayment(paymentId);
    if (!payment) throw new NotFoundError('MonthlyPayment');

    const updated = await repo.updatePaymentStatus(
      paymentId,
      { meezaStatus, cashStatus },
      user.userId,
    );
    return serializePayment(updated);
  },

  // ── Simulate (no DB writes) ────────────────────────────────────────────────

  async simulateMonth({ method, totalBudget }) {
    const [configs, grants, households] = await Promise.all([
      repo.getCategoryConfigs(),
      repo.getGrantConfigs(),
      repo.findEligibleHouseholds(),
    ]);

    let ratePerPoint = 0;
    if (method === 'PROPORTIONAL' && totalBudget) {
      const totalPercent = households.reduce(
        (s, h) => s + Number(h.scoreResults?.[0]?.normalizedPercent ?? 0),
        0,
      );
      ratePerPoint = totalPercent > 0 ? Number(totalBudget) / totalPercent : 0;
    }

    const results = await Promise.all(
      households.map((h) =>
        calcOneFamily(h, configs, grants, method || 'VULNERABILITY', ratePerPoint),
      ),
    );
    const valid = results.filter(Boolean);

    if (valid.length === 0) {
      return {
        eligibleCount: 0,
        totalRequired: 0,
        averagePayment: 0,
        maxPayment: 0,
        minPayment: 0,
        surplus: 0,
        byCategory: [],
      };
    }

    const amounts = valid.map((v) => Number(v.finalAmount));
    const total   = amounts.reduce((s, a) => s + a, 0);

    // Group by category
    const catMap = {};
    for (const v of valid) {
      const cat = v.category;
      if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, total: 0 };
      catMap[cat].count++;
      catMap[cat].total += Number(v.finalAmount);
    }

    return {
      eligibleCount:  valid.length,
      totalRequired:  total,
      averagePayment: Math.round(total / valid.length),
      maxPayment:     Math.max(...amounts),
      minPayment:     Math.min(...amounts),
      surplus:        totalBudget ? Number(totalBudget) - total : null,
      byCategory:     Object.values(catMap),
    };
  },

  // ── Add external contribution ──────────────────────────────────────────────

  async addExternalContribution(user, { householdId, period, institutionName, amount, confirmed, notes }) {
    const periodDate = new Date(period);
    periodDate.setUTCDate(1);
    periodDate.setUTCHours(0, 0, 0, 0);

    return repo.createExternalContribution({
      householdId,
      period:          periodDate,
      institutionName,
      amount:          new Decimal(amount),
      confirmed:       confirmed ?? false,
      notes:           notes || null,
    });
  },

  // ── Config — categories ────────────────────────────────────────────────────

  async getCategoryConfigs() {
    return repo.getAllCategoryConfigs();
  },

  async updateCategoryConfig(user, code, data) {
    const cfg = await prisma.categoryConfig.findUnique({ where: { code } });
    if (!cfg) throw new NotFoundError('CategoryConfig');
    return repo.updateCategoryConfig(code, data, user.userId);
  },

  // ── Config — grants ────────────────────────────────────────────────────────

  async getGrantConfigs() {
    return repo.getAllGrantConfigs();
  },

  async updateGrantConfig(user, code, data) {
    const cfg = await prisma.grantConfig.findUnique({ where: { code } });
    if (!cfg) throw new NotFoundError('GrantConfig');
    return repo.updateGrantConfig(code, data);
  },

  // ── CSV export — Meeza ─────────────────────────────────────────────────────

  async exportMeezaFile(monthId) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');

    const pending = month.payments.filter((p) => p.meezaStatus === 'PENDING');

    const header = 'رقم_القيد,رقم_البطاقة,المبلغ,الفئة';
    const rows = pending.map((p) => {
      const code       = p.household?.code ?? '';
      const cardNum    = p.meezaCardNumber ?? '';
      const amount     = Number(p.meezaAmount).toFixed(2);
      const category   = p.category ?? '';
      return `${code},${cardNum},${amount},${category}`;
    });

    return [header, ...rows].join('\n');
  },
};

module.exports = disbursementService;
````

<!-- SOURCE: frontend/app/[locale]/dashboard/disbursement/[id]/page.tsx -->
``tsx
import { MonthDetailPage } from '@/components/disbursement/MonthDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export default function MonthDetailRoute({ params }: Props) {
  return <MonthDetailPage params={params} />
}

export const metadata = {
  title: 'تفاصيل شهر القبض — CharityHub',
}
````

<!-- SOURCE: frontend/app/[locale]/dashboard/disbursement/page.tsx -->
``tsx
import { DisbursementPage } from '@/components/disbursement/DisbursementPage'

export default function DisbursementRoute() {
  return <DisbursementPage />
}

export const metadata = {
  title: 'القبض الشهري — CharityHub',
  description: 'إدارة دفعات المساعدات الشهرية للأسر المستفيدة',
}
````

<!-- SOURCE: frontend/app/[locale]/dashboard/disbursement/settings/page.tsx -->
``tsx
import { DisbursementSettingsPage } from '@/components/disbursement/DisbursementSettingsPage'

export default function DisbursementSettingsRoute() {
  return <DisbursementSettingsPage />
}

export const metadata = {
  title: 'إعدادات القبض الشهري — CharityHub',
}
````

<!-- SOURCE: frontend/components/disbursement/category-badge.tsx -->
``tsx
'use client'

import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/disbursement/types'

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  const label = CATEGORY_LABELS[category] || category

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        color,
        className,
      )}
    >
      {label}
    </span>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/DisbursementPage.tsx -->
``tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, RefreshCw, Banknote, Settings } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KpiCards } from '@/components/disbursement/kpi-cards'
import { MonthsTable } from '@/components/disbursement/months-table'
import { NewMonthSheet } from '@/components/disbursement/new-month-sheet'
import { useDisbursementStore } from '@/lib/disbursement/store'
import { formatAmount } from '@/lib/disbursement/types'

export function DisbursementPage() {
  const t = useTranslations('disbursement')
  const locale = useLocale()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { months, loading, error, fetchMonths, clearError } = useDisbursementStore()

  useEffect(() => {
    fetchMonths()
  }, [fetchMonths])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const filtered = months.filter((m) => {
    if (!search) return true
    const label = new Date(m.period).toLocaleDateString('ar-EG', {
      month: 'long',
      year: 'numeric',
    })
    return label.includes(search)
  })

  // KPI aggregates from real data
  const totalFamilies  = months.reduce((s, m) => s + (m._count?.payments ?? 0), 0)
  const approvedMonths = months.filter(m => m.status === 'APPROVED' || m.status === 'PAID')

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12">
      {/* PREMIUM HEADER SECTION */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-950 pt-16 pb-24 overflow-hidden shadow-lg border-b border-green-500/10">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <Banknote className="w-4 h-4" />
                <span>إدارة الشؤون المالية</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  {t('title')}
                </h1>
                <Link href={`/${locale}/dashboard/disbursement/settings`}>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                    title="الإعدادات"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </Link>
              </div>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchMonths()}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-md disabled:opacity-50 hover:border-green-500/30"
                title="تحديث"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500 text-green-100'}`} />
              </button>
              <button
                onClick={() => setSheetOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] font-bold text-base overflow-hidden border border-green-300/50"
              >
                <Plus className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-90" />
                <span className="relative z-10">{t('addMonth')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-6">
        {/* KPI Cards */}
        <KpiCards
          totalFamilies={totalFamilies}
          totalMonths={months.length}
          approvedMonths={approvedMonths.length}
        />

      {/* Months Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden border-t-4 border-t-green-500/80">
        {/* Table Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-5 py-4 bg-green-50/30 dark:bg-green-900/10">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="بحث عن شهر..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm h-9"
              id="input-search-months"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
            {filtered.length} شهر
          </span>
        </div>

        {loading && months.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin me-2" />
            {t('messages.loading')}
          </div>
        ) : (
          <MonthsTable months={filtered} />
        )}
      </div>

      {/* New Month Sheet */}
      <NewMonthSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      </div>
    </div>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/DisbursementSettingsPage.tsx -->
``tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ArrowLeft, Pencil, Settings, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CategoryBadge } from '@/components/disbursement/category-badge'
import { formatAmount } from '@/lib/disbursement/types'
import { getCategoryConfigs, getGrantConfigs, updateCategoryConfig, updateGrantConfig } from '@/lib/api/disbursement-api'
import type { CategoryConfig, GrantConfig } from '@/lib/disbursement/types'

// ─── Edit Category Dialog ─────────────────────────────────────────────────────

function EditCategoryDialog({
  cat,
  open,
  onOpenChange,
  onSaved,
}: {
  cat: CategoryConfig
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    maxAmount: cat.maxAmount || '',
    capWithDeps: cat.capWithDeps || '',
    capNoDeps: cat.capNoDeps || ''
  })

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await updateCategoryConfig(cat.code, {
        maxAmount: formData.maxAmount,
        capWithDeps: formData.capWithDeps,
        capNoDeps: formData.capNoDeps,
      })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CategoryBadge category={cat.nameAr} />
            تعديل إعدادات الفئة
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">أقصى مبلغ للفئة (ج.م)</Label>
            <Input
              type="number"
              value={formData.maxAmount}
              onChange={(e) => setFormData(p => ({ ...p, maxAmount: e.target.value }))}
              step={50}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">الحد بأبناء (ج.م)</Label>
            <Input
              type="number"
              value={formData.capWithDeps}
              onChange={(e) => setFormData(p => ({ ...p, capWithDeps: e.target.value }))}
              step={50}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-slate-300 text-sm">الحد بدون أبناء (ج.م)</Label>
            <Input
              type="number"
              value={formData.capNoDeps}
              onChange={(e) => setFormData(p => ({ ...p, capNoDeps: e.target.value }))}
              step={50}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Grant Dialog ────────────────────────────────────────────────────────

function EditGrantDialog({
  grant,
  open,
  onOpenChange,
  onSaved,
}: {
  grant: GrantConfig
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nameAr: grant.nameAr,
    amount: grant.amount,
    type: grant.type,
    active: grant.active
  })

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await updateGrantConfig(grant.code, {
        nameAr: formData.nameAr,
        amount: formData.amount,
        type: formData.type as any,
        active: formData.active
      })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">تعديل {grant.nameAr}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">اسم الحافز</Label>
            <Input
              type="text"
              value={formData.nameAr}
              onChange={(e) => setFormData(p => ({ ...p, nameAr: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">المبلغ (ج.م)</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
              step={10}
              min={0}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">نوع الحافز</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="MONTHLY">شهري</SelectItem>
                <SelectItem value="ANNUAL">سنوي</SelectItem>
                <SelectItem value="PERIODIC">دوري</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={formData.active} onCheckedChange={(v) => setFormData(p => ({ ...p, active: v }))} id={`switch-grant-edit-${grant.code}`} />
            <Label htmlFor={`switch-grant-edit-${grant.code}`} className="text-slate-300 text-sm cursor-pointer">
              نشط
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const GRANT_TYPE_LABEL: Record<GrantConfig['type'], string> = {
  MONTHLY:  'شهري',
  ANNUAL:   'سنوي',
  PERIODIC: 'دوري',
}

const GRANT_TYPE_COLOR: Record<GrantConfig['type'], string> = {
  MONTHLY:  'bg-blue-100 text-blue-700',
  ANNUAL:   'bg-violet-100 text-violet-700',
  PERIODIC: 'bg-cyan-100 text-cyan-700',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DisbursementSettingsPage() {
  const locale = useLocale()
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [grants, setGrants] = useState<GrantConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [editCat, setEditCat] = useState<CategoryConfig | null>(null)
  const [editGrant, setEditGrant] = useState<GrantConfig | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cats, grnts] = await Promise.all([
        getCategoryConfigs(),
        getGrantConfigs()
      ])
      // Filter out legacy numeric codes so the UI only shows Arabic ones (if both exist)
      setCategories(cats.filter(c => isNaN(Number(c.code))))
      setGrants(grnts)
    } catch (e) {
      console.error("Failed to fetch disbursement settings", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Link href={`/${locale}/dashboard/disbursement`}>
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white gap-1.5 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            الصرف المالي
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الإعدادات</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">إدارة إعدادات الفئات والحوافز والمنح</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories" dir="rtl">
        <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 mb-6 h-auto">
          <TabsTrigger
            value="categories"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white text-sm"
          >
            إعدادات الفئات
          </TabsTrigger>
          <TabsTrigger
            value="grants"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white text-sm"
          >
            الحوافز والمنح
          </TabsTrigger>
        </TabsList>

        {/* ─── Categories Tab ─────────────────────────────────────────────── */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card
                key={cat.code}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={cat.nameAr} />
                    <div className="flex items-center gap-2">
                      {!cat.active && (
                        <Badge
                          variant="outline"
                          className="border-red-300 dark:border-red-800 text-red-500 text-[10px] px-1.5 py-0"
                        >
                          غير نشط
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        onClick={() => setEditCat(cat)}
                        id={`btn-edit-cat-${cat.code}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-sm">
                  {[
                    { label: 'الحد الأقصى بأبناء', value: formatAmount(cat.capWithDeps) },
                    { label: 'الحد الأقصى بدون أبناء', value: formatAmount(cat.capNoDeps) },
                    { label: 'أقصى مبلغ للفئة', value: formatAmount(cat.maxAmount), bold: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">{row.label}</span>
                      <span className={`font-mono text-xs ${row.bold ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Grants Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="grants">
          <div className="space-y-2">
            {grants.map((grant) => (
              <div
                key={grant.code}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Switch
                    checked={grant.active}
                    onCheckedChange={async (v) => {
                      try {
                        await updateGrantConfig(grant.code, { active: v })
                        fetchData()
                      } catch(e) {
                        console.error(e)
                      }
                    }}
                    id={`switch-${grant.code}`}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {grant.nameAr}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      الشرط: {grant.condition}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${GRANT_TYPE_COLOR[grant.type]}`}>
                    {GRANT_TYPE_LABEL[grant.type]}
                  </span>
                  <span className="font-mono text-sm font-bold text-green-600 dark:text-green-400 min-w-[80px] text-end">
                    {formatAmount(grant.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    onClick={() => setEditGrant(grant)}
                    id={`btn-edit-grant-${grant.code}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-green-400 hover:text-green-600 gap-1.5"
              id="btn-add-grant"
            >
              <Plus className="h-4 w-4" />
              إضافة حافز جديد
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      {editCat && (
        <EditCategoryDialog
          cat={editCat}
          open={!!editCat}
          onOpenChange={(v) => { if (!v) setEditCat(null) }}
          onSaved={fetchData}
        />
      )}
      {editGrant && (
        <EditGrantDialog
          grant={editGrant}
          open={!!editGrant}
          onOpenChange={(v) => { if (!v) setEditGrant(null) }}
          onSaved={fetchData}
        />
      )}
    </div>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/kpi-cards.tsx -->
``tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface KpiCardsProps {
  totalFamilies: number
  totalMonths: number
  approvedMonths: number
}

export function KpiCards({ totalFamilies, totalMonths, approvedMonths }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Total Families */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي الأسر</p>
              <p className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">{totalFamilies.toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Total Months */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي الدورات</p>
              <p className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-500">{totalMonths.toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Approved Months */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">الدورات المعتمدة</p>
              <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-500">{approvedMonths.toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Active Months */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">الدورات النشطة</p>
              <p className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-500">{(totalMonths - approvedMonths).toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/MonthDetailPage.tsx -->
``tsx
'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import {
  ArrowLeft, Lock, Download, FileText, RefreshCw,
  CheckCircle, Unlock, AlertTriangle, Search, X, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/disbursement/status-badge'
import { PaymentTable } from '@/components/disbursement/payment-table'
import { formatPeriod, formatAmount, CATEGORY_LABELS } from '@/lib/disbursement/types'
import { useDisbursementStore } from '@/lib/disbursement/store'
import { getMeezaExportUrl } from '@/lib/api/disbursement-api'

interface MonthDetailPageProps {
  params: Promise<{ id: string }>
}

export function MonthDetailPage({ params }: MonthDetailPageProps) {
  const { id } = use(params)
  const locale  = useLocale()

  const {
    currentMonth, payments, loading, calculating, error,
    fetchMonth, calculateMonth, approveMonth, reopenMonth, clearError,
  } = useDisbursementStore()

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showReopenDialog,  setShowReopenDialog]  = useState(false)
  const [approveNotes,      setApproveNotes]       = useState('')
  const [reopenReason,      setReopenReason]       = useState('')
  const [approving,         setApproving]          = useState(false)
  const [reopening,         setReopening]          = useState(false)

  // Filter states
  const [search,          setSearch]          = useState('')
  const [categoryFilter,  setCategoryFilter]  = useState('all')
  const [paymentFilter,   setPaymentFilter]   = useState<'all' | 'meeza' | 'cash' | 'pending'>('all')

  useEffect(() => {
    fetchMonth(id)
  }, [id, fetchMonth])

  useEffect(() => {
    if (error) { toast.error(error); clearError() }
  }, [error, clearError])

  const handleCalculate = async () => {
    try {
      await calculateMonth(id)
      toast.success('تم الحساب بنجاح')
    } catch { /* error already in store */ }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      await approveMonth(id, approveNotes || undefined)
      toast.success('تم اعتماد الشهر')
      setShowApproveDialog(false)
      setApproveNotes('')
    } catch { /* error already in store */ }
    finally { setApproving(false) }
  }

  const handleReopen = async () => {
    if (!reopenReason.trim()) { toast.error('سبب إعادة الفتح مطلوب'); return }
    setReopening(true)
    try {
      await reopenMonth(id, reopenReason)
      toast.success('تم إعادة فتح الشهر')
      setShowReopenDialog(false)
      setReopenReason('')
    } catch { /* error already in store */ }
    finally { setReopening(false) }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading && !currentMonth) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <p className="text-sm">جاري التحميل...</p>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!currentMonth) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">الشهر غير موجود</h2>
        <Link href={`/${locale}/dashboard/disbursement`}>
          <Button variant="outline">العودة للقائمة</Button>
        </Link>
      </div>
    )
  }

  const isApproved   = currentMonth.status === 'APPROVED' || currentMonth.status === 'PAID'
  const totalFinal   = payments.reduce((s, p) => s + Number(p.finalAmount), 0)
  const totalMeeza   = payments.reduce((s, p) => s + Number(p.meezaAmount), 0)
  const totalCash    = payments.reduce((s, p) => s + Number(p.cashAmount), 0)
  const unpaidCount  = payments.filter(p => p.meezaStatus === 'PENDING' || p.cashStatus === 'PENDING').length

  // Apply filters
  const filtered = payments.filter((p) => {
    const code    = p.household?.code ?? ''
    const name    = p.household?.familyName ?? ''
    const matchSearch   = !search || code.toLowerCase().includes(search.toLowerCase()) || name.includes(search)
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter
    const matchPayment  =
      paymentFilter === 'all' ||
      (paymentFilter === 'meeza'   && Number(p.meezaAmount) > 0) ||
      (paymentFilter === 'cash'    && Number(p.cashAmount) > 0) ||
      (paymentFilter === 'pending' && (p.meezaStatus === 'PENDING' || p.cashStatus === 'PENDING'))
    return matchSearch && matchCategory && matchPayment
  })

  const resetFilters   = () => { setSearch(''); setCategoryFilter('all'); setPaymentFilter('all') }
  const hasActiveFilters = search || categoryFilter !== 'all' || paymentFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link href={`/${locale}/dashboard/disbursement`}>
          <Button
            variant="ghost" size="sm"
            className="mb-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white gap-1.5 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            الصرف المالي
          </Button>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPeriod(currentMonth.period)}
            </h1>
            <StatusBadge status={currentMonth.status} />
            {isApproved && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Lock className="h-3.5 w-3.5" />
                معتمد ومقفل
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Calculate / Recalculate */}
            {(currentMonth.status === 'DRAFT' || currentMonth.status === 'CALCULATED') && (
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                onClick={handleCalculate}
                disabled={calculating}
              >
                <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
                {currentMonth.status === 'DRAFT' ? 'احسب الشهر' : 'إعادة الحساب'}
              </Button>
            )}

            {/* Approve */}
            {currentMonth.status === 'CALCULATED' && (
              <Button
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowApproveDialog(true)}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4" />
                اعتماد الشهر
              </Button>
            )}

            {/* Export Meeza */}
            {(currentMonth.status === 'APPROVED' || currentMonth.status === 'PAID') && (
              <>
                <a href={getMeezaExportUrl(currentMonth.id)} download>
                  <Button
                    variant="outline" size="sm"
                    className="gap-1.5 border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Download className="h-4 w-4" />
                    تصدير ميزة
                  </Button>
                </a>
                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <FileText className="h-4 w-4" />
                  كشف النقدي
                </Button>
              </>
            )}

            {/* Reopen */}
            {currentMonth.status === 'APPROVED' && (
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => setShowReopenDialog(true)}
              >
                <Unlock className="h-4 w-4" />
                إعادة الفتح
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'عدد الأسر',      value: payments.length.toLocaleString('en-US'),     color: 'text-slate-800 dark:text-white' },
          { label: 'إجمالي القبض',   value: formatAmount(totalFinal),                   color: 'text-green-600 dark:text-green-400' },
          { label: 'تحويلات ميزة',   value: formatAmount(totalMeeza),                   color: 'text-blue-600 dark:text-blue-400' },
          { label: 'نقدي في المقر',  value: formatAmount(totalCash),                    color: 'text-amber-600 dark:text-amber-400' },
        ].map((item, idx) => (
          <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
            <p className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="رقم القيد أو اسم الأسرة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 h-9 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
              id="input-search-families"
            />
          </div>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36 h-9 text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" id="select-category-filter">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([code, label]) => (
                <SelectItem key={code} value={code}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment filter */}
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as typeof paymentFilter)}>
            <SelectTrigger className="w-36 h-9 text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" id="select-payment-filter">
              <SelectValue placeholder="حالة الصرف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="meeza">ميزة</SelectItem>
              <SelectItem value="cash">نقدي</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm border-slate-200 dark:border-slate-600">
            <Building2 className="h-3.5 w-3.5" />
            مساهمات خارجية
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 gap-1" onClick={resetFilters}>
              <X className="h-3.5 w-3.5" />
              إعادة تعيين
            </Button>
          )}

          <span className="ms-auto text-xs text-slate-500 dark:text-slate-400 shrink-0">
            {filtered.length} / {payments.length} أسرة
          </span>
        </div>
      </div>

      {/* Payment Table */}
      <PaymentTable families={filtered} isApproved={isApproved} monthId={id} />

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              اعتماد شهر {formatPeriod(currentMonth.period)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              سيتم قفل الشهر بعد الاعتماد ولن يمكن إجراء تعديلات. تأكد من مراجعة جميع البيانات قبل المتابعة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-white text-sm">ملاحظات (اختياري)</Label>
            <Textarea
              placeholder="أي ملاحظات على شهر الصرف..."
              rows={2}
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              className="mt-1.5 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? 'جاري الاعتماد...' : 'تأكيد الاعتماد'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reopen Dialog */}
      <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              إعادة فتح الشهر المعتمد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-400">
              ستتم إزالة اعتماد هذا الشهر وإعادته لحالة &quot;محسوب&quot;. هذا الإجراء مقيد بصلاحيات المدير.
            </p>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">سبب إعادة الفتح <span className="text-red-400">*</span></Label>
              <Textarea
                placeholder="اذكر سبب إعادة فتح الشهر..."
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => setShowReopenDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              onClick={handleReopen}
              disabled={reopening || !reopenReason.trim()}
            >
              <Unlock className="h-4 w-4" />
              {reopening ? 'جاري...' : 'إعادة الفتح'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/months-table.tsx -->
``tsx
'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Eye, Download, CheckCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/disbursement/status-badge'
import { formatPeriod, formatAmount } from '@/lib/disbursement/types'
import type { DisbursementMonth } from '@/lib/disbursement/types'

const METHOD_LABELS: Record<string, string> = {
  VULNERABILITY: 'حسب الهشاشة',
  PROPORTIONAL:  'نسبي',
  SCORE_BASED:   'حسب الدرجة',
}

interface MonthsTableProps {
  months: DisbursementMonth[]
  onApprove?: (id: string) => void
}

export function MonthsTable({ months, onApprove }: MonthsTableProps) {
  const locale = useLocale()

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <span className="text-3xl">📋</span>
        </div>
        <p className="text-base font-medium text-slate-700 dark:text-slate-300">
          لا توجد شهور مفتوحة بعد
        </p>
        <p className="mt-1 text-sm text-slate-500">ابدأ بفتح شهر جديد لإدارة الصرف المالي</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الشهر</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الطريقة</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">عدد الأسر</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الميزانية</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الحالة</th>
            <th className="px-5 py-3.5 text-center font-semibold text-xs tracking-wide">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, idx) => (
            <tr
              key={month.id}
              className={`border-b border-slate-100 dark:border-slate-700 transition-colors hover:bg-green-50/40 dark:hover:bg-green-900/10 ${
                idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/20 dark:bg-slate-800/60'
              }`}
            >
              {/* الشهر */}
              <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                {formatPeriod(month.period)}
              </td>

              {/* الطريقة */}
              <td className="px-5 py-3.5">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  month.method === 'VULNERABILITY'
                    ? 'bg-violet-100 text-violet-700'
                    : month.method === 'PROPORTIONAL'
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {METHOD_LABELS[month.method] ?? month.method}
                </span>
              </td>

              {/* عدد الأسر */}
              <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                <span className="font-mono">{month._count?.payments ?? 0}</span> أسرة
              </td>

              {/* الميزانية */}
              <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-mono">
                {month.totalBudget ? formatAmount(month.totalBudget) : '—'}
              </td>

              {/* الحالة */}
              <td className="px-5 py-3.5">
                <StatusBadge status={month.status} />
              </td>

              {/* إجراءات */}
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-center gap-1">
                  {/* View */}
                  <Link href={`/${locale}/dashboard/disbursement/${month.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700"
                      title="عرض التفاصيل"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  {/* Export */}
                  {(month.status === 'APPROVED' || month.status === 'PAID') && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/disbursement/${month.id}/export/meeza`}
                      download
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700"
                        title="تصدير ميزة"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  )}

                  {/* Approve */}
                  {month.status === 'CALCULATED' && onApprove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="اعتماد"
                      onClick={() => onApprove(month.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Lock icon for approved */}
                  {month.status === 'APPROVED' && (
                    <span className="flex h-8 w-8 items-center justify-center text-amber-500" title="معتمد ومقفل">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/new-month-sheet.tsx -->
``tsx
'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { BarChart2, Wallet, Play, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatAmount, CATEGORY_LABELS } from '@/lib/disbursement/types'
import { useDisbursementStore } from '@/lib/disbursement/store'

interface NewMonthSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
const YEARS = [2024, 2025, 2026, 2027]

const CATEGORY_COLORS_CHART: Record<string, string> = {
  '1': '#a855f7', '2': '#3b82f6', '3': '#0ea5e9',
  '4': '#94a3b8', '5': '#f59e0b', '6': '#22c55e',
  '7': '#f43f5e', '9': '#ec4899', '10': '#f97316',
}

function StepDot({ active, done }: { active?: boolean; done?: boolean }) {
  return (
    <div className={`h-2.5 w-2.5 rounded-full transition-all ${
      done ? 'bg-green-500' : active ? 'bg-white' : 'bg-slate-600'
    }`} />
  )
}

export function NewMonthSheet({ open, onOpenChange }: NewMonthSheetProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear().toString())
  const [method, setMethod]               = useState<'VULNERABILITY' | 'PROPORTIONAL'>('VULNERABILITY')
  const [budget, setBudget]               = useState('')
  const [isCreating, setIsCreating]       = useState(false)

  const { simulate, simulation, loading: simLoading, openMonth } = useDisbursementStore()
  const isSimulating = simLoading && !simulation

  const handleNext = () => {
    if (selectedMonth && selectedYear) setStep(2)
  }

  const handleSimulate = async () => {
    const monthIndex = ARABIC_MONTHS.indexOf(selectedMonth) + 1
    const year = parseInt(selectedYear)
    if (!monthIndex || !year) return
    await simulate({
      method,
      totalBudget: method === 'PROPORTIONAL' && budget ? Number(budget) : undefined,
    })
  }

  const reset = () => {
    setStep(1)
    setSelectedMonth('')
    setMethod('VULNERABILITY')
    setBudget('')
  }

  const handleCreate = async () => {
    const monthIndex = ARABIC_MONTHS.indexOf(selectedMonth) + 1
    const year = parseInt(selectedYear)
    if (!monthIndex || !year) return
    const period = `${year}-${String(monthIndex).padStart(2, '0')}-01`
    setIsCreating(true)
    try {
      await openMonth({
        period,
        method,
        totalBudget: method === 'PROPORTIONAL' && budget ? Number(budget) : undefined,
      })
      toast.success('تم فتح الشهر الجديد')
      onOpenChange(false)
      setTimeout(reset, 300)
    } catch { /* error shown via store */ }
    finally { setIsCreating(false) }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[520px] bg-slate-900 border-slate-700 text-white p-0 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2 mb-3">
            <StepDot done={step === 2} active={step === 1} />
            <StepDot active={step === 2} />
          </div>
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-white text-start">
              {step === 1 ? 'إعداد الشهر' : 'معاينة ومحاكاة'}
            </SheetTitle>
            <p className="text-slate-400 text-sm text-start">
              {step === 1
                ? 'اختر الشهر وطريقة الحساب'
                : 'راجع التوقعات قبل بدء الحساب'}
            </p>
          </SheetHeader>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {step === 1 ? (
            <>
              {/* Month & Year */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">اختر الشهر والسنة</Label>
                <div className="flex gap-3">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="flex-1 bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="الشهر" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {ARABIC_MONTHS.map((m, i) => (
                        <SelectItem key={i} value={m} className="text-white hover:bg-slate-700">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y.toString()} className="text-white hover:bg-slate-700">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calculation Method */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-200">طريقة الحساب</Label>
                <RadioGroup value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                  {/* VULNERABILITY */}
                  <div
                    className={`rounded-xl border-2 cursor-pointer transition-all p-4 ${
                      method === 'VULNERABILITY'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                    onClick={() => setMethod('VULNERABILITY')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="VULNERABILITY" className="mt-0.5 border-slate-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart2 className="h-4 w-4 text-green-400" />
                          <span className="font-semibold text-sm">حسب نسبة الهشاشة</span>
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            موصى به
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          يُحسب القبض تلقائياً من درجة استحقاق كل أسرة
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PROPORTIONAL */}
                  <div
                    className={`rounded-xl border-2 cursor-pointer transition-all p-4 ${
                      method === 'PROPORTIONAL'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                    onClick={() => setMethod('PROPORTIONAL')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="PROPORTIONAL" className="mt-0.5 border-slate-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="h-4 w-4 text-cyan-400" />
                          <span className="font-semibold text-sm">توزيع الميزانية</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          أدخل ميزانية الشهر وسيتم التوزيع نسبياً على الأسر
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {/* Budget input */}
                {method === 'PROPORTIONAL' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="budget-input" className="text-sm text-slate-300">
                      الميزانية الكلية (ج.م)
                    </Label>
                    <Input
                      id="budget-input"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="مثال: 50000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Simulation Header Card */}
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
                <p className="font-semibold text-sm text-white mb-0.5">محاكاة الشهر</p>
                <p className="text-xs text-slate-400">
                  {selectedMonth} {selectedYear} ·{' '}
                  {method === 'VULNERABILITY' ? 'حسب الهشاشة' : 'توزيع الميزانية'}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {isSimulating
                  ? [...Array(6)].map((_, i) => (
                      <div key={i} className="h-[76px] rounded-xl bg-slate-800 animate-pulse" />
                    ))
                  : simulation
                  ? (
                    <>
                      <MetricTile label="عدد الأسر المؤهلة" value={`${simulation.eligibleCount} أسرة`} />
                      <MetricTile label="إجمالي القبض المتوقع" value={formatAmount(simulation.totalRequired)} accent="green" />
                      <MetricTile label="متوسط القبض المتوقع" value={formatAmount(simulation.averagePayment)} />
                      <MetricTile label="أعلى قبض" value={formatAmount(simulation.maxPayment)} accent="amber" />
                      <MetricTile label="أقل قبض" value={formatAmount(simulation.minPayment)} />
                      {simulation.surplus != null && (
                        <MetricTile
                          label={simulation.surplus >= 0 ? 'الميزانية المتبقية' : 'العجز'}
                          value={formatAmount(Math.abs(simulation.surplus))}
                          accent={simulation.surplus >= 0 ? 'green' : 'amber'}
                          suffix={simulation.surplus >= 0 ? '✅' : '⚠️'}
                        />
                      )}
                    </>
                  ) : (
                    <div className="col-span-2 flex items-center justify-center h-24 rounded-xl bg-slate-800/50 border border-dashed border-slate-700">
                      <p className="text-sm text-slate-500">اضغط "بدء المحاكاة" لعرض التوقعات</p>
                    </div>
                  )}
              </div>

              {/* Chart */}
              {simulation && !isSimulating && simulation.byCategory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-300">توزيع الأسر بالفئات</p>
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={simulation.byCategory.map(c => ({
                          nameAr: CATEGORY_LABELS[c.category] ?? c.category,
                          count: c.count,
                          color: CATEGORY_COLORS_CHART[c.category] ?? '#64748b',
                        }))}
                        layout="vertical"
                        margin={{ top: 0, right: 16, left: 72, bottom: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="nameAr" width={68} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {simulation.byCategory.map((_, i) => (
                            <Cell key={i} fill={Object.values(CATEGORY_COLORS_CHART)[i % 9]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4 flex items-center gap-2 bg-slate-900">
          {step === 1 ? (
            <>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleClose}>
                إلغاء
              </Button>
              <Button
                size="sm"
                className="ms-auto bg-green-600 hover:bg-green-700 text-white gap-1.5"
                disabled={!selectedMonth || !selectedYear}
                onClick={handleNext}
              >
                التالي
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={() => setStep(1)}
              >
                السابق
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={handleSimulate}
                disabled={isSimulating}
              >
                <Play className="h-3 w-3 ms-1" />
                {isSimulating ? 'جاري المحاكاة...' : 'بدء المحاكاة'}
              </Button>
              <Button
                size="sm"
                className="ms-auto bg-green-600 hover:bg-green-700 text-white"
                onClick={handleCreate}
                disabled={isSimulating || isCreating}
              >
                {isCreating ? 'جاري الإنشاء...' : 'بدء الحساب'}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MetricTile({
  label,
  value,
  accent,
  suffix,
}: {
  label: string
  value: string
  accent?: 'green' | 'amber'
  suffix?: string
}) {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      <p className={`text-lg font-bold font-mono ${
        accent === 'green' ? 'text-green-400' :
        accent === 'amber' ? 'text-amber-400' :
        'text-white'
      }`}>
        {value} {suffix}
      </p>
    </div>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/payment-table.tsx -->
``tsx
'use client'

import { useState } from 'react'
import { Pencil, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CategoryBadge } from '@/components/disbursement/category-badge'
import { formatAmount, PAYMENT_STATUS_CONFIG } from '@/lib/disbursement/types'
import type { MonthlyPayment, PaymentStatus, FundSource } from '@/lib/disbursement/types'
import { useDisbursementStore } from '@/lib/disbursement/store'
import { Lock, Loader2 } from 'lucide-react'

// Helper to color vulnerability score
export const getVulnerabilityColor = (scoreStr: string | number): string => {
  const score = Number(scoreStr)
  if (score >= 80) return 'bg-rose-500'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 40) return 'bg-amber-500'
  if (score >= 20) return 'bg-blue-500'
  return 'bg-slate-400'
}

export const getVulnerabilityTextColor = (scoreStr: string | number): string => {
  const score = Number(scoreStr)
  if (score >= 80) return 'text-rose-600'
  if (score >= 60) return 'text-orange-600'
  if (score >= 40) return 'text-amber-600'
  if (score >= 20) return 'text-blue-600'
  return 'text-slate-500'
}

interface PaymentTableProps {
  families: MonthlyPayment[]
  isApproved: boolean
  monthId: string
}

// ─── Adjustment Dialog ────────────────────────────────────────────────────────

function AdjustmentDialog({
  open,
  onOpenChange,
  payment,
  isApproved,
  monthId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  payment: MonthlyPayment
  isApproved: boolean
  monthId: string
}) {
  const [adjustment, setAdjustment] = useState(payment.manualAdjustment || '0')
  const [reason, setReason] = useState(payment.adjustmentReason || '')
  const [fundSource, setFundSource] = useState<FundSource>(payment.fundSource || 'GENERAL')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { adjustPayment } = useDisbursementStore()

  const handleSave = async () => {
    if (!reason.trim()) { toast.error('الرجاء إدخال سبب التعديل'); return }
    setIsSubmitting(true)
    try {
      await adjustPayment(monthId, payment.householdId, {
        manualAdjustment: Number(adjustment),
        adjustmentReason: reason,
        fundSource,
      })
      toast.success('تم حفظ التعديل')
      onOpenChange(false)
    } catch { /* error handled by store */ }
    finally { setIsSubmitting(false) }
  }

  const code = payment.household?.code || ''
  const name = payment.household?.familyName || 'أسرة بدون اسم'
  const calculated = Number(payment.calculatedAmount || 0)
  const adjNum = Number(adjustment || 0)
  const final = calculated + adjNum

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {isApproved && <Lock className="h-4 w-4 text-amber-400" />}
            تعديل قبض الأسرة
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            رقم القيد: {code} — {name}
          </DialogDescription>
        </DialogHeader>

        {isApproved ? (
          <div className="flex items-center gap-3 rounded-lg bg-amber-950/30 border border-amber-800/30 p-4">
            <Lock className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-amber-400 font-medium text-sm">الشهر معتمد — لا يمكن التعديل</p>
              <p className="text-slate-400 text-xs mt-0.5">يجب إعادة فتح الشهر لإجراء تعديلات</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Summary */}
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">القبض المحسوب</span>
                <span className="font-mono text-white">{formatAmount(calculated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التعديل الحالي</span>
                <span className={`font-mono ${adjNum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {adjNum > 0 ? '+' : ''}{formatAmount(adjNum)}
                </span>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between font-semibold">
                <span>الإجمالي النهائي</span>
                <span className="text-green-400 font-mono">{formatAmount(final)}</span>
              </div>
            </div>

            {/* Adjustment input */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm">التعديل اليدوي (ج.م)</Label>
              <Input
                type="number"
                step="0.01"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="موجب للزيادة، سالب للخصم"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">مثال: 100 للزيادة، أو -50 للخصم من المبلغ المحسوب</p>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm">
                سبب التعديل <span className="text-red-400">*</span>
              </Label>
              <Textarea
                placeholder="اذكر سبب التعديل بوضوح..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
            </div>

            {/* Fund source */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm">مصدر التمويل</Label>
              <Select value={fundSource} onValueChange={(v) => setFundSource(v as FundSource)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="GENERAL">عام</SelectItem>
                  <SelectItem value="ZAKAT">زكاة</SelectItem>
                  <SelectItem value="SADAQA">صدقة</SelectItem>
                  <SelectItem value="ORPHAN_FUND">صندوق الأيتام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          {!isApproved && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
              حفظ التعديل
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Payment Status Cell ──────────────────────────────────────────────────────

function PaymentStatusCell({ amount, status }: { amount: string | number; status: PaymentStatus }) {
  const num = Number(amount)
  if (!num) return <span className="text-slate-400 text-xs">—</span>
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{formatAmount(num)}</span>
      <div className="flex items-center gap-1">
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        <span className="text-[10px] text-slate-500 dark:text-slate-400">{config.label}</span>
      </div>
    </div>
  )
}

// ─── Expandable External Row ──────────────────────────────────────────────────

function ExternalContribRow({ payment }: { payment: MonthlyPayment }) {
  const [expanded, setExpanded] = useState(false)
  const externalTotal = Number(payment.externalTotal || 0)

  if (externalTotal === 0) {
    return <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <Building2 className="h-3 w-3" />
        <span className="text-xs font-mono">{formatAmount(externalTotal)}</span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && payment.externalContributions && (
        <div className="mt-1.5 space-y-1 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-2 text-xs min-w-[160px] relative z-10 shadow-lg">
          {payment.externalContributions.map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-slate-600 dark:text-slate-300">{c.institutionName}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-800 dark:text-white">{formatAmount(c.amount)}</span>
                <span className={`text-[10px] ${c.confirmed ? 'text-green-500' : 'text-amber-500'}`}>
                  {c.confirmed ? '✓' : '؟'}
                </span>
              </div>
            </div>
          ))}
          <Separator className="my-1 bg-slate-200 dark:bg-slate-600" />
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">الفارق من مؤسستنا</span>
            <span className="text-green-600 dark:text-green-400 font-mono">{formatAmount(payment.compensationAmount)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentTable({ families, isApproved, monthId }: PaymentTableProps) {
  const [adjustPayment, setAdjustPayment] = useState<MonthlyPayment | null>(null)

  if (families.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">لا توجد أسر مطابقة للبحث</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-x-auto shadow-sm border-t-4 border-t-green-500/80">
        <table className="w-full text-sm min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">رقم القيد</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">اسم الأسرة</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">الفئة</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">الهشاشة%</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">القبض الأساسي</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">الحوافز</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">المستحق</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide hidden md:table-cell">مساهمة خارجية</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide hidden md:table-cell">التعويض</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">الإجمالي</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">ميزة</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">نقدي</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold tracking-wide">⚙</th>
            </tr>
          </thead>
          <tbody>
            {families.map((payment, idx) => {
              const code = payment.household?.code || ''
              const name = payment.household?.familyName || 'أسرة بدون اسم'
              const percent = Number(payment.normalizedPercent || 0)
              const incentives = Number(payment.grantsTotal || 0) + Number(payment.mergeBonus || 0)
              const manualAdj = Number(payment.manualAdjustment || 0)
              const compensation = Number(payment.compensationAmount || 0)

              return (
                <tr
                  key={payment.id}
                  className={`border-b border-slate-100 dark:border-slate-700 transition-colors hover:bg-green-50/40 dark:hover:bg-green-900/10 ${
                    idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/70'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {code}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <CategoryBadge category={payment.category} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                        <div
                          className={`h-full rounded-full transition-all ${getVulnerabilityColor(percent)}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-semibold ${getVulnerabilityTextColor(percent)}`}>
                        {percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatAmount(payment.baseAmount)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {incentives > 0 ? (
                      <span className="text-violet-600 dark:text-violet-400">+{formatAmount(incentives)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatAmount(payment.calculatedAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    <ExternalContribRow payment={payment} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap hidden md:table-cell">
                    {compensation > 0 ? (
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatAmount(compensation)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">
                        {formatAmount(payment.finalAmount)}
                      </span>
                      {manualAdj !== 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0"
                            >
                              معدّل
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>تعديل يدوي: {manualAdj >= 0 ? '+' : ''}{formatAmount(manualAdj)}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PaymentStatusCell amount={payment.meezaAmount} status={payment.meezaStatus} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PaymentStatusCell amount={payment.cashAmount} status={payment.cashStatus} />
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                          disabled={isApproved}
                          onClick={() => setAdjustPayment(payment)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isApproved ? 'الشهر معتمد — لا يمكن التعديل' : 'تعديل يدوي'}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Adjustment Dialog */}
      {adjustPayment && (
        <AdjustmentDialog
          open={!!adjustPayment}
          onOpenChange={(v) => { if (!v) setAdjustPayment(null) }}
          payment={adjustPayment}
          isApproved={isApproved}
          monthId={monthId}
        />
      )}
    </TooltipProvider>
  )
}
````

<!-- SOURCE: frontend/components/disbursement/status-badge.tsx -->
``tsx
'use client'

import { cn } from '@/lib/utils'
import type { MonthStatus } from '@/lib/disbursement/types'
import { MONTH_STATUS_CONFIG } from '@/lib/disbursement/types'

interface StatusBadgeProps {
  status: MonthStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = MONTH_STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-600' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
````

<!-- SOURCE: frontend/lib/disbursement/mock-data.ts -->
``ts
export type MonthStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
export type FamilyCategory = string

export interface DisbursementFamily {
  id: string
  code: string
  name: string
  category: string
  vulnerabilityScore: number
  baseAmount: number
  incentives: number
  entitlement: number
  externalContributions: any[]
  externalTotal: number
  compensation: number
  manualAdjustment: number
  finalAmount: number
  meezaAmount: number
  meezaStatus: string
  cashAmount: number
  cashStatus: string
}

export interface DisbursementMonth {
  id: string
  period: string
  status: MonthStatus
  method: 'VULNERABILITY' | 'PROPORTIONAL'
  totalBudget: number
  familyCount: number
  totalDisbursed: number
  meezaTotal: number
  cashTotal: number
  families: DisbursementFamily[]
  createdAt: string
  approvedAt?: string
}

export interface CategorySettings {
  code: string
  nameAr: string
  capWithDeps: number
  capNoDeps: number
  maxAmount: number
  active: boolean
}

export interface GrantIncentive {
  code: string
  nameAr: string
  active: boolean
  type: 'MONTHLY' | 'ANNUAL' | 'PERIODIC'
  amount: number
  condition: string
}

// ─── helpers ────────────────────────────────────────────────────────────────

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const FAMILY_NAMES = [
  'الأحمد', 'الحسن', 'الخالد', 'السالم', 'العتيبي',
  'الدعيج', 'الهاجري', 'المطيري', 'الجابر', 'الشمري',
  'الحويطي', 'العنزي', 'المري', 'الزعبي', 'الضويان',
]

const INSTITUTIONS = [
  'مؤسسة النور', 'جمعية الخير', 'صندوق الرحمة', 'مؤسسة التكافل',
]

const CATEGORIES: FamilyCategory[] = [
  'أيتام', 'إعاقة', 'طالب علم', 'سجناء',
  'مساعدات', 'دعم خارجي', 'منفردون', 'مطلقات', 'مساكين',
]

function generateFamily(index: number, monthId: string): DisbursementFamily {
  const id = `${monthId}-family-${index}`
  const category = pick(CATEGORIES)
  const vulnerabilityScore = rnd(15, 98)
  const baseAmount = rnd(600, 2200)
  const incentives = pick([0, 0, 200, 300, 500])
  const entitlement = baseAmount + incentives

  const hasExternal = Math.random() > 0.65
  const externalContributions = hasExternal
    ? [
        {
          institutionName: pick(INSTITUTIONS),
          amount: rnd(200, 800),
          confirmed: Math.random() > 0.3,
        },
      ]
    : []
  const externalTotal = externalContributions.reduce((s, c) => s + c.amount, 0)
  const compensation = Math.max(0, entitlement - externalTotal)
  const manualAdjustment = pick([0, 0, 0, 100, -100, 200])
  const finalAmount = Math.max(0, compensation + manualAdjustment)
  const meezaAmount = Math.round(finalAmount * 0.35)
  const cashAmount = finalAmount - meezaAmount

  return {
    id,
    code: `REG${String(index).padStart(5, '0')}`,
    name: pick(FAMILY_NAMES),
    category,
    vulnerabilityScore,
    baseAmount,
    incentives,
    entitlement,
    externalContributions,
    externalTotal,
    compensation,
    manualAdjustment,
    finalAmount,
    meezaAmount,
    meezaStatus: pick(['PENDING', 'PAID', 'FAILED', 'PAID', 'PAID']),
    cashAmount,
    cashStatus: pick(['PENDING', 'PAID', 'PAID', 'PAID', 'FAILED']),
  }
}

function generateMonth(
  index: number,
  status: DisbursementMonth['status'],
): DisbursementMonth {
  const id = `disbursement-month-${index}`
  const date = new Date()
  date.setMonth(date.getMonth() - index)
  date.setDate(1)

  const familyCount = rnd(28, 52)
  const families = Array.from({ length: familyCount }, (_, i) =>
    generateFamily(i + 1, id),
  )

  const totalDisbursed = families.reduce((s, f) => s + f.finalAmount, 0)
  const meezaTotal = families.reduce((s, f) => s + f.meezaAmount, 0)
  const cashTotal = families.reduce((s, f) => s + f.cashAmount, 0)
  const totalBudget = Math.round(totalDisbursed * (1 + Math.random() * 0.15 + 0.05))

  return {
    id,
    period: date.toISOString(),
    status,
    method: pick(['VULNERABILITY', 'PROPORTIONAL']),
    totalBudget,
    familyCount,
    totalDisbursed,
    meezaTotal,
    cashTotal,
    families,
    createdAt: date.toISOString(),
    approvedAt:
      status === 'APPROVED' || status === 'PAID'
        ? new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
  }
}

// ─── mock data ──────────────────────────────────────────────────────────────

// Stable reference (no SSR re-generation on each render)
const STATUSES: DisbursementMonth['status'][] = [
  'CALCULATED',
  'APPROVED',
  'PAID',
  'PAID',
  'DRAFT',
]

function buildMockMonths(): DisbursementMonth[] {
  return STATUSES.map((status, i) => generateMonth(i, status))
}

// Export as a stable module-level constant
export const mockDisbursementMonths: DisbursementMonth[] = buildMockMonths()

// ─── settings mock data ──────────────────────────────────────────────────────

export const mockCategorySettings: CategorySettings[] = [
  { code: 'ORPHANS',   nameAr: 'أيتام',      capWithDeps: 1500, capNoDeps: 1200, maxAmount: 1800, active: true  },
  { code: 'DISABLED',  nameAr: 'إعاقة',      capWithDeps: 1400, capNoDeps: 1100, maxAmount: 1700, active: true  },
  { code: 'STUDENTS',  nameAr: 'طالب علم',   capWithDeps: 1200, capNoDeps: 1000, maxAmount: 1500, active: true  },
  { code: 'PRISONERS', nameAr: 'أسر سجناء',  capWithDeps: 900,  capNoDeps: 800,  maxAmount: 1100, active: true  },
  { code: 'ASSIST',    nameAr: 'مساعدات',    capWithDeps: 1100, capNoDeps: 900,  maxAmount: 1300, active: true  },
  { code: 'EXTERNAL',  nameAr: 'دعم خارجي',  capWithDeps: 1000, capNoDeps: 800,  maxAmount: 1200, active: false },
  { code: 'SINGLES',   nameAr: 'منفردون',    capWithDeps: 900,  capNoDeps: 800,  maxAmount: 1050, active: true  },
  { code: 'DIVORCED',  nameAr: 'مطلقات',     capWithDeps: 950,  capNoDeps: 820,  maxAmount: 1100, active: true  },
  { code: 'POOR',      nameAr: 'مساكين',     capWithDeps: 850,  capNoDeps: 750,  maxAmount: 1000, active: true  },
]

export const mockGrantIncentives: GrantIncentive[] = [
  { code: 'FUEL',      nameAr: 'مستحقات الوقود',    active: true,  type: 'MONTHLY',  amount: 200, condition: 'الأسرة صاحبة عمل' },
  { code: 'EDUCATION', nameAr: 'تعليم الأطفال',    active: true,  type: 'ANNUAL',   amount: 500, condition: 'وجود طالب علم' },
  { code: 'CLOTHING',  nameAr: 'ملابس الشتاء',     active: true,  type: 'ANNUAL',   amount: 300, condition: 'موسم الشتاء' },
  { code: 'HEALTH',    nameAr: 'مساعدة طبية',      active: false, type: 'PERIODIC', amount: 150, condition: 'وجود مرض مزمن' },
  { code: 'RAMADAN',   nameAr: 'مساعدة رمضان',     active: true,  type: 'ANNUAL',   amount: 400, condition: 'شهر رمضان' },
]
````

<!-- SOURCE: frontend/lib/disbursement/store.ts -->
``ts
'use client'

// frontend/lib/disbursement/store.ts
// Zustand store for disbursement module — follows the same pattern as householdStore.ts

import { create } from 'zustand'
import {
  listMonths,
  getMonth,
  openMonth,
  calculateMonth,
  approveMonth,
  reopenMonth,
  adjustPayment,
  updatePaymentStatus,
  simulateMonth,
  addExternalContribution,
  getCategoryConfigs,
  updateCategoryConfig,
  getGrantConfigs,
  updateGrantConfig,
} from '@/lib/api/disbursement-api'
import type {
  DisbursementMonth,
  MonthlyPayment,
  CategoryConfig,
  GrantConfig,
  SimulateResult,
} from './types'

interface DisbursementState {
  // List
  months: DisbursementMonth[]
  monthsTotal: number

  // Current month detail
  currentMonth: DisbursementMonth | null
  payments: MonthlyPayment[]
  paymentsTotal: number

  // Config
  categories: CategoryConfig[]
  grants: GrantConfig[]

  // Simulate
  simulation: SimulateResult | null

  // UI
  loading: boolean
  calculating: boolean
  error: string | null
}

interface DisbursementActions {
  fetchMonths: (params?: Record<string, string | number | undefined>) => Promise<void>
  fetchMonth:  (id: string) => Promise<void>
  openMonth:   (body: { period: string; method: string; totalBudget?: number; notes?: string }) => Promise<DisbursementMonth>
  calculateMonth:      (monthId: string) => Promise<void>
  approveMonth:        (monthId: string, notes?: string) => Promise<void>
  reopenMonth:         (monthId: string, reason: string) => Promise<void>
  adjustPayment:       (monthId: string, paymentId: string, body: { manualAdjustment: number; adjustmentReason: string; fundSource?: string }) => Promise<void>
  updatePaymentStatus: (monthId: string, paymentId: string, body: { meezaStatus?: string; cashStatus?: string }) => Promise<void>
  simulate:            (body: { method: string; totalBudget?: number }) => Promise<void>
  fetchCategories:     () => Promise<void>
  updateCategory:      (code: string, body: Partial<CategoryConfig>) => Promise<void>
  fetchGrants:         () => Promise<void>
  updateGrant:         (code: string, body: Partial<GrantConfig>) => Promise<void>
  addContribution:     (body: { householdId: string; period: string; institutionName: string; amount: number; confirmed?: boolean; notes?: string }) => Promise<void>
  clearError:          () => void
  reset:               () => void
}

const initialState: DisbursementState = {
  months: [],
  monthsTotal: 0,
  currentMonth: null,
  payments: [],
  paymentsTotal: 0,
  categories: [],
  grants: [],
  simulation: null,
  loading: false,
  calculating: false,
  error: null,
}

export const useDisbursementStore = create<DisbursementState & DisbursementActions>(
  (set, get) => ({
    ...initialState,

    fetchMonths: async (params) => {
      set({ loading: true, error: null })
      try {
        const { months, total } = await listMonths(params)
        set({ months, monthsTotal: total })
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    fetchMonth: async (id) => {
      set({ loading: true, error: null })
      try {
        const month = await getMonth(id)
        set({
          currentMonth: month,
          payments: month.payments ?? [],
          paymentsTotal: month.payments?.length ?? 0,
        })
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    openMonth: async (body) => {
      set({ loading: true, error: null })
      try {
        const month = await openMonth(body)
        await get().fetchMonths()
        return month
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    calculateMonth: async (monthId) => {
      set({ calculating: true, error: null })
      try {
        await calculateMonth(monthId)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ calculating: false })
      }
    },

    approveMonth: async (monthId, notes) => {
      set({ loading: true, error: null })
      try {
        await approveMonth(monthId, notes)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    reopenMonth: async (monthId, reason) => {
      set({ loading: true, error: null })
      try {
        await reopenMonth(monthId, reason)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    adjustPayment: async (monthId, paymentId, body) => {
      try {
        await adjustPayment(monthId, paymentId, body)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      }
    },

    updatePaymentStatus: async (monthId, paymentId, body) => {
      try {
        await updatePaymentStatus(monthId, paymentId, body)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      }
    },

    simulate: async (body) => {
      set({ loading: true, simulation: null, error: null })
      try {
        const result = await simulateMonth(body)
        set({ simulation: result })
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    fetchCategories: async () => {
      const cats = await getCategoryConfigs()
      set({ categories: cats })
    },

    updateCategory: async (code, body) => {
      await updateCategoryConfig(code, body)
      await get().fetchCategories()
    },

    fetchGrants: async () => {
      const grants = await getGrantConfigs()
      set({ grants })
    },

    updateGrant: async (code, body) => {
      await updateGrantConfig(code, body)
      await get().fetchGrants()
    },

    addContribution: async (body) => {
      await addExternalContribution(body)
    },

    clearError: () => set({ error: null }),
    reset:      () => set(initialState),
  }),
)
````

<!-- SOURCE: frontend/lib/disbursement/types.ts -->
``ts
// frontend/lib/disbursement/types.ts — canonical type definitions shared by store + components

export type MonthStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED'
export type DisbursementMethod = 'VULNERABILITY' | 'PROPORTIONAL'
export type FundSource = 'GENERAL' | 'ZAKAT' | 'SADAQA' | 'ORPHAN_FUND'
export type AutoSubCategory = 'POOR' | 'NEEDY' | null

export interface CategoryConfig {
  id: string
  code: string
  nameAr: string
  nameEn: string
  maxAmount?: string
  maxPerChild?: string
  widowBonus?: string
  baseMax?: string
  perDepMax?: string
  poorScoreThreshold?: string
  capWithDeps: string
  capNoDeps: string
  active: boolean
}

export interface GrantConfig {
  id: string
  code: string
  nameAr: string
  nameEn: string
  type: 'MONTHLY' | 'ANNUAL' | 'PERIODIC'
  amount: string
  isPerUnit: boolean
  maxAmount?: string
  condition: string
  categoryFilter?: string[]
  active: boolean
}

export interface DisbursementMonth {
  id: string
  period: string
  method: DisbursementMethod
  totalBudget?: string
  status: MonthStatus
  lockedAt?: string
  lockedById?: string
  reopenedAt?: string
  reopenReason?: string
  notes?: string
  createdAt: string
  _count?: { payments: number }
  payments?: MonthlyPayment[]
  createdBy?: { id: string; name: string }
  lockedBy?:  { id: string; name: string }
}

export interface ExternalContributionInfo {
  institutionName: string
  amount: string
  confirmed: boolean
}

export interface MonthlyPayment {
  id: string
  monthId: string
  householdId: string
  household: { id: string; code: string; familyName?: string }
  category: string
  autoSubCategory: AutoSubCategory
  normalizedPercent: string
  dependentCount: number
  orphanCount: number
  totalIncome: string
  baseAmount: string
  grantsBreakdown: { code: string; nameAr: string; amount: number }[]
  grantsTotal: string
  mergeBonus: string
  rawTotal: string
  appliedCap: string
  calculatedAmount: string
  externalTotal: string
  compensationAmount: string
  externalContributions?: ExternalContributionInfo[]
  manualAdjustment: string
  adjustmentReason?: string
  adjustedById?: string
  adjustedAt?: string
  finalAmount: string
  meezaAmount: string
  cashAmount: string
  meezaCardNumber?: string
  fundSource: FundSource
  meezaStatus: PaymentStatus
  cashStatus: PaymentStatus
  createdAt: string
}

export interface SimulateResult {
  eligibleCount: number
  totalRequired: number
  averagePayment: number
  maxPayment: number
  minPayment: number
  surplus?: number
  deficit?: number
  byCategory: { category: string; count: number; total: number }[]
}

// ─── Display constants ────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  'كفالة أيتام': 'كفالة أيتام',
  'أيتام': 'أيتام',
  'ملف إعاقة': 'ملف إعاقة',
  'إعاقة': 'إعاقة',
  'طلاب علم': 'طلاب علم',
  'طالب علم': 'طالب علم',
  'أسر سجناء': 'أسر سجناء',
  'مساعدات': 'مساعدات',
  'مساعدات موسمية': 'مساعدات موسمية',
  'دعم خارجي': 'دعم خارجي',
  'منفردون': 'منفردون',
  'مطلقات': 'مطلقات',
  'مساكين': 'مساكين',
  'فقراء': 'فقراء',
  'مسنون': 'مسنون',
  'علاج شهري': 'علاج شهري',
  'أمراض مزمنة': 'أمراض مزمنة',
  'حالات هجر': 'حالات هجر',
  'كبار سن': 'كبار سن'
}

export const CATEGORY_COLORS: Record<string, string> = {
  'كفالة أيتام':  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'أيتام':  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'ملف إعاقة':  'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
  'إعاقة':  'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
  'طلاب علم':  'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300',
  'طالب علم':  'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300',
  'أسر سجناء':  'bg-slate-100  text-slate-700  dark:bg-slate-700     dark:text-slate-300',
  'مساعدات':  'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300',
  'مساعدات موسمية': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'دعم خارجي':  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
  'منفردون':  'bg-rose-100   text-rose-800   dark:bg-rose-900/30   dark:text-rose-300',
  'مطلقات':  'bg-pink-100   text-pink-800   dark:bg-pink-900/30   dark:text-pink-300',
  'مساكين': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'فقراء': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'مسنون': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'علاج شهري': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'أمراض مزمنة': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'حالات هجر': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'كبار سن': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
}

export const MONTH_STATUS_CONFIG: Record<MonthStatus, { label: string; color: string }> = {
  DRAFT:      { label: 'مسودة',  color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  CALCULATED: { label: 'محسوب', color: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30 dark:text-blue-300' },
  APPROVED:   { label: 'معتمد', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  PAID:       { label: 'مصروف', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; dot: string }> = {
  PENDING:    { label: 'معلق',         dot: 'bg-slate-400'  },
  PROCESSING: { label: 'قيد التحويل', dot: 'bg-blue-400'   },
  PAID:       { label: 'تم',           dot: 'bg-green-500'  },
  FAILED:     { label: 'فشل',          dot: 'bg-red-500'    },
  CANCELLED:  { label: 'ملغي',         dot: 'bg-slate-500'  },
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatAmount(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—'
  return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م`
}

export function formatPeriod(period: string): string {
  if (!period) return '—'
  return new Date(period).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
}
````

<!-- SOURCE: frontend/lib/disbursement/utils.ts -->
``ts
import type { MonthStatus, PaymentStatus } from './types'

export const statusLabel: Record<MonthStatus, string> = {
  DRAFT:      'مسودة',
  CALCULATED: 'محسوب',
  APPROVED:   'معتمد',
  PAID:       'مصروف',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING:    'معلق',
  PROCESSING: 'قيد التحويل',
  PAID:       'تم',
  FAILED:     'فشل',
  CANCELLED:  'ملغي',
}

````

<!-- SOURCE: frontend/lib/api/disbursement-api.ts -->
``ts
// frontend/lib/api/disbursement-api.ts
// All disbursement API calls — follows the same pattern as education-api.ts

import { api } from './client'
import type { ApiResponse } from '@/lib/types/api'
import type {
  DisbursementMonth,
  MonthlyPayment,
  CategoryConfig,
  GrantConfig,
  SimulateResult,
} from '@/lib/disbursement/types'

// ─── Months ──────────────────────────────────────────────────────────────────

export async function listMonths(params?: Record<string, string | number | undefined>) {
  const { data } = await api.get<ApiResponse<{ months: DisbursementMonth[]; total: number }>>(
    '/disbursement',
    { params },
  )
  return { months: data.data?.months ?? [], total: data.data?.total ?? 0 }
}

export async function getMonth(monthId: string) {
  const { data } = await api.get<ApiResponse<DisbursementMonth>>(`/disbursement/${monthId}`)
  return data.data!
}

export async function openMonth(body: {
  period: string
  method: string
  totalBudget?: number
  notes?: string
}) {
  const { data } = await api.post<ApiResponse<DisbursementMonth>>('/disbursement', body)
  return data.data!
}

export async function calculateMonth(monthId: string) {
  const { data } = await api.post<ApiResponse<{ processed: number; skipped: number }>>(
    `/disbursement/${monthId}/calculate`,
  )
  return data.data!
}

export async function approveMonth(monthId: string, notes?: string) {
  const { data } = await api.patch<ApiResponse<{ status: string }>>(
    `/disbursement/${monthId}/approve`,
    { notes },
  )
  return data.data!
}

export async function reopenMonth(monthId: string, reopenReason: string) {
  const { data } = await api.patch<ApiResponse<{ status: string }>>(
    `/disbursement/${monthId}/reopen`,
    { reopenReason },
  )
  return data.data!
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function adjustPayment(
  monthId: string,
  paymentId: string,
  body: { manualAdjustment: number; adjustmentReason: string; fundSource?: string },
) {
  const { data } = await api.patch<ApiResponse<MonthlyPayment>>(
    `/disbursement/${monthId}/payments/${paymentId}/adjust`,
    body,
  )
  return data.data!
}

export async function updatePaymentStatus(
  monthId: string,
  paymentId: string,
  body: { meezaStatus?: string; cashStatus?: string },
) {
  const { data } = await api.patch<ApiResponse<MonthlyPayment>>(
    `/disbursement/${monthId}/payments/${paymentId}/status`,
    body,
  )
  return data.data!
}

// ─── Simulate ─────────────────────────────────────────────────────────────────

export async function simulateMonth(body: { method: string; totalBudget?: number }) {
  const { data } = await api.post<ApiResponse<SimulateResult>>('/disbursement/simulate', body)
  return data.data!
}

// ─── External contributions ───────────────────────────────────────────────────

export async function addExternalContribution(body: {
  householdId: string
  period: string
  institutionName: string
  amount: number
  confirmed?: boolean
  notes?: string
}) {
  const { data } = await api.post('/disbursement/contributions', body)
  return data.data
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function getCategoryConfigs() {
  const { data } = await api.get<ApiResponse<CategoryConfig[]>>('/disbursement/config/categories')
  return data.data ?? []
}

export async function updateCategoryConfig(code: string, body: Partial<CategoryConfig>) {
  const { data } = await api.put<ApiResponse<CategoryConfig>>(
    `/disbursement/config/categories/${code}`,
    body,
  )
  return data.data!
}

export async function getGrantConfigs() {
  const { data } = await api.get<ApiResponse<GrantConfig[]>>('/disbursement/config/grants')
  return data.data ?? []
}

export async function updateGrantConfig(code: string, body: Partial<GrantConfig>) {
  const { data } = await api.put<ApiResponse<GrantConfig>>(
    `/disbursement/config/grants/${code}`,
    body,
  )
  return data.data!
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function getMeezaExportUrl(monthId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  return `${base}/disbursement/${monthId}/export/meeza`
}
````

<!-- SOURCE: frontend/messages/ar/disbursement.json -->
``json
{
  "title": "الصرف المالي",
  "subtitle": "إدارة الميزانيات المالية وصرف المساعدات النقدية الدورية",
  "addMonth": "فتح شهر جديد",
  "settingsTitle": "إعدادات القبض",
  "method": {
    "VULNERABILITY": "حسب الهشاشة",
    "PROPORTIONAL": "توزيع الميزانية",
    "SCORE_BASED": "حسب الدرجة"
  },
  "status": {
    "DRAFT": "مسودة",
    "CALCULATED": "محسوب",
    "APPROVED": "معتمد",
    "PAID": "مصروف"
  },
  "paymentStatus": {
    "PENDING": "معلق",
    "PROCESSING": "قيد التحويل",
    "PAID": "تم",
    "FAILED": "فشل",
    "CANCELLED": "ملغي"
  },
  "columns": {
    "code": "رقم القيد",
    "family": "الأسرة",
    "category": "الفئة",
    "score": "الهشاشة",
    "base": "القبض الأساسي",
    "grants": "الحوافز",
    "calculated": "المستحق",
    "external": "مساهمة خارجية",
    "compensation": "التعويض",
    "total": "الإجمالي",
    "meeza": "ميزة",
    "cash": "نقدي",
    "actions": ""
  },
  "actions": {
    "calculate": "احسب الشهر",
    "approve": "اعتماد الشهر",
    "reopen": "إعادة الفتح",
    "recalculate": "إعادة الحساب",
    "exportMeeza": "تصدير ميزة",
    "cashSheet": "كشف النقدي",
    "adjust": "تعديل",
    "view": "عرض",
    "confirmApprove": "تأكيد الاعتماد",
    "confirmReopen": "تأكيد إعادة الفتح"
  },
  "messages": {
    "approveWarning": "سيتم قفل الشهر بعد الاعتماد ولن يمكن إجراء تعديلات.",
    "reopenWarning": "ستتم إزالة اعتماد الشهر وإعادته لحالة محسوب.",
    "locked": "الشهر معتمد ومقفل",
    "lockedDetail": "لا يمكن إجراء تعديلات على شهر معتمد",
    "adjustmentReasonRequired": "سبب التعديل مطلوب",
    "reopenReasonRequired": "سبب إعادة الفتح مطلوب",
    "monthExists": "هذا الشهر مفتوح بالفعل",
    "noPayments": "لا توجد مدفوعات لهذا الشهر",
    "noMonths": "لا توجد شهور مفتوحة بعد",
    "calculationSuccess": "تم الحساب بنجاح",
    "approveSuccess": "تم اعتماد الشهر",
    "adjustSuccess": "تم حفظ التعديل",
    "loading": "جاري التحميل...",
    "calculating": "جاري الحساب..."
  },
  "kpis": {
    "totalFamilies": "إجمالي الأسر",
    "totalAmount": "إجمالي القبض",
    "meezaTotal": "تحويلات ميزة",
    "cashTotal": "نقدي في المقر",
    "months": "إجمالي الدورات",
    "activeMonths": "الدورات النشطة",
    "totalBudget": "الميزانية الإجمالية",
    "totalSpent": "المصروف"
  },
  "simulation": {
    "title": "محاكاة الشهر",
    "subtitle": "البيانات تقديرية قبل الحساب الفعلي",
    "run": "تشغيل المحاكاة",
    "eligibleCount": "الأسر المؤهلة",
    "totalRequired": "إجمالي القبض المتوقع",
    "average": "متوسط القبض",
    "max": "أعلى قبض",
    "min": "أقل قبض",
    "surplus": "الميزانية المتبقية",
    "deficit": "العجز",
    "byCategory": "توزيع الأسر بالفئات"
  },
  "categories": {
    "1": "أيتام",
    "2": "إعاقة",
    "3": "طالب علم",
    "4": "أسر سجناء",
    "5": "مساعدات",
    "6": "دعم خارجي",
    "7": "منفردون",
    "9": "مطلقات",
    "10": "مساكين"
  },
  "fundSource": {
    "GENERAL": "عام",
    "ZAKAT": "زكاة",
    "SADAQA": "صدقة",
    "ORPHAN_FUND": "صندوق الأيتام"
  },
  "settings": {
    "title": "إعدادات القبض",
    "categories": "إعدادات الفئات",
    "grants": "الحوافز والمنح",
    "maxWithDeps": "الحد الأقصى بأبناء",
    "maxNoDeps": "الحد الأقصى بدون أبناء",
    "maxAmount": "الحد الأقصى للفئة",
    "addGrant": "إضافة حافز جديد",
    "saveChanges": "حفظ التغييرات"
  },
  "form": {
    "period": "الشهر",
    "method": "طريقة الحساب",
    "totalBudget": "الميزانية الإجمالية",
    "notes": "ملاحظات",
    "reopenReason": "سبب إعادة الفتح",
    "adjustmentReason": "سبب التعديل",
    "manualAdjustment": "مبلغ التعديل",
    "fundSource": "مصدر التمويل",
    "institutionName": "اسم المؤسسة",
    "amount": "المبلغ",
    "confirmed": "تم التأكيد من المؤسسة"
  }
}
````

<!-- SOURCE: frontend/messages/en/disbursement.json -->
``json
{
  "title": "Monthly Disbursement",
  "subtitle": "Manage monthly aid payments",
  "addMonth": "Open New Month",
  "settingsTitle": "Disbursement Settings",
  "method": {
    "VULNERABILITY": "By Vulnerability",
    "PROPORTIONAL": "Budget Distribution",
    "SCORE_BASED": "Score Based"
  },
  "status": {
    "DRAFT": "Draft",
    "CALCULATED": "Calculated",
    "APPROVED": "Approved",
    "PAID": "Paid"
  },
  "paymentStatus": {
    "PENDING": "Pending",
    "PROCESSING": "Processing",
    "PAID": "Paid",
    "FAILED": "Failed",
    "CANCELLED": "Cancelled"
  },
  "columns": {
    "code": "Code",
    "family": "Family",
    "category": "Category",
    "score": "Score",
    "base": "Base Amount",
    "grants": "Grants",
    "calculated": "Calculated",
    "external": "External Contrib.",
    "compensation": "Compensation",
    "total": "Total",
    "meeza": "Meeza",
    "cash": "Cash",
    "actions": ""
  },
  "actions": {
    "calculate": "Calculate Month",
    "approve": "Approve Month",
    "reopen": "Reopen",
    "recalculate": "Recalculate",
    "exportMeeza": "Export Meeza",
    "cashSheet": "Cash Sheet",
    "adjust": "Adjust",
    "view": "View",
    "confirmApprove": "Confirm Approval",
    "confirmReopen": "Confirm Reopen"
  },
  "messages": {
    "approveWarning": "The month will be locked after approval. No further edits will be possible.",
    "reopenWarning": "The month approval will be removed and reverted to Calculated status.",
    "locked": "Month is approved and locked",
    "lockedDetail": "Edits are not allowed on an approved month",
    "adjustmentReasonRequired": "Adjustment reason is required",
    "reopenReasonRequired": "Reopen reason is required",
    "monthExists": "This month is already open",
    "noPayments": "No payments for this month",
    "noMonths": "No months opened yet",
    "calculationSuccess": "Calculation completed",
    "approveSuccess": "Month approved successfully",
    "adjustSuccess": "Adjustment saved",
    "loading": "Loading...",
    "calculating": "Calculating..."
  },
  "kpis": {
    "totalFamilies": "Total Families",
    "totalAmount": "Total Disbursed",
    "meezaTotal": "Meeza Transfers",
    "cashTotal": "Cash at Office",
    "months": "Total Cycles",
    "activeMonths": "Active Cycles",
    "totalBudget": "Total Budget",
    "totalSpent": "Total Spent"
  },
  "simulation": {
    "title": "Month Simulation",
    "subtitle": "Estimated data before actual calculation",
    "run": "Run Simulation",
    "eligibleCount": "Eligible Families",
    "totalRequired": "Expected Total",
    "average": "Average Payment",
    "max": "Highest Payment",
    "min": "Lowest Payment",
    "surplus": "Remaining Budget",
    "deficit": "Deficit",
    "byCategory": "Family Distribution by Category"
  },
  "categories": {
    "1": "Orphans",
    "2": "Disability",
    "3": "Students",
    "4": "Prisoners Families",
    "5": "Aid",
    "6": "External Support",
    "7": "Singles",
    "9": "Divorced",
    "10": "Needy"
  },
  "fundSource": {
    "GENERAL": "General",
    "ZAKAT": "Zakat",
    "SADAQA": "Sadaqa",
    "ORPHAN_FUND": "Orphan Fund"
  },
  "settings": {
    "title": "Disbursement Settings",
    "categories": "Category Settings",
    "grants": "Grants & Incentives",
    "maxWithDeps": "Cap with Dependents",
    "maxNoDeps": "Cap without Dependents",
    "maxAmount": "Category Maximum",
    "addGrant": "Add New Grant",
    "saveChanges": "Save Changes"
  },
  "form": {
    "period": "Month",
    "method": "Calculation Method",
    "totalBudget": "Total Budget",
    "notes": "Notes",
    "reopenReason": "Reopen Reason",
    "adjustmentReason": "Adjustment Reason",
    "manualAdjustment": "Adjustment Amount",
    "fundSource": "Fund Source",
    "institutionName": "Institution Name",
    "amount": "Amount",
    "confirmed": "Confirmed by Institution"
  }
}
````

### Additional Feature Answers
Feature name: Monthly Disbursement / Aid Payment Operations.
Integration: backend route mounted at `/api/disbursement`; Prisma models include CategoryConfig, GrantConfig, ExternalContribution, DisbursementMonth, MonthlyPayment, and PaymentAudit; frontend files provide dashboard pages, tables, settings, sheets, store, API client, and i18n messages.
## SECTION 6 - Bug Fixes Status
### Bug-01: hasDivorce flag in wizardStore.ts
<!-- SOURCE: frontend/lib/stores/wizardStore.ts#hasDivorce -->
````ts
  diseases?: Array<any>;
  disabilities?: Array<any>;
}

export interface ConditionalFlags {
  headIsAbsent: boolean;
  absenceReason: "death" | "divorce" | "prison" | "other" | null;
  hasWidow: boolean;
  hasDivorce: boolean;
  hasPrison: boolean;
  hasDisease: boolean;
  hasDisability: boolean;
  hasDebt: boolean;
  hasInjury: boolean;
  hasSurgery: boolean;
  hasBride: boolean;
  hasSonInPrison: boolean;
}

function deriveFlags(form: WizardFormData): ConditionalFlags {
  const head = form.head;
  const reason = head?.residencyStatus ?? null;
  const absent = reason !== "RESIDENT" && reason !== null;
  
  let mappedReason: "death" | "divorce" | "prison" | "other" | null = null;
  if (reason === "ABSENT_DEATH") mappedReason = "death";
  else if (reason === "ABSENT_DIVORCE") mappedReason = "divorce";
  else if (reason === "ABSENT_PRISON") mappedReason = "prison";
  else if (absent) mappedReason = "other";

  const members = form.members ?? [];
  const socialStatusDivorce = form.socialStatus === "DIVORCED";

  return {
    headIsAbsent: absent,
    absenceReason: mappedReason,
    hasWidow: mappedReason === "death",
    hasDivorce: mappedReason === "divorce" || socialStatusDivorce,
    hasPrison: mappedReason === "prison",
    hasDisease: members.some((m) => m.hasDisease) || Boolean(head?.hasDisease),
    hasDisability: members.some((m) => m.hasDisability) || Boolean(head?.hasDisability),
    hasDebt: Boolean(form.burdens?.hasDebt),
    hasInjury: Boolean(form.burdens?.hasInjury),
    hasSurgery: Boolean(form.burdens?.hasSurgery),
    hasBride: members.some((m) => m.isBride),
    hasSonInPrison: Boolean(form.burdens?.hasSonInPrison),
````
Bug-01 status: FIXED. The flag is now derived from both `absenceReason === "divorce"` and the social status divorce condition.

### Bug-02: Spouse not auto-added in PersonsStep.tsx
<!-- SOURCE: frontend/components/wizard/steps/PersonsStep.tsx#auto-spouse -->
````tsx
function normalizeDiseaseWorkImpact(value?: string | null) { return value || "NONE"; }

function normalizeDisabilityWorkImpact(value?: string | null) { return value || "NONE"; }

function normalizeCompanion(value?: string | null) { return value || "NONE"; }

export function PersonsStep() {
 const t = useTranslations("households");
 const householdId = useWizardStore((s) => s.householdId);
 const fd = useWizardStore((s) => s.formData);
 const members = fd.members ?? [];
 const displayMembers = [
  ...(fd.head?.name ? [{ ...fd.head, id: fd.head.personId, _isHeadOrSpouse: true, role: "HEAD" as const }] : []),
  ...(fd.wifeName && fd.socialStatus !== "SINGLE_OTHER" ? [{
    id: fd.wifePersonId,
    name: fd.wifeName,
    nationalId: fd.wifeNationalId,
    gender: "FEMALE" as const,
    role: "SPOUSE" as const,
    // removed wifeEmploymentType
    employmentQuality: fd.wifeEmploymentQuality,
    educationLevel: fd.wifeEducationLevel,
    _isHeadOrSpouse: true
  }] : []),
  ...members
 ];
 const setField = useWizardStore((s) => s.setField);
 const flags = useWizardStore((s) => s.conditionalFlags);
 const autoSave = useWizardStore((s) => s.autoSave);
 
 const personDraft = useWizardStore((s) => s.personDraft);
````
Bug-02 status: FIXED. The members list now injects the wife/spouse card from wizard form data when a wife exists and the household is not `SINGLE_OTHER`.

## SUMMARY TABLE
| Feature | Status | Files Changed | Book Sections Affected |
|---|---|---|---|
| Landing Page | NEW | 4 files | Ch3, Ch4, Ch5 |
| Notifications | NEW | 8 files | Ch3, Ch5, Ch7 |
| Medical Records | REBUILT | 30 files | Ch3, Ch4, Ch5, Ch7 |
| Monthly Disbursement | NEW | 22 files | Ch3, Ch4, Ch5, Ch7 |
| Bug-01 hasDivorce | FIXED | frontend/lib/stores/wizardStore.ts | Ch6 |
| Bug-02 Spouse auto | FIXED | frontend/components/wizard/steps/PersonsStep.tsx | Ch6 |

---
*End of PROJECT_UPDATE_CONTEXT.md*

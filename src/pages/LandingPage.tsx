import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, Language } from '../types';
import { languages } from '../i18n/translations';
import { landingTranslations } from '../i18n/landingTranslations';
import { Button } from '../components/common/Button';
import { 
  Truck, 
  Recycle, 
  ShieldCheck, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Leaf, 
  Factory, 
  UserCheck, 
  TrendingUp, 
  Sun, 
  Moon, 
  Globe, 
  LogIn 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted?: (preferredRole?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { language, setLanguage, theme, setTheme } = useApp();
  const { openAuthModal } = useAuth();

  const lt = landingTranslations[language] || landingTranslations.en;

  const handleStart = (preferredRole: UserRole = 'individual') => {
    if (onGetStarted) {
      onGetStarted(preferredRole);
    } else {
      openAuthModal('signin');
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200 font-sans">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1.5 shadow-xs">
              <img src="/logo.png" alt="Recyvia Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                RECYVIA
              </span>
              <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                {lt.header.tagline}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="pl-7 pr-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                aria-label="Select Language"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100">
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors"
              title={theme === 'dark' ? lt.header.lightMode : lt.header.darkMode}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sign In Button */}
            <Button
              size="sm"
              variant="outline"
              leftIcon={<LogIn className="w-4 h-4" />}
              onClick={() => openAuthModal('signin')}
              className="border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold"
            >
              {lt.header.signIn}
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28 border-b border-slate-200 dark:border-zinc-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Glow ambient decoration */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-xs">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{lt.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            RECYVIA
          </h1>

          <p className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
            {lt.hero.tagline}
          </p>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            {lt.hero.desc}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              onClick={() => handleStart('individual')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              {lt.hero.getStarted}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {lt.hero.learnMore}
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: lt.hero.metrics.pricingLabel, value: lt.hero.metrics.pricingValue },
              { label: lt.hero.metrics.otpLabel, value: lt.hero.metrics.otpValue },
              { label: lt.hero.metrics.paymentLabel, value: lt.hero.metrics.paymentValue },
              { label: lt.hero.metrics.auditLabel, value: lt.hero.metrics.auditValue },
            ].map((metric, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800/80 backdrop-blur-xs shadow-xs"
              >
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100">
                  {metric.value}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            {lt.howItWorks.sub}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {lt.howItWorks.title}
          </p>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
            {lt.howItWorks.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              step: '01',
              title: lt.howItWorks.step1.title,
              desc: lt.howItWorks.step1.desc,
              icon: <Scale className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
              badge: lt.howItWorks.step1.badge,
            },
            {
              step: '02',
              title: lt.howItWorks.step2.title,
              desc: lt.howItWorks.step2.desc,
              icon: <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
              badge: lt.howItWorks.step2.badge,
            },
            {
              step: '03',
              title: lt.howItWorks.step3.title,
              desc: lt.howItWorks.step3.desc,
              icon: <Recycle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
              badge: lt.howItWorks.step3.badge,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-2xl font-black text-slate-300 dark:text-zinc-700 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.step}
                </span>
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 mb-2">
                {item.badge}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mt-2">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Key Benefits Section */}
      <section className="py-16 bg-slate-100/70 dark:bg-zinc-900/40 border-y border-slate-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              {lt.benefits.sub}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {lt.benefits.title}
            </p>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
              {lt.benefits.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: lt.benefits.b1.title,
                desc: lt.benefits.b1.desc,
                icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              },
              {
                title: lt.benefits.b2.title,
                desc: lt.benefits.b2.desc,
                icon: <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              },
              {
                title: lt.benefits.b3.title,
                desc: lt.benefits.b3.desc,
                icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              },
              {
                title: lt.benefits.b4.title,
                desc: lt.benefits.b4.desc,
                icon: <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Role Overview Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            {lt.roles.sub}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {lt.roles.title}
          </p>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
            {lt.roles.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Role 1: Individuals & Businesses */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {lt.roles.individual.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {lt.roles.individual.desc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.individual.f1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.individual.f2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.individual.f3}</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                variant="primary"
                onClick={() => handleStart('individual')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {lt.roles.individual.cta}
              </Button>
            </div>
          </div>

          {/* Role 2: Waste Collectors */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-md transition-all relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
              {lt.roles.collector.badge}
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {lt.roles.collector.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {lt.roles.collector.desc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.collector.f1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.collector.f2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.collector.f3}</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                variant="primary"
                onClick={() => handleStart('collector')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {lt.roles.collector.cta}
              </Button>
            </div>
          </div>

          {/* Role 3: Material Recyclers */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Factory className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {lt.roles.recycler.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {lt.roles.recycler.desc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.recycler.f1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.recycler.f2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lt.roles.recycler.f3}</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                variant="primary"
                onClick={() => handleStart('recycler')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {lt.roles.recycler.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-950 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            {lt.ctaBanner.title}
          </h2>
          <p className="text-xs sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            {lt.ctaBanner.desc}
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => handleStart('individual')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="px-8 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black shadow-xl cursor-pointer"
            >
              {lt.ctaBanner.button}
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-zinc-800">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1.5">
                <img src="/logo.png" alt="Recyvia Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  RECYVIA
                </span>
                <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                  {lt.footer.tagline}
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-zinc-400">
              <button onClick={() => handleStart('individual')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                {lt.footer.forHouseholds}
              </button>
              <button onClick={() => handleStart('collector')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                {lt.footer.forCollectors}
              </button>
              <button onClick={() => handleStart('recycler')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                {lt.footer.forRecyclers}
              </button>
              <button onClick={() => openAuthModal('signin')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                {lt.footer.signIn}
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-zinc-400">
            <div>
              &copy; {new Date().getFullYear()} {lt.footer.copyright}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{lt.footer.status}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

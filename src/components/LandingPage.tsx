import React from "react";
import { motion } from "motion/react";
import { Sparkles, Calendar, BookOpen, Clock, Brain, ArrowRight, Shield, Zap, GraduationCap, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
  onStartPlanning: () => void;
  onTryPreset: (presetGoal: string) => void;
  key?: string;
}

export default function LandingPage({ onStartPlanning, onTryPreset }: LandingPageProps) {
  return (
    <div className="w-full bg-slate-50 overflow-y-auto" id="landing-page-root">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Animated Accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] md:w-[600px] h-[350px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-bold mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          Powered by Gemini 3.5 Flash
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold font-display text-slate-900 tracking-tight max-w-4xl leading-[1.1]"
        >
          Master any subject with a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700">personalized study roadmap</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-slate-600 max-w-2xl text-base md:text-lg leading-relaxed font-medium"
        >
          Tell PlanIt your learning goal and deadline. Instantly receive a detailed, day-by-day action checklist paired with a contextual AI Study Buddy to clear up hard concepts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <button
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition duration-150 flex items-center justify-center gap-2 text-base active:scale-[0.98]"
            id="landing-cta-start"
          >
            Create My Free Plan
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <a
            href="#features-section"
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl transition flex items-center justify-center text-sm"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Visual Mockup Dashboard teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-4xl bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-4 md:p-6 text-left relative overflow-hidden"
          id="visual-preview-mockup"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-3 py-1 rounded">Interactive Preview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider px-2 py-0.5 bg-indigo-50 rounded">Day 01 Focus</span>
                <span className="text-xs text-slate-400 font-semibold">Est: 3 Hours</span>
              </div>
              <h3 className="text-base font-bold text-slate-800">Foundations of Calculus & Intuitive Limits</h3>
              <p className="text-xs text-slate-500">Day focus: Establish a solid graphical intuition of continuous vs discontinuous curves.</p>
              
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5 items-center">
                  <div className="w-4 h-4 rounded border-slate-300 border bg-white flex items-center justify-center shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">Limits & Squeeze Theorem Practice</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Solve 10 conceptual limits problems using algebraic conjugate multiplication.</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex gap-2.5 items-center opacity-80">
                  <div className="w-4 h-4 rounded border-emerald-500 bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <span className="text-[10px]">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700 line-through">Continuous Intervals & Infinite Discontinuity</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Watch introductory limits summaries on YouTube.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-950 text-white rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">AI Study Buddy</span>
                </div>
                <p className="text-xs text-slate-200 leading-normal font-medium">
                  &ldquo;A limit is simply the value that a function approaches as the input approaches some value. Think of it as predicting destination values!&rdquo;
                </p>
              </div>
              <button
                onClick={onStartPlanning}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1"
              >
                Let&apos;s Get Started <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid / Features Section */}
      <section id="features-section" className="px-6 py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">PlanIt Core Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-bold font-display text-slate-900 tracking-tight">
              A comprehensive toolkit for elite productivity
            </h3>
            <p className="text-slate-500 mt-4 text-sm md:text-base max-w-lg mx-auto">
              Skip the overwhelm. Break massive goals down into logical daily strides with zero-friction organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Intelligent Decomposition */}
            <div className="p-6 md:p-8 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-indigo-100 border border-indigo-200 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Smarter Breakdown</h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                  PlanIt automatically formats target objectives into sequential tasks based on prior experience and custom cognitive preferences.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-indigo-600 text-xs font-bold">
                <span>Personalized pace mapping</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 2: Interactive Study Buddy */}
            <div className="p-6 md:p-8 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-amber-100 border border-amber-200 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Contextual AI Coach</h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                  Stuck? Toggle your custom AI Study Buddy sidebar. Ask for flashcard summaries, quick quizzes, or simplified proof walk-throughs instantly.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-indigo-600 text-xs font-bold">
                <span>Direct task-context support</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 3: Resources & Curations */}
            <div className="p-6 md:p-8 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center mb-6">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Pre-populated Resources</h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                  No more endless searching. Tasks include recommended Search terms and targeted YouTube links to pinpoint top-tier material directly.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-indigo-600 text-xs font-bold">
                <span>Instant curation guides</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preset Launcher Section */}
      <section className="px-6 py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-bold font-display tracking-tight">
              Ready to crush your next objective?
            </h3>
            <p className="text-slate-400 mt-3 text-sm md:text-base leading-relaxed">
              Launch one of these typical presets instantly, or create a fully customized plan from scratch using our AI generator.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-xl shrink-0">
            <button
              onClick={() => onTryPreset("Ace my AP Calculus midterm focusing on limits, derivatives, and basic integrals.")}
              className="p-4 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 border border-slate-700 rounded-xl transition text-left text-sm font-semibold flex items-center justify-between group"
            >
              <span>🎓 Calculus Prep (5 Days)</span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onTryPreset("Build and deploy a simple interactive React app with state management.")}
              className="p-4 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 border border-slate-700 rounded-xl transition text-left text-sm font-semibold flex items-center justify-between group"
            >
              <span>💻 Learn React Basics (3 Days)</span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onTryPreset("Write a comprehensive 5-page outline and first draft of a psychology paper on sleep hygiene.")}
              className="p-4 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 border border-slate-700 rounded-xl transition text-left text-sm font-semibold flex items-center justify-between group"
            >
              <span>📝 Research Paper (2 Weeks)</span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onTryPreset("Review key data structures, algorithms, and solve 15 LeetCode-style medium questions.")}
              className="p-4 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 border border-slate-700 rounded-xl transition text-left text-sm font-semibold flex items-center justify-between group"
            >
              <span>💼 Tech Interview Prep (7 Days)</span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-8 px-6 text-center border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-400">PlanIt Offline-First Engine</span>
          </div>
          <p>© 2026 PlanIt. Empowering students and builders everywhere.</p>
        </div>
      </footer>
    </div>
  );
}

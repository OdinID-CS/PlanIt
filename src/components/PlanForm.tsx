import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Calendar, Target, Clock, BookOpen, Brain, ArrowRight } from "lucide-react";

interface PlanFormProps {
  onSubmit: (formData: {
    goal: string;
    timeframe: number;
    timeframeUnit: string;
    intensity: string;
    knowledgeLevel: string;
    learningStyle: string;
  }) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: "🎓 Calculus Exam in 5 Days",
    goal: "Ace my AP Calculus midterm focusing on limits, derivatives, and basic integrals.",
    timeframe: 5,
    timeframeUnit: "Days",
    intensity: "Intensive (5+ hours/day)",
    knowledgeLevel: "Some Basics (Know terminology)",
    learningStyle: "Balanced",
  },
  {
    label: "💻 Learn React Basics in 3 Days",
    goal: "Build and deploy a simple interactive React app with state management.",
    timeframe: 3,
    timeframeUnit: "Days",
    intensity: "Moderate (3-4 hours/day)",
    knowledgeLevel: "Complete Beginner (No background)",
    learningStyle: "Hands-on & Practical",
  },
  {
    label: "📝 Research Paper Draft in 2 Weeks",
    goal: "Write a comprehensive 5-page outline and first draft of a psychology paper on sleep hygiene.",
    timeframe: 2,
    timeframeUnit: "Weeks",
    intensity: "Casual (1-2 hours/day)",
    knowledgeLevel: "Familiar (Need review)",
    learningStyle: "Theoretical (Textbooks & Notes)",
  },
  {
    label: "💼 Tech Interview Prep in 7 Days",
    goal: "Review key data structures, algorithms, and solve 15 LeetCode-style medium questions.",
    timeframe: 7,
    timeframeUnit: "Days",
    intensity: "Intensive (5+ hours/day)",
    knowledgeLevel: "Familiar (Need review)",
    learningStyle: "Hands-on & Practical",
  },
];

const LOADING_PHASES = [
  "Analyzing your study goals & target scope...",
  "Structuring optimal daily progression metrics...",
  "Formulating highly specific practice activities...",
  "Sourcing recommended study queries & links...",
  "Applying personal cognitive learning style parameters...",
  "Finalizing your micro-milestone tracking dashboard...",
];

export default function PlanForm({ onSubmit, isLoading }: PlanFormProps) {
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState<number>(5);
  const [timeframeUnit, setTimeframeUnit] = useState("Days");
  const [intensity, setIntensity] = useState("Moderate (3-4 hours/day)");
  const [knowledgeLevel, setKnowledgeLevel] = useState("Some Basics (Know terminology)");
  const [learningStyle, setLearningStyle] = useState("Balanced");
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % LOADING_PHASES.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || timeframe <= 0) return;
    onSubmit({
      goal: goal.trim(),
      timeframe,
      timeframeUnit,
      intensity,
      knowledgeLevel,
      learningStyle,
    });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setGoal(preset.goal);
    setTimeframe(preset.timeframe);
    setTimeframeUnit(preset.timeframeUnit);
    setIntensity(preset.intensity);
    setKnowledgeLevel(preset.knowledgeLevel);
    setLearningStyle(preset.learningStyle);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden" id="plan-creation-container">
      <AnimatePresence mode="wait">
        {!isLoading ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-10"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-semibold mb-4" id="badge-title">
                <Sparkles className="w-3.5 h-3.5" /> Empower Your Focus
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 tracking-tight" id="main-title">
                PlanIt
              </h1>
              <p className="mt-2 text-slate-500 max-w-lg mx-auto text-sm md:text-base">
                Transform any daunting study target or project milestone into an actionable, day-by-day roadmap personalized to your style.
              </p>
            </div>

            {/* Presets */}
            <div className="mb-8" id="presets-panel">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Quick-Start Presets (Try one-click)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 border border-slate-200/60 rounded-xl transition duration-200 text-sm font-medium text-slate-700 flex items-center justify-between group"
                    id={`preset-${idx}`}
                  >
                    <span>{preset.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 my-8" />

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6" id="planner-setup-form">
              {/* Goal Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="goal-input">
                  <Target className="w-4 h-4 text-indigo-500" />
                  What is your goal or exam topic?
                </label>
                <textarea
                  id="goal-input"
                  required
                  rows={3}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., I have an exam in 5 days covering advanced limits, derivatives, L'Hopital's rule, and application of derivatives."
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition duration-150 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Timeframe & Unit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="timeframe-number">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    How long do you have?
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="timeframe-number"
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={timeframe}
                      onChange={(e) => setTimeframe(parseInt(e.target.value) || 1)}
                      className="w-1/3 px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition duration-150 text-sm text-slate-800"
                    />
                    <select
                      id="timeframe-unit"
                      value={timeframeUnit}
                      onChange={(e) => setTimeframeUnit(e.target.value)}
                      className="w-2/3 px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition duration-150 text-sm text-slate-800"
                    >
                      <option value="Days">Days</option>
                      <option value="Weeks">Weeks</option>
                    </select>
                  </div>
                </div>

                {/* Intensity */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="intensity-select">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Daily Study Intensity
                  </label>
                  <select
                    id="intensity-select"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition duration-150 text-sm text-slate-800"
                  >
                    <option value="Casual (1-2 hours/day)">Casual (1-2 hours/day)</option>
                    <option value="Moderate (3-4 hours/day)">Moderate (3-4 hours/day)</option>
                    <option value="Intensive (5+ hours/day)">Intensive (5+ hours/day)</option>
                  </select>
                </div>
              </div>

              {/* Experience & Style Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Knowledge Level */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="knowledge-select">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    Prior Subject Experience
                  </label>
                  <select
                    id="knowledge-select"
                    value={knowledgeLevel}
                    onChange={(e) => setKnowledgeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition duration-150 text-sm text-slate-800"
                  >
                    <option value="Complete Beginner (No background)">Complete Beginner (No background)</option>
                    <option value="Some Basics (Know terminology)">Some Basics (Know terminology)</option>
                    <option value="Familiar (Need review)">Familiar (Need review)</option>
                    <option value="Advanced (Optimize details)">Advanced (Optimize details)</option>
                  </select>
                </div>

                {/* Learning Style */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="style-select">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Preferred Learning Style
                  </label>
                  <select
                    id="style-select"
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition duration-150 text-sm text-slate-800"
                  >
                    <option value="Balanced">Balanced Mix of Everything</option>
                    <option value="Hands-on & Practical">Hands-on & Practical (Demos/Practice problems)</option>
                    <option value="Visual (Videos & Examples)">Visual (Videos & Visual Examples)</option>
                    <option value="Theoretical (Textbooks & Notes)">Theoretical (In-depth text / Reference material)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  id="submit-generate-plan"
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition duration-150 flex items-center justify-center gap-2 text-base active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
                  Generate My Instant Plan
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-12 md:p-20 text-center flex flex-col items-center justify-center min-h-[450px]"
            id="planner-loading-indicator"
          >
            {/* Elegant pulse loader */}
            <div className="relative mb-8" id="loader-graphic">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-indigo-600 animate-spin" style={{ animationDuration: "6s" }} />
              </div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600/30 rounded-full border-t-indigo-600 animate-spin" />
            </div>

            <h2 className="text-2xl font-bold font-display text-slate-800 mb-2">
              Crafting Your Custom Plan
            </h2>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              Gemini is mapping out your educational path...
            </p>

            {/* Changing loading phases with an elegant animation key */}
            <div className="h-8 flex items-center justify-center" id="loading-phase-text">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingPhase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="text-indigo-600 font-medium text-sm md:text-base"
                >
                  {LOADING_PHASES[loadingPhase]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="w-64 bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
              <motion.div
                className="bg-indigo-600 h-full rounded-full"
                animate={{
                  width: ["10%", "35%", "70%", "95%"],
                }}
                transition={{
                  duration: 15,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

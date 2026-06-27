/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  FileText,
  PlusCircle,
  HelpCircle,
  Brain,
  Edit2,
  Check,
  User,
  Lightbulb,
  ArrowLeft
} from "lucide-react";
import { StudyPlan, DayPlan, Task, ChatMessage } from "./types";
import PlanForm from "./components/PlanForm";
import StudyBuddyChat from "./components/StudyBuddyChat";
import LandingPage from "./components/LandingPage";

export default function App() {
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem("planit_active_plan");
    return saved ? JSON.parse(saved) : null;
  });

  const [viewMode, setViewMode] = useState<'landing' | 'setup'>('landing');
  const [initialGoalPreset, setInitialGoalPreset] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat Buddy State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("planit_chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [chatContextDay, setChatContextDay] = useState<DayPlan | null>(null);
  const [chatContextTask, setChatContextTask] = useState<Task | null>(null);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);

  // Active Selected Day in main view (if there are many days)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // For modifying notes of active day
  const [dayNotesText, setDayNotesText] = useState("");

  // Save state on change
  useEffect(() => {
    if (activePlan) {
      localStorage.setItem("planit_active_plan", JSON.stringify(activePlan));
    } else {
      localStorage.removeItem("planit_active_plan");
    }
  }, [activePlan]);

  useEffect(() => {
    localStorage.setItem("planit_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Set default notes when selected day changes
  useEffect(() => {
    if (activePlan) {
      const day = activePlan.days.find((d) => d.dayNumber === selectedDayNumber);
      if (day) {
        setDayNotesText(day.notes || "");
      }
    }
  }, [selectedDayNumber, activePlan?.id]);

  const safeFetchJson = async (url: string, options: RequestInit) => {
    let response;
    try {
      response = await fetch(url, options);
    } catch (networkError: any) {
      throw new Error("Unable to reach the server. Please check your internet connection and try again.");
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      if (isJson) {
        try {
          const errData = await response.json();
          throw new Error(errData.error || `Server error (Status ${response.status})`);
        } catch (jsonErr) {
          throw new Error(`Server error with status code ${response.status}`);
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON error response from server:", text);
        throw new Error(`The server returned an invalid HTML error response (Status ${response.status}). This often means the API key is missing or invalid, or the server crashed. Please make sure GEMINI_API_KEY is configured in Settings > Secrets.`);
      }
    }

    if (!isJson) {
      const text = await response.text();
      console.error("Expected JSON but received:", text);
      throw new Error("Received an unexpected HTML response from the server instead of JSON data. This typically indicates a routing error, a server crash, or an issue with the API key configuration.");
    }

    try {
      return await response.json();
    } catch (parseErr) {
      throw new Error("Failed to parse the server's response. The data received was not valid JSON.");
    }
  };

  // Handle plan generation from form
  const handleGeneratePlan = async (formData: {
    goal: string;
    timeframe: number;
    timeframeUnit: string;
    intensity: string;
    knowledgeLevel: string;
    learningStyle: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const planData = await safeFetchJson("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Inject completed field to tasks
      const formattedDays = planData.days.map((day: any) => ({
        ...day,
        notes: "",
        tasks: day.tasks.map((task: any) => ({
          ...task,
          completed: false,
        })),
      }));

      const newPlan: StudyPlan = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        title: planData.title,
        summary: planData.summary,
        intensity: planData.intensity || formData.intensity,
        milestones: planData.milestones || [],
        days: formattedDays,
        createdAt: new Date().toLocaleDateString(),
        goal: formData.goal,
        timeframe: formData.timeframe,
        timeframeUnit: formData.timeframeUnit,
        knowledgeLevel: formData.knowledgeLevel,
        learningStyle: formData.learningStyle,
      };

      setActivePlan(newPlan);
      setSelectedDayNumber(1);
      // Clear old chat on new plan
      setChatMessages([
        {
          role: "assistant",
          content: `Hello! I am your AI Study Buddy. I have loaded your plan: "**${newPlan.title}**". How can I help you prepare today? Feel free to click on any day or task to ask for explanations, study guides, or quick mock quizzes!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please make sure your Gemini API key is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  // Chat message submission
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGeneratingChat) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsGeneratingChat(true);

    try {
      const activeDay = activePlan?.days.find((d) => d.dayNumber === selectedDayNumber) || null;

      const data = await safeFetchJson("/api/chat-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          contextPlanTitle: activePlan?.title,
          contextDay: activeDay,
          contextTask: chatContextTask,
        }),
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an issue: ${err.message}. Please verify your API connection or ask again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // Toggle complete state of task
  const toggleTaskCompleted = (dayNum: number, taskTitle: string) => {
    if (!activePlan) return;
    const updatedDays = activePlan.days.map((day) => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          tasks: day.tasks.map((task) => {
            if (task.title === taskTitle) {
              return { ...task, completed: !task.completed };
            }
            return task;
          }),
        };
      }
      return day;
    });

    setActivePlan({
      ...activePlan,
      days: updatedDays,
    });
  };

  // Update study notes for current selected day
  const handleSaveNotes = () => {
    if (!activePlan) return;
    const updatedDays = activePlan.days.map((day) => {
      if (day.dayNumber === selectedDayNumber) {
        return { ...day, notes: dayNotesText };
      }
      return day;
    });

    setActivePlan({
      ...activePlan,
      days: updatedDays,
    });
  };

  // Clear or reset active plan
  const handleResetPlan = () => {
    if (window.confirm("Are you sure you want to reset your current plan? This will clear all checklist history.")) {
      setActivePlan(null);
      setChatMessages([]);
      setChatContextTask(null);
      setChatContextDay(null);
      setChatOpen(false);
      setViewMode('setup'); // Goes directly to setup form so a new plan can be created fresh
      setInitialGoalPreset(""); // Resets the form inputs back to empty
      setIsLoading(false); // Make sure loading state is properly reset so the button is never stuck
    }
  };

  // Helper calculations for layout
  const totalTasksCount = activePlan?.days.reduce((acc, day) => acc + day.tasks.length, 0) || 0;
  const completedTasksCount = activePlan?.days.reduce((acc, day) => acc + day.tasks.filter((t) => t.completed).length, 0) || 0;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const currentSelectedDay = activePlan?.days.find((d) => d.dayNumber === selectedDayNumber);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Header/Navigation matching 'Sleek Interface' */}
      <header className="h-16 flex items-center justify-between px-6 md:px-8 bg-white border-b border-slate-200 shrink-0 shadow-sm" id="header-navbar">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg font-display tracking-tight shadow-md shadow-indigo-100">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 font-display">PlanIt</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-5 text-sm font-medium text-slate-500">
            <span className="text-indigo-600 font-bold underline underline-offset-8">Planner Dashboard</span>
            <span className="hover:text-indigo-600 transition cursor-pointer" onClick={() => {
              if (activePlan) {
                setChatOpen(true);
                setChatContextTask(null);
                setChatContextDay(null);
              } else {
                alert("Create a plan first to chat with your Study Buddy!");
              }
            }}>AI Study Buddy</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm">
              GU
            </div>
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">Guest User</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!activePlan ? (
            viewMode === 'landing' ? (
              <LandingPage
                key="landing"
                onStartPlanning={() => {
                  setInitialGoalPreset("");
                  setViewMode('setup');
                }}
                onTryPreset={(presetGoal) => {
                  setInitialGoalPreset(presetGoal);
                  setViewMode('setup');
                }}
              />
            ) : (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto py-10 px-4 md:px-8"
                id="plan-wizard-view"
              >
                <div className="max-w-4xl mx-auto mb-6">
                  <button
                    onClick={() => {
                      setInitialGoalPreset("");
                      setViewMode('landing');
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-bold text-slate-600 transition shadow-xs"
                    id="back-to-landing-btn"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
                  </button>
                </div>
                {error && (
                  <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2" id="error-alert">
                    <span className="font-bold">Error:</span> {error}
                  </div>
                )}
                <PlanForm onSubmit={handleGeneratePlan} isLoading={isLoading} initialGoal={initialGoalPreset} />
              </motion.div>
            )
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
              id="active-plan-dashboard"
            >
              {/* Sidebar: Stats & Settings from Sleek Interface design */}
              <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 hidden lg:flex" id="dashboard-sidebar">
                {/* Current Goal info */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Goal</h3>
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl shadow-sm">
                    <p className="text-sm font-bold text-slate-800 leading-snug mb-1 truncate" title={activePlan.title}>
                      {activePlan.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 font-semibold mt-3">
                      <span>{activePlan.timeframe} {activePlan.timeframeUnit} Plan</span>
                      <span>{progressPercent}% Done</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="bg-indigo-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-right">
                      {completedTasksCount} of {totalTasksCount} completed
                    </p>
                  </div>
                </div>

                {/* Intensity Level card from design */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Plan Specs</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-slate-600">Intensity</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{activePlan.intensity.split(" ")[0]}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-slate-600">Experience</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{activePlan.knowledgeLevel.split(" ")[0]}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-slate-600">Style</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]" title={activePlan.learningStyle}>
                        {activePlan.learningStyle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestones list */}
                {activePlan.milestones && activePlan.milestones.length > 0 && (
                  <div className="mb-8 overflow-y-auto flex-1 pr-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Milestones</h3>
                    <ul className="space-y-2">
                      {activePlan.milestones.map((m, idx) => (
                        <li key={idx} className="flex gap-2 text-xs text-slate-600 font-medium">
                          <span className="text-indigo-500 font-bold shrink-0">#{idx+1}</span>
                          <span className="leading-normal">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reset button at the bottom */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button
                    onClick={handleResetPlan}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-lg transition duration-150 flex items-center justify-center gap-2"
                    id="reset-plan-sidebar-btn"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Generate New Plan
                  </button>
                </div>
              </aside>

              {/* Main Content Pane */}
              <main className="flex-1 flex flex-col overflow-hidden">
                {/* Brief Banner Overlay from Sleek Interface Design */}
                <div className="p-4 md:p-6 bg-white border-b border-slate-200">
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Active Project Goal</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                          <Search className="w-4 h-4" />
                        </div>
                        <div className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 font-medium truncate" title={activePlan.goal}>
                          {activePlan.goal}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => {
                          setChatOpen(true);
                          setChatContextTask(null);
                          setChatContextDay(null);
                        }}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 transition flex items-center gap-1.5"
                        id="open-buddy-top-btn"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        AI Study Buddy
                      </button>
                      <button
                        onClick={handleResetPlan}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition lg:hidden"
                        title="Delete and recreate plan"
                        id="delete-plan-mobile-btn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-header with day tracker row */}
                <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0 overflow-x-auto scrollbar-none" id="day-tabs-row">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days:</span>
                    <div className="flex gap-1.5">
                      {activePlan.days.map((day) => {
                        const isDaySelected = day.dayNumber === selectedDayNumber;
                        const isDayDone = day.tasks.every((t) => t.completed);
                        return (
                          <button
                            key={day.dayNumber}
                            onClick={() => setSelectedDayNumber(day.dayNumber)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                              isDaySelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                : isDayDone
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                            }`}
                            id={`day-tab-${day.dayNumber}`}
                          >
                            <span>D{day.dayNumber.toString().padStart(2, "0")}</span>
                            {isDayDone && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-500 hidden sm:block">
                    Total: <span className="font-bold text-indigo-600">{activePlan.days.length} Days</span>
                  </div>
                </div>

                {/* Scrollable Work Area containing active Day Details & interactive panels */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50" id="planner-main-scroller">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Day Card (Left/Mid 2 cols) */}
                    <div className="md:col-span-2 space-y-6">
                      {currentSelectedDay ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="selected-day-panel">
                          {/* Card Header matching Sleek Interface card highlights */}
                          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded">
                                  Day {currentSelectedDay.dayNumber.toString().padStart(2, "0")} Focus
                                </span>
                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  Est: {currentSelectedDay.estimatedTime}
                                </span>
                              </div>
                              <h2 className="text-lg font-bold text-slate-800 mt-1">
                                {currentSelectedDay.dayTitle}
                              </h2>
                            </div>

                            <button
                              onClick={() => {
                                setChatOpen(true);
                                setChatContextDay(currentSelectedDay);
                                setChatContextTask(null);
                                setChatMessages((prev) => [
                                  ...prev,
                                  {
                                    role: "assistant",
                                    content: `I've set my helper context to **Day ${currentSelectedDay.dayNumber}: ${currentSelectedDay.dayTitle}**! 

What specific concept or practice problem would you like to review for this day's goal?`,
                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  }
                                ]);
                              }}
                              className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 transition flex items-center gap-1"
                              id="ask-day-context-btn"
                            >
                              <Brain className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                              Ask Day Quiz/Guide
                            </button>
                          </div>

                          {/* Day Brief statement */}
                          <div className="px-5 py-4 bg-indigo-50/20 border-b border-slate-100">
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              <span className="font-bold text-slate-700">Learning Goal:</span> {currentSelectedDay.focus}
                            </p>
                          </div>

                          {/* Tasks Checklist */}
                          <div className="p-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Interactive Checklist</h3>
                            
                            {currentSelectedDay.tasks.map((task, tIdx) => (
                              <div
                                key={tIdx}
                                className={`p-4 rounded-xl border transition duration-200 ${
                                  task.completed
                                    ? "bg-slate-50/80 border-slate-200 opacity-80"
                                    : "bg-white border-slate-200 hover:border-indigo-200 shadow-xs"
                                }`}
                                id={`task-card-${tIdx}`}
                              >
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => toggleTaskCompleted(currentSelectedDay.dayNumber, task.title)}
                                    className={`w-5.5 h-5.5 rounded-md flex items-center justify-center border transition shrink-0 mt-0.5 ${
                                      task.completed
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "border-slate-300 hover:border-indigo-400 bg-white"
                                    }`}
                                    id={`checkbox-task-${tIdx}`}
                                  >
                                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold text-slate-800 ${task.completed ? "line-through text-slate-400" : ""}`}>
                                      {task.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                      {task.description}
                                    </p>

                                    {/* Resources Links search */}
                                    {task.resources && task.resources.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Recommended:</span>
                                        {task.resources.map((resName, rIdx) => {
                                          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(resName)}`;
                                          return (
                                            <a
                                              key={rIdx}
                                              href={searchUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded text-[10px] font-semibold text-slate-600 hover:text-indigo-600 transition"
                                              title="Search video tutorial"
                                              id={`resource-link-${tIdx}-${rIdx}`}
                                            >
                                              {resName}
                                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                            </a>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* Quick help button for task */}
                                  <button
                                    onClick={() => {
                                      setChatContextTask(task);
                                      setChatContextDay(currentSelectedDay);
                                      setChatOpen(true);
                                      setChatMessages((prev) => [
                                        ...prev,
                                        {
                                          role: "assistant",
                                          content: `I've set my chat context helper to the task: "**${task.title}**". 

How can I help you complete this? I can provide an explanation of this, give you formulas, or solve a sample practice scenario!`,
                                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        }
                                      ]);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition shrink-0 self-start"
                                    title="Get AI explanation for this task"
                                    id={`task-help-btn-${tIdx}`}
                                  >
                                    <HelpCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Daily tip block */}
                          <div className="p-5 bg-amber-50/50 border-t border-slate-100 flex gap-3">
                            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Daily Study Tip</h4>
                              <p className="text-xs text-amber-900/80 leading-normal mt-0.5">
                                {currentSelectedDay.dailyTip}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
                          Select a study day from the list to preview activities.
                        </div>
                      )}
                    </div>

                    {/* Left/Right Sidebar: Personal Notes & Milestones (1 col) */}
                    <div className="space-y-6">
                      {/* Personal Study Journal Notes */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            My Study Notes
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400">Day {selectedDayNumber}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mb-3">
                          Write formulas, draft outlines, or keep key concepts here. Auto-saved locally.
                        </p>
                        <textarea
                          rows={6}
                          value={dayNotesText}
                          onChange={(e) => setDayNotesText(e.target.value)}
                          onBlur={handleSaveNotes}
                          placeholder="e.g. Memory rule for Derivatives: d/dx [f(g(x))] = f'(g(x)) * g'(x)"
                          className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-700 focus:bg-white transition"
                          id="study-notes-textarea"
                        />
                        <button
                          onClick={handleSaveNotes}
                          className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                          id="save-notes-btn"
                        >
                          Save Notes
                        </button>
                      </div>

                      {/* Productivity & Motivation card */}
                      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden" id="dashboard-productivity-card">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full" />
                        <Sparkles className="w-6 h-6 text-indigo-400 mb-3" />
                        <h4 className="font-bold text-sm tracking-tight">Stay Consistent</h4>
                        <p className="text-slate-300 text-xs leading-relaxed mt-2">
                          &ldquo;The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.&rdquo;
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Study Goal Tracker</span>
                          <span className="text-indigo-400 font-bold">{progressPercent}% complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Study Buddy Chat side panel */}
        <AnimatePresence>
          {chatOpen && (
            <StudyBuddyChat
              planTitle={activePlan?.title || "PlanIt"}
              activeDay={currentSelectedDay || null}
              activeTask={chatContextTask}
              isOpen={chatOpen}
              onClose={() => setChatOpen(false)}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isGenerating={isGeneratingChat}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Persistent helper chat toggle button when closed */}
      {activePlan && !chatOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => {
            setChatOpen(true);
            setChatContextTask(null);
            setChatContextDay(null);
          }}
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-100 border-2 border-white flex items-center justify-center z-40 hover:scale-105 transition duration-150"
          id="chat-trigger-bubble"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white" />
        </motion.button>
      )}
    </div>
  );
}

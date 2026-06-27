import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, X, Brain, HelpCircle, FileText, CheckCircle2, User, HelpCircleIcon } from "lucide-react";
import { DayPlan, Task, ChatMessage } from "../types";

interface StudyBuddyChatProps {
  planTitle: string;
  activeDay: DayPlan | null;
  activeTask: Task | null;
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
}

const CHIPS = [
  { label: "💡 Explain this simply", prompt: "Explain the main concepts of this day's topic in extremely simple terms, as if explaining to a beginner." },
  { label: "📝 Give me a quick quiz", prompt: "Provide 1 short conceptual multiple-choice quiz question based on this topic to test my knowledge. Don't reveal the answer immediately." },
  { label: "🔑 Study cheat-sheet", prompt: "Give me a concise cheat sheet outlining the 3 most critical formulas, rules, or definitions I need to memorize for this topic." },
  { label: "🛠️ Practice problem", prompt: "Give me 1 medium-level practice problem related to this topic along with a hint, but don't show the full solution unless I ask!" }
];

export default function StudyBuddyChat({
  planTitle,
  activeDay,
  activeTask,
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isGenerating
}: StudyBuddyChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    const text = inputText.trim();
    setInputText("");
    onSendMessage(text);
  };

  const handleChipClick = (prompt: string) => {
    if (isGenerating) return;
    onSendMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 380, opacity: 0.9 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 h-full"
      id="study-buddy-sidepanel"
    >
      {/* Side-panel Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-sm" id="chat-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Study Buddy</h3>
            <p className="text-[10px] text-slate-300">Your custom learning guide</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          id="close-chat-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* active context indicator */}
      {(activeDay || activeTask) && (
        <div className="bg-indigo-50 border-b border-indigo-100 p-3 text-xs text-indigo-900" id="chat-context">
          <p className="font-semibold flex items-center gap-1.5 text-indigo-950">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Active Helper Context:
          </p>
          {activeTask ? (
            <p className="text-slate-600 mt-0.5 font-medium truncate">
              Task: &ldquo;{activeTask.title}&rdquo;
            </p>
          ) : activeDay ? (
            <p className="text-slate-600 mt-0.5 font-medium truncate">
              Day {activeDay.dayNumber}: &ldquo;{activeDay.dayTitle}&rdquo;
            </p>
          ) : null}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" id="chat-messages-container">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3" id="empty-chat-state">
            <Brain className="w-12 h-12 text-slate-300" />
            <h4 className="font-semibold text-slate-700 text-sm">Hi, I&apos;m your Study Buddy!</h4>
            <p className="text-xs text-slate-400 max-w-[260px]">
              Click on a task to ask me questions, or use one of the quick prompts below to get started!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              id={`message-${idx}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                    : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm"
                }`}
              >
                {/* Simple formatting helper for lists and bolding */}
                <div className="space-y-1.5 whitespace-pre-wrap">
                  {msg.content.split("\n").map((line, lIdx) => {
                    // Check if it's a bold header/bullet
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <strong key={lIdx} className="block text-slate-900 font-semibold">{line.replaceAll("**", "")}</strong>;
                    }
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                      return (
                        <li key={lIdx} className="ml-3 list-disc text-xs text-slate-700">
                          {line.substring(2).replaceAll("**", "")}
                        </li>
                      );
                    }
                    if (/^\d+\.\s/.test(line)) {
                      return (
                        <li key={lIdx} className="ml-3 list-decimal text-xs text-slate-700">
                          {line.replace(/^\d+\.\s/, "").replaceAll("**", "")}
                        </li>
                      );
                    }
                    return (
                      <p key={lIdx} className={msg.role === "user" ? "text-white" : "text-slate-700 text-xs sm:text-sm"}>
                        {line.split("**").map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className={msg.role === "user" ? "text-indigo-100 font-bold" : "text-indigo-950 font-bold"}>{part}</strong> : part)}
                      </p>
                    );
                  })}
                </div>
                <span className="block text-[8px] mt-1 text-right opacity-60">
                  {msg.timestamp}
                </span>
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex gap-2.5 justify-start" id="ai-thinking-state">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <Brain className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
            </div>
            <div className="max-w-[82%] rounded-2xl px-4 py-3 bg-white border border-slate-200 text-slate-400 rounded-tl-none shadow-sm text-xs italic flex items-center gap-1.5">
              Buddy is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips panel (only shown if context is loaded) */}
      {(activeDay || activeTask) && (
        <div className="p-3 border-t border-slate-100 bg-white" id="chips-suggestions">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Ask Study Buddy:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
            {CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip.prompt)}
                disabled={isGenerating}
                className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:text-indigo-700 transition active:scale-[0.98] disabled:opacity-50"
                id={`chip-${idx}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex gap-2" id="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Buddy a question..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-800 focus:bg-white transition"
          id="chat-text-input"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isGenerating}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-100 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:shadow-none"
          id="send-message-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

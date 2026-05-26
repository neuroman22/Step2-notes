import React, { useState, useEffect } from "react";
import { Subject, Topic, Subtopic, Disease, Flashcard, Task, ExamRecord } from "./types";
import {
  INITIAL_SUBJECTS, INITIAL_TOPICS, INITIAL_SUBTOPICS, INITIAL_DISEASES,
  INITIAL_FLASHCARDS, INITIAL_TASKS, INITIAL_EXAMS, loadFromLocalStorage, saveToLocalStorage
} from "./data";
import Dashboard from "./components/Dashboard";
import Notebook from "./components/Notebook";
import FlashcardsReview from "./components/FlashcardsReview";
import ScoreTracker from "./components/ScoreTracker";
import { ClipboardList, BookOpen, Layers, Award, ShieldCheck, HeartPulse } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "notebook" | "flashcards" | "scores">("dashboard");

  // States
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [topics] = useState<Topic[]>(INITIAL_TOPICS);
  const [subtopics] = useState<Subtopic[]>(INITIAL_SUBTOPICS);

  const [diseases, setDiseases] = useState<Disease[]>(() =>
    loadFromLocalStorage<Disease[]>("diseases", INITIAL_DISEASES)
  );

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() =>
    loadFromLocalStorage<Flashcard[]>("flashcards", INITIAL_FLASHCARDS)
  );

  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromLocalStorage<Task[]>("tasks", INITIAL_TASKS)
  );

  const [exams, setExams] = useState<ExamRecord[]>(() =>
    loadFromLocalStorage<ExamRecord[]>("exams", INITIAL_EXAMS)
  );

  // Selected disease index in notebook state
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>("d1");

  // Sync state with localStorage on changes
  useEffect(() => {
    saveToLocalStorage("diseases", diseases);
  }, [diseases]);

  useEffect(() => {
    saveToLocalStorage("flashcards", flashcards);
  }, [flashcards]);

  useEffect(() => {
    saveToLocalStorage("tasks", tasks);
  }, [tasks]);

  useEffect(() => {
    saveToLocalStorage("exams", exams);
  }, [exams]);

  // Handle direct navigation to disease from linked dashboard items
  const handleNavigateToDisease = (diseaseId: string) => {
    setSelectedDiseaseId(diseaseId);
    setActiveTab("notebook");
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans" id="app-root-container">
      {/* Upper Navigation Header - Frosted Glass panel */}
      <header className="frosted-glass sticky top-0 z-30 shadow-lg" id="navigation-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center py-4 gap-4" id="header-inner">
          {/* Logo & title block */}
          <div className="flex items-center gap-3" id="brand-logo-row">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold drop-shadow-md shadow-blue-500/20 animate-pulse" id="brand-avatar">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent tracking-tight leading-none" id="main-app-title">
                Medical Study Assistant
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 font-mono tracking-wide uppercase block mt-1">
                USMLE Step 2 CK Notebook & Tracker
              </span>
            </div>
          </div>

          {/* Nav Tabs - Sleek Translucent Pill Container */}
          <nav className="flex items-center bg-slate-900/40 p-1.5 rounded-xl border border-white/5" id="main-navigation-menu">
            <button
              id="nav-to-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === "dashboard"
                  ? "bg-white/10 text-white shadow-sm border border-white/10 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Progress Dashboard
            </button>
            <button
              id="nav-to-notebook"
              onClick={() => setActiveTab("notebook")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === "notebook"
                  ? "bg-white/10 text-white shadow-sm border border-white/10 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Study Notebook
            </button>
            <button
              id="nav-to-flashcards"
              onClick={() => setActiveTab("flashcards")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === "flashcards"
                  ? "bg-white/10 text-white shadow-sm border border-white/10 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-4 h-4" /> Anki Reviews
            </button>
            <button
              id="nav-to-scores"
              onClick={() => setActiveTab("scores")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all outline-none ${
                activeTab === "scores"
                  ? "bg-white/10 text-white shadow-sm border border-white/10 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="w-4 h-4" /> CK Scoreboard
            </button>
          </nav>

          {/* Telemetry/offline guide */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium text-teal-300 bg-teal-500/10 py-1.5 px-3 rounded-full border border-teal-500/20" id="offline-telemetry">
            <ShieldCheck className="w-4 h-4 text-teal-400 font-bold" />
            <span>Active Offline Sync Enabled</span>
          </div>
        </div>
      </header>

      {/* Main Study Body Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="workspace-container">
        {activeTab === "dashboard" && (
          <Dashboard
            subjects={subjects}
            diseases={diseases}
            tasks={tasks}
            exams={exams}
            onUpdateTasks={setTasks}
            onNavigateToDisease={handleNavigateToDisease}
          />
        )}

        {activeTab === "notebook" && (
          <Notebook
            subjects={subjects}
            topics={topics}
            subtopics={subtopics}
            diseases={diseases}
            flashcards={flashcards}
            onUpdateDiseases={setDiseases}
            onUpdateFlashcards={setFlashcards}
            selectedDiseaseId={selectedDiseaseId}
            onSelectDisease={setSelectedDiseaseId}
          />
        )}

        {activeTab === "flashcards" && (
          <FlashcardsReview
            diseases={diseases}
            flashcards={flashcards}
            onUpdateFlashcards={setFlashcards}
            onNavigateToDisease={handleNavigateToDisease}
          />
        )}

        {activeTab === "scores" && (
          <ScoreTracker
            exams={exams}
            onUpdateExams={setExams}
          />
        )}
      </main>

      {/* Workspace Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 bg-slate-950/20" id="applet-footer">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 font-mono" id="footer-inner">
          <p className="text-slate-300 font-medium">Medical Study Assistant & Step 2 CK Tracker • Built for high fidelity USMLE reviews</p>
          <p className="mt-2 text-slate-500">All database changes persist continuously in standard client-side secure store.</p>
        </div>
      </footer>
    </div>
  );
}

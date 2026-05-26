import React, { useState } from "react";
import { Subject, Disease, Task, ExamRecord } from "../types";
import { CheckCircle2, Circle, Plus, Calendar as CalendarIcon, ClipboardList, BookOpen, Clock, Flame, Award, Trash2 } from "lucide-react";

interface DashboardProps {
  subjects: Subject[];
  diseases: Disease[];
  tasks: Task[];
  exams: ExamRecord[];
  onUpdateTasks: (newTasks: Task[]) => void;
  onNavigateToDisease: (diseaseId: string) => void;
}

export default function Dashboard({
  subjects,
  diseases,
  tasks,
  exams,
  onUpdateTasks,
  onNavigateToDisease
}: DashboardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Calendar setup: current month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Calculate stats
  const totalDiseases = diseases.length;
  const completedDiseases = diseases.filter(d => d.isCompleted).length;
  const diseaseProgressPercent = totalDiseases > 0 ? Math.round((completedDiseases / totalDiseases) * 100) : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Study streak (visual award)
  const studyStreak = 12; // Seeding a high yield mock streak

  // Organize tasks by date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.date === dateStr);
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      date: newTaskDate,
      completed: false
    };
    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== taskId));
  };

  // Subjects progress calculations
  const subjectsProgress = subjects.map(sub => {
    // Find all diseases belonging to this subject
    const subjectDiseaseIds: string[] = [];
    // Just map diseases carefully
    const subDiseases = diseases.filter(d => {
      // Trace up subtopic -> topic -> subject
      // In seed data:
      // d1 (subtopic st1) -> t1 -> s1 (IM)
      // d2 (st2) -> t1 -> s1 (IM)
      // d3 (st3) -> t2 -> s1 (IM)
      // d4 (st4) -> t3 -> s2 (Peds)
      // d5 (st5) -> t4 -> s3 (OBGYN)
      // d6 (st6) -> t5 -> s4 (Surgery)
      if (sub.id === "s1" && (d.id === "d1" || d.id === "d2" || d.id === "d3")) return true;
      if (sub.id === "s2" && d.id === "d4") return true;
      if (sub.id === "s3" && d.id === "d5") return true;
      if (sub.id === "s4" && d.id === "d6") return true;
      return false;
    });

    const totalInSub = subDiseases.length;
    const completedInSub = subDiseases.filter(d => d.isCompleted).length;
    const percent = totalInSub > 0 ? Math.round((completedInSub / totalInSub) * 100) : 0;

    return {
      ...sub,
      total: totalInSub,
      completed: completedInSub,
      percent
    };
  });

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* 1. Header Hero with Stats - Translucent Glass Card with Ambient Neon Fades */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden" id="dashboard-hero">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10" id="hero-stats-row">
          <div>
            <span className="text-teal-400 font-mono text-xs font-semibold uppercase tracking-widest block">Welcome back to your Study Desk</span>
            <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight mt-1 text-white flex items-center gap-2">
              Step 2 CK Focus Station
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1.5 max-w-xl leading-relaxed">
              Use this clinical dashboard to track daily textbook reviews, error corrections, spaced flashcard cards, and actual NBME practice scores.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg shadow-black/15" id="streak-indicator">
            <Flame className="w-8 h-8 text-orange-400 animate-pulse fill-orange-500/30" />
            <div>
              <div className="font-mono text-xl md:text-2xl font-black text-orange-300">{studyStreak} Days</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Study Streak</div>
            </div>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10" id="stats-grid">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-slate-300 text-xs">
              <span className="font-semibold text-slate-300">Cardiology & IM</span>
              <BookOpen className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold mt-1.5 text-white">{completedDiseases} / {totalDiseases}</div>
            <div className="text-[10px] text-slate-400 mt-1">Diseases Completed</div>
            <div className="w-full bg-slate-900/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-sky-400 h-full" style={{ width: `${diseaseProgressPercent}%` }} />
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-slate-300 text-xs">
              <span className="font-semibold text-slate-300">To-Do Correct Box</span>
              <ClipboardList className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold mt-1.5 text-white">{completedTasks} / {totalTasks}</div>
            <div className="text-[10px] text-slate-400 mt-1">Corrections Logged</div>
            <div className="w-full bg-slate-900/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${taskProgressPercent}%` }} />
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-slate-300 text-xs">
              <span className="font-semibold text-slate-300">NBME Peak Target</span>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-xl font-bold mt-1.5 text-white">
              {exams.length > 0 ? Math.max(...exams.filter(e => e.type === "NBME").map(e => e.score)) : "N/A"}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Practice Best Score</div>
            <div className="text-[9px] text-yellow-400 font-mono mt-2 flex items-center gap-1 font-semibold">
              ✨ Goal: 255+
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-slate-300 text-xs">
              <span className="font-semibold text-slate-300">Active Review Deck</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold mt-1.5 text-white">24</div>
            <div className="text-[10px] text-slate-400 mt-1">Cards Due Today</div>
            <div className="text-[9px] text-amber-300 font-mono mt-2 font-semibold">
              ⚡ Done: 145 / 169
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-items-container">
        {/* Left Side: To Do Correct box & Subject Dashboard Progress */}
        <div className="lg:col-span-7 space-y-6" id="dashboard-left-column">
          {/* To Do Correct Box - Frosted Design */}
          <div className="frosted-glass rounded-2xl p-5" id="todo-correct-panel">
            <div className="flex justify-between items-center mb-4" id="todo-box-header">
              <div>
                <h3 className="text-lg font-sans font-bold text-slate-100 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-teal-400" />
                  To-Do Correct Box & Study Tasks
                </h3>
                <p className="text-xs text-slate-400">Record specific clinical weaknesses, Q-bank corrections, or textbook reads.</p>
              </div>
              <span className="bg-teal-400/10 text-teal-300 text-xs font-mono font-semibold py-1 px-2.5 rounded-full border border-teal-400/20">
                {tasks.filter(t => !t.completed).length} Remainder
              </span>
            </div>

            {/* Form to Add Task */}
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-4" id="add-task-form">
              <input
                id="newTaskTitle"
                type="text"
                placeholder="Add correction e.g., Read Duke criteria..."
                className="flex-1 text-xs bg-slate-950/45 text-slate-100 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-teal-400 placeholder-slate-500 transition-all"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <input
                id="newTaskDate"
                type="date"
                className="text-xs bg-slate-950/45 text-slate-100 border border-white/10 rounded-lg px-2 py-2 outline-none focus:border-teal-400 text-left"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
              />
              <button
                id="addTaskButton"
                type="submit"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all shadow-md shadow-teal-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" /> Add
              </button>
            </form>

            {/* List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1" id="task-list">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  No active study corrections found. Add one above to start tracking!
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    id={`task-item-${task.id}`}
                    className={`flex items-start justify-between p-2.5 rounded-xl border transition-all text-xs group ${
                      task.completed
                        ? "bg-white/5 border-white/5 opacity-50 text-slate-400 line-through"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                      <button className="mt-0.5 outline-none text-slate-400" type="button">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-400 fill-teal-500/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 hover:text-teal-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span className="font-sans break-words text-slate-200 font-medium block leading-tight">
                          {task.title}
                        </span>
                        <div className="flex gap-2.5 items-center mt-1">
                          <span className="text-[9px] font-mono font-bold text-slate-400">
                             📅 {task.date}
                          </span>
                          {task.diseaseId && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (task.diseaseId) onNavigateToDisease(task.diseaseId);
                              }}
                              className="text-[9px] font-mono text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer"
                            >
                              🔗 View Disease Sheet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      id={`delete-task-${task.id}`}
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-400 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subject Dashboard Progress - Frosted Design */}
          <div className="frosted-glass rounded-2xl p-5 animate-fade-in" id="subject-progress-panel">
            <h3 className="text-lg font-sans font-bold text-slate-100 mb-3.5 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              My Subject Core Progression
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="subject-cards-grid">
              {subjectsProgress.map(s => (
                <div key={s.id} className="border border-white/5 bg-white/5 rounded-xl p-4 shadow-sm" id={`subject-prog-${s.id}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-sans font-bold text-slate-200 text-xs sm:text-sm">{s.name}</h4>
                    <span className="text-xs font-mono font-bold text-blue-400">{s.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-blue-400 h-full transition-all duration-300" style={{ width: `${s.percent}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>{s.completed} of {s.total} reviewed</span>
                    <span className="font-mono text-slate-300">{s.percent >= 100 ? "Ready" : s.percent >= 30 ? "Active" : "New"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Study Calendar Widget */}
        <div className="lg:col-span-5" id="dashboard-right-column">
          {/* Calendar Widget - Frosted Glass panel */}
          <div className="frosted-glass rounded-2xl p-5" id="calendar-panel">
            <div className="flex justify-between items-center mb-4.5" id="calendar-header-row">
              <h3 className="text-md font-sans font-bold text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                Study Calendar
              </h3>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 py-1 px-2.5 rounded-lg">
                {monthNames[currentMonth]} {currentYear}
              </span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 border-b border-white/5 pb-2.5 mb-2.5" id="calendar-days-of-week">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            <div className="grid grid-cols-7 gap-1" id="calendar-date-cells">
              {calendarDays.map((day, ix) => {
                if (day === null) return <div key={`empty-${ix}`} className="p-2 bg-transparent" />;
                const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = dateString === selectedDate;
                const dateTasks = getTasksForDate(dateString);
                const hasCompletedTasks = dateTasks.length > 0 && dateTasks.every(t => t.completed);
                const hasPendingTasks = dateTasks.length > 0 && dateTasks.some(t => !t.completed);

                return (
                  <button
                    key={`day-${day}`}
                    id={`calendar-day-btn-${day}`}
                    onClick={() => setSelectedDate(dateString)}
                    type="button"
                    className={`p-2 rounded-lg text-center font-mono relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold shadow-md border border-blue-500/30"
                        : "text-slate-300 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="text-xs">{day}</span>
                    {/* Task status indicator dots */}
                    {hasPendingTasks && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? "bg-white" : "bg-orange-400"}`} />
                    )}
                    {!hasPendingTasks && hasCompletedTasks && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? "bg-white" : "bg-emerald-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Details */}
            <div className="mt-4 pt-4 border-t border-white/5" id="calendar-day-details">
              <h4 className="text-[11px] font-mono text-slate-400 mb-2.5 font-bold">
                WEEKLY REVIEW: <span className="text-blue-400 font-extrabold">{selectedDate}</span>
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5" id="calendar-selected-tasks">
                {selectedDateTasks.length === 0 ? (
                  <div className="text-slate-500 text-xs italic py-3 text-center">
                    No active study tasks scheduled for this day. Click "+" to add a correction!
                  </div>
                ) : (
                  selectedDateTasks.map(task => (
                    <div
                      key={`cal-t-${task.id}`}
                      className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${
                        task.completed 
                          ? "bg-white/5 border-white/5 opacity-50 text-slate-400 line-through" 
                          : "bg-white/5 border-white/10 text-slate-200 font-medium"
                      }`}
                    >
                      <span className="truncate flex-1 pr-1">{task.title}</span>
                      <button
                        id={`cal-task-toggle-${task.id}`}
                        onClick={() => handleToggleTask(task.id)}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                          task.completed 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                            : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        {task.completed ? "Done" : "Mark"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

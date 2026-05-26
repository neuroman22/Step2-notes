import React, { useState } from "react";
import { ExamRecord } from "../types";
import { Trash2, TrendingUp, Plus, ListFilter, Target, Award, BarChart2 } from "lucide-react";

interface ScoreTrackerProps {
  exams: ExamRecord[];
  onUpdateExams: (exams: ExamRecord[]) => void;
}

export default function ScoreTracker({ exams, onUpdateExams }: ScoreTrackerProps) {
  const [activeSegment, setActiveSegment] = useState<"NBME" | "CMS">("NBME");

  // Form states to add new exam
  const [newType, setNewType] = useState<"NBME" | "CMS">("NBME");
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("Step 2 CK");
  const [newScore, setNewScore] = useState<number>(240);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTarget, setNewTarget] = useState<number>(250);
  const [newIncorrects, setNewIncorrects] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleDeleteRecord = (id: string) => {
    onUpdateExams(exams.filter(e => e.id !== id));
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newScore) return;

    const record: ExamRecord = {
      id: `exam_${Date.now()}`,
      type: newType,
      name: newName.trim(),
      subject: newType === "NBME" ? "Step 2 CK" : newSubject,
      score: Number(newScore),
      date: newDate,
      targetScore: newType === "NBME" ? Number(newTarget) : undefined,
      incorrectTopics: newIncorrects ? newIncorrects.split(",").map(t => t.trim()).filter(Boolean) : [],
      notes: newNotes.trim() || undefined
    };

    onUpdateExams([...exams, record]);

    // reset some
    setNewName("");
    setNewIncorrects("");
    setNewNotes("");
  };

  // Filter exams by active segment
  const segmentExams = exams
    .filter(e => e.type === activeSegment)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Analytical summary
  const scores = segmentExams.map(e => e.score);
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Custom SVG line chart calculations
  const chartWidth = 500;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  let pointsPath = "";
  let targetPath = "";
  const plotPoints: { x: number; y: number; score: number; name: string; date: string }[] = [];

  if (segmentExams.length > 1) {
    const minScore = activeSegment === "NBME" ? 200 : 50;
    const maxScoreRef = activeSegment === "NBME" ? 280 : 100;
    const scoreRange = maxScoreRef - minScore;

    segmentExams.forEach((exam, index) => {
      // safe divide x scale
      const x = paddingX + (index / (segmentExams.length - 1)) * (chartWidth - paddingX * 2);
      // reverse y scale: higher score means smaller y (stands higher up!)
      const percent = (exam.score - minScore) / scoreRange;
      const y = chartHeight - paddingY - percent * (chartHeight - paddingY * 2);

      plotPoints.push({ x, y, score: exam.score, name: exam.name, date: exam.date });
    });

    pointsPath = plotPoints.map(p => `${p.x},${p.y}`).join(" ");

    // Target scoring line (available for NBME forms)
    if (activeSegment === "NBME" && segmentExams.some(e => e.targetScore)) {
      const sampleTarget = segmentExams[segmentExams.length - 1].targetScore || 250;
      const percent = (sampleTarget - minScore) / scoreRange;
      const y = chartHeight - paddingY - percent * (chartHeight - paddingY * 2);
      targetPath = `M ${paddingX} ${y} L ${chartWidth - paddingX} ${y}`;
    }
  }

  // Pre-compiled estimates of percentile scores for NBME (standard guidelines scale 200-280)
  const getPercentile = (score: number) => {
    if (activeSegment === "CMS") return `${score}% Correct`;
    if (score >= 265) return "98th Percentile - Top Tier Match";
    if (score >= 255) return "90th Percentile - Highly Competitive";
    if (score >= 245) return "72nd Percentile - Strong Average";
    if (score >= 230) return "43rd Percentile - Solid Pass";
    if (score >= 214) return "15th Percentile - Minimum Pass";
    return "Remediation Suggested";
  };

  return (
    <div className="space-y-6 animate-fade-in" id="score-tracker-view">
      {/* Track board Switcher tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl" id="analytics-overview-row">
        <div>
          <h2 className="text-lg font-sans font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Step 2 CK Score Target board
          </h2>
          <p className="text-xs text-slate-400 font-sans">Log evaluations and model your percentile achievements as you edge closer.</p>
        </div>
        <div className="flex bg-slate-950/45 p-1 rounded-xl border border-white/5" id="segment-switch flex">
          <button
            id="seg-nbme"
            onClick={() => setActiveSegment("NBME")}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
              activeSegment === "NBME"
                ? "bg-teal-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            NBME Forms (3-digit)
          </button>
          <button
            id="seg-cms"
            onClick={() => setActiveSegment("CMS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
              activeSegment === "CMS"
                ? "bg-teal-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            CMS Shelf Assessments
          </button>
        </div>
      </div>

      {/* Analytics widgets and interactive line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="analytics-grid-row">
        {/* Left chart card */}
        <div className="lg:col-span-8 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between" id="chart-card-col">
          <div>
            <div className="flex justify-between items-center mb-4" id="chart-card-header">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                {activeSegment} Chronological Progression
              </span>
              <div className="flex gap-4 text-xs font-mono" id="chart-legends">
                <span className="flex items-center gap-1.5 text-teal-300">
                  <span className="w-3 h-1 bg-teal-400 inline-block font-bold rounded-full" /> Scores logged
                </span>
                {activeSegment === "NBME" && (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="border-t border-dashed border-rose-400 w-4 inline-block" /> Goal Target
                  </span>
                )}
              </div>
            </div>

            {/* SVG implementation */}
            <div className="w-full overflow-x-auto" id="svg-chart-container">
              {segmentExams.length < 2 ? (
                <div className="bg-slate-950/40 rounded-xl h-56 flex flex-col items-center justify-center p-6 text-center space-y-2 border border-white/5" id="chart-empty">
                  <BarChart2 className="w-8 h-8 text-slate-600" />
                  <p className="text-xs text-slate-400 font-medium font-sans">
                    Log at least <strong className="text-teal-400">2 {activeSegment} exams</strong> to output interactive trend graphics!
                  </p>
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto bg-slate-950/40 rounded-xl border border-white/5 px-2 pt-2"
                >
                  {/* Grid lines */}
                  <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                  {/* Target line */}
                  {targetPath && (
                    <path d={targetPath} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4,4" />
                  )}

                  {/* Score Path line */}
                  <polyline
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsPath}
                    className="drop-shadow-[0_2px_8px_rgba(20,184,166,0.3)] font-bold"
                  />

                  {/* Circle Nodes and Tooltips */}
                  {plotPoints.map((point, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="6"
                        fill="#020617"
                        stroke="#14b8a6"
                        strokeWidth="3"
                        className="hover:r-8 transition-all"
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="12"
                        fill="transparent"
                        className="hover:fill-teal-500/10"
                      />
                      {/* Tooltip on hovering node */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-150">
                        <rect
                          x={Math.max(10, point.x - 65)}
                          y={point.y - 45}
                          width="130"
                          height="35"
                          rx="6"
                          fill="#090d16"
                          stroke="rgba(255,255,255,0.1)"
                          className="shadow-2xl"
                        />
                        <text x={point.x} y={point.y - 32} fill="#ce3a54" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          {point.name}
                        </text>
                        <text x={point.x} y={point.y - 19} fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                          Score: {point.score} ({point.date})
                        </text>
                      </g>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4" id="chart-metrics">
            <div className="bg-slate-950/45 p-3 rounded-xl border border-white/5 shadow-md">
              <span className="text-[10px] font-mono font-bold text-slate-500 block">Average Result</span>
              <span className="text-lg font-black text-teal-300 block">{averageScore || "N/A"}</span>
            </div>
            <div className="bg-slate-950/45 p-3 rounded-xl border border-white/5 shadow-md">
              <span className="text-[10px] font-mono font-bold text-slate-500 block">Peak Performance</span>
              <span className="text-lg font-black text-emerald-400 block">{maxScore || "N/A"}</span>
            </div>
            <div className="bg-slate-950/45 p-3 rounded-xl border border-white/5 shadow-md">
              <span className="text-[10px] font-mono font-bold text-slate-500 block">Percentile Estimate</span>
              <span className="text-[11px] font-black text-teal-300 block truncate leading-tight">
                {averageScore > 0 ? getPercentile(averageScore).split(" - ")[0] : "No scores logged"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Form Card to add study exams */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl text-slate-200" id="exam-log-col">
          <h3 className="text-sm font-sans font-extrabold text-white mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" /> Log Practice Exam
          </h3>

          <form onSubmit={handleAddExam} className="space-y-3 text-xs" id="add-exam-form">
            <div id="exam-type-wrapper">
              <label htmlFor="examTypeSelection" className="block font-bold text-slate-300 mb-1">Evaluation Category:</label>
              <div className="grid grid-cols-2 gap-2" id="exam-type-toggle">
                <button
                  id="btn-nbme-type"
                  type="button"
                  onClick={() => { setNewType("NBME"); setNewSubject("Step 2 CK"); }}
                  className={`py-1.5 text-center rounded-lg border font-bold text-xs cursor-pointer transition-all ${
                    newType === "NBME" ? "bg-teal-500 border-teal-500 text-slate-950 shadow-sm" : "bg-slate-950/45 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  NBME Practice
                </button>
                <button
                  id="btn-cms-type"
                  type="button"
                  onClick={() => { setNewType("CMS"); setNewSubject("Medicine"); }}
                  className={`py-1.5 text-center rounded-lg border font-bold text-xs cursor-pointer transition-all ${
                    newType === "CMS" ? "bg-teal-500 border-teal-500 text-slate-950 shadow-sm" : "bg-slate-950/45 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  CMS Shelf
                </button>
              </div>
            </div>

            <div id="exam-name-wrapper">
              <label htmlFor="examNameInput" className="block font-bold text-slate-300 mb-1">Form Name:</label>
              <input
                id="examNameInput"
                type="text"
                placeholder={newType === "NBME" ? "e.g., NBME Form 11" : "e.g., Pediatrics form 6"}
                className="w-full bg-slate-950/45 border border-white/10 rounded-lg px-2.5 py-2 outline-none text-slate-200 focus:border-teal-400"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            {newType === "CMS" && (
              <div id="exam-sub-wrapper animate">
                <label htmlFor="examSubjectSelection" className="block font-bold text-slate-300 mb-1">CMS Subject Domain:</label>
                <select
                  id="examSubjectSelection"
                  className="w-full bg-slate-950/45 border border-white/10 rounded-lg px-2.5 py-2 outline-none text-slate-200 focus:border-teal-400"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="OBGYN">Obstetrics & Gynecology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Family Medicine">Family Medicine</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2" id="exam-score-grid">
              <div>
                <label htmlFor="examScoreInput" className="block font-bold text-slate-300 mb-1">
                  Score {newType === "NBME" ? "(180-290)" : "(0-100%)"}:
                </label>
                <input
                  id="examScoreInput"
                  type="number"
                  min={newType === "NBME" ? 150 : 0}
                  max={newType === "NBME" ? 300 : 100}
                  className="w-full bg-slate-950/45 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none text-slate-200 focus:border-teal-400"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label htmlFor="examDateInput" className="block font-bold text-slate-300 mb-1">Date Logged:</label>
                <input
                  id="examDateInput"
                  type="date"
                  className="w-full bg-slate-950/45 border border-white/10 rounded-lg px-2 py-1.5 outline-none text-slate-200 focus:border-teal-400"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {newType === "NBME" && (
              <div id="exam-target-wrapper">
                <label htmlFor="examTargetInput" className="block font-bold text-slate-300 mb-1">Target Score:</label>
                <input
                  id="examTargetInput"
                  type="number"
                  placeholder="e.g. 250"
                  className="w-full bg-slate-950/45 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none text-slate-200 focus:border-teal-400"
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                />
              </div>
            )}

            <div id="exam-incorrect-wrapper">
              <label htmlFor="examIncorrectsInput" className="block font-bold text-slate-300 mb-1">Weak points / Mistake Keywords (comma separated):</label>
              <input
                id="examIncorrectsInput"
                type="text"
                placeholder="e.g. perivalvular ring abscess, Stanford Class B and A"
                className="w-full bg-slate-950/45 border border-white/10 rounded-lg px-2.5 py-2 outline-none text-slate-200 focus:border-teal-400"
                value={newIncorrects}
                onChange={(e) => setNewIncorrects(e.target.value)}
              />
            </div>

            <button
              id="submit-exam-btn"
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-lg py-2.5 transition-all mt-3 cursor-pointer shadow-md shadow-teal-500/10"
            >
              Post to Trend Track board
            </button>
          </form>
        </div>
      </div>

      {/* Score Log Grid table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl text-slate-200" id="score-records-panel">
        <h3 className="text-md font-sans font-extrabold text-white mb-4 flex items-center gap-1.5">
          <ListFilter className="w-4 h-4 text-teal-400" /> Historic Scorecard Log
        </h3>

        <div className="overflow-x-auto" id="historic-exam-table-wrapper">
          <table className="w-full text-left border-collapse text-xs text-slate-300" id="exams-table">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono font-bold uppercase">
                <th className="py-2.5 px-3">Exam Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-center">Achieved Score</th>
                <th className="py-2.5 px-3">Step 2 CK Percentile Placement</th>
                <th className="py-2.5 px-3">Incorrect focus areas</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5" id="exams-tbody">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500 italic">No exams recorded yet. Log your first form above!</td>
                </tr>
              ) : (
                exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-white/5 transition-all" id={`exam-tr-${exam.id}`}>
                    <td className="py-2.5 px-3 font-bold text-white font-sans">{exam.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold border ${
                        exam.type === "NBME" 
                          ? "bg-amber-400/10 text-amber-300 border-amber-500/20" 
                          : "bg-sky-400/10 text-sky-300 border-sky-500/20"
                      }`}>
                        {exam.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{exam.date}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-teal-400 font-mono text-sm">{exam.score}</td>
                    <td className="py-2.5 px-3 font-semibold text-teal-300 font-sans">{getPercentile(exam.score)}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {exam.incorrectTopics && exam.incorrectTopics.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {exam.incorrectTopics.map((topic, index) => (
                            <span key={index} className="bg-white/5 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-sm border border-white/5">
                              {topic}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono italic">No errors logged</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        id={`delete-exam-${exam.id}`}
                        onClick={() => handleDeleteRecord(exam.id)}
                        className="text-slate-400 hover:text-red-400 p-1 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

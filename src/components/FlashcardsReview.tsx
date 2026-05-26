import React, { useState } from "react";
import { Flashcard, Disease } from "../types";
import { Layers, HelpCircle, Check, Eye, ChevronRight, BookOpen, Clock, AlertCircle, Plus, Trash2 } from "lucide-react";

interface FlashcardsReviewProps {
  diseases: Disease[];
  flashcards: Flashcard[];
  onUpdateFlashcards: (cards: Flashcard[]) => void;
  onNavigateToDisease: (diseaseId: string) => void;
}

export default function FlashcardsReview({
  diseases,
  flashcards,
  onUpdateFlashcards,
  onNavigateToDisease
}: FlashcardsReviewProps) {
  const [activeTab, setActiveTab] = useState<"review" | "all" | "create">("review");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Filter cards due today
  const todayISO = new Date().toISOString().split("T")[0];
  const dueCards = flashcards.filter(c => {
    const nextDateISO = c.nextReviewDate.split("T")[0];
    return nextDateISO <= todayISO;
  });

  // Setup form state for creating manual card
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [selectedDiseaseId, setSelectedDiseaseId] = useState("");

  const handleGradeCard = (grade: "again" | "hard" | "good" | "easy") => {
    if (dueCards.length === 0) return;
    const currentCard = dueCards[currentIdx];

    let interval = currentCard.intervalDays;
    let repetitions = currentCard.repetitions;
    let easeFactor = currentCard.easeFactor;

    if (grade === "again") {
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (grade === "hard") {
      repetitions += 1;
      interval = Math.round(interval * 1.2);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (grade === "good") {
      repetitions += 1;
      interval = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(interval * easeFactor);
    } else if (grade === "easy") {
      repetitions += 1;
      interval = repetitions === 1 ? 4 : repetitions === 2 ? 10 : Math.round(interval * easeFactor * 1.3);
      easeFactor = easeFactor + 0.15;
    }

    // Set next date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // Save back to general list
    const updated = flashcards.map(c => {
      if (c.id === currentCard.id) {
        return {
          ...c,
          intervalDays: interval,
          easeFactor,
          repetitions,
          nextReviewDate: nextReview.toISOString()
        };
      }
      return c;
    });

    onUpdateFlashcards(updated);
    setShowAnswer(false);

    // Next card index logic
    if (currentIdx < dueCards.length - 1) {
      // Advance Index
    } else {
      setCurrentIdx(0); // Loop back or trigger success view
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const findDisease = diseases.find(d => d.id === selectedDiseaseId);
    const subjectId = findDisease ? "s1" : "s1"; // standard or map to subjects

    const newCard: Flashcard = {
      id: `fc_${Date.now()}`,
      diseaseId: selectedDiseaseId || "unlinked",
      subjectId,
      front: newFront.trim(),
      back: newBack.trim(),
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date().toISOString()
    };

    onUpdateFlashcards([...flashcards, newCard]);
    setNewFront("");
    setNewBack("");
    setSelectedDiseaseId("");
    setActiveTab("all"); // switch to list
  };

  const handleDeleteCard = (id: string) => {
    onUpdateFlashcards(flashcards.filter(c => c.id !== id));
  };

  const getDiseaseName = (diseaseId: string) => {
    const d = diseases.find(item => item.id === diseaseId);
    return d ? d.name : "General Study";
  };

  return (
    <div className="space-y-6" id="flashcards-review-view">
      {/* Tab Selectors */}
      <div className="flex border-b border-white/10" id="flashcard-tabs">
        <button
          id="tab-review"
          onClick={() => { setActiveTab("review"); setCurrentIdx(0); setShowAnswer(false); }}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
            activeTab === "review"
              ? "border-teal-400 text-teal-400 font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Anki Reviews Due ({dueCards.length})
        </button>
        <button
          id="tab-all"
          onClick={() => setActiveTab("all")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-teal-400 text-teal-400 font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Review All Decks ({flashcards.length})
        </button>
        <button
          id="tab-create"
          onClick={() => setActiveTab("create")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
            activeTab === "create"
              ? "border-teal-400 text-teal-400 font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          + Add Study Card
        </button>
      </div>

      {/* Core Panels */}
      {activeTab === "review" && (
        <div className="space-y-6 animate-fade-in" id="review-panel">
          {dueCards.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-xl" id="anki-caught-up">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto text-teal-400 border border-teal-500/30">
                <Check className="w-8 h-8 font-black" />
              </div>
              <h3 className="text-lg font-sans font-black text-white">All Spaced Reviews Completed!</h3>
              <p className="text-slate-300 text-sm">
                Your spaced repetition queue is fully empty today. Outstanding effort! Keeping a schedule is the single highest predictor of Step 2 score results.
              </p>
              <div className="pt-2 text-xs text-slate-500">
                Tip: You can generate smart auto-review flashcards through the <strong className="text-teal-400 font-semibold">Notebook panel</strong> by clinical paragraphs.
              </div>
              <button
                id="reset-cards-btn"
                onClick={() => {
                  // Simulate resets for demo/reviews
                  const resetList = flashcards.map(c => ({
                    ...c,
                    nextReviewDate: new Date().toISOString()
                  }));
                  onUpdateFlashcards(resetList);
                }}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-black px-4 py-2.5 transition-all mt-4 cursor-pointer shadow-md shadow-teal-500/10"
              >
                Reset Interval dates (Review of all {flashcards.length} cards)
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4" id="anki-review-deck">
              {/* Due Counter */}
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono" id="review-counter">
                <span>REMAINING CARDS: {dueCards.length - currentIdx} DUE</span>
                <span>CARD PROFILE: {currentIdx + 1} OF {dueCards.length}</span>
              </div>

              {/* Flashcard Body */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-72 shadow-2xl flex flex-col justify-between text-slate-100" id="flashcard-body border">
                <div>
                  <div className="flex justify-between items-start mb-4" id="card-tag-row">
                    <span className="bg-teal-400/10 text-teal-300 text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-teal-500/20 uppercase tracking-wide">
                      {getDiseaseName(dueCards[currentIdx].diseaseId)}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      Interval: {dueCards[currentIdx].intervalDays}d • Ease: {dueCards[currentIdx].easeFactor.toFixed(1)}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="space-y-3" id="flashcard-question">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">FRONT (ACTIVE RECALL)</span>
                    <p className="text-white font-sans text-base leading-relaxed font-black">
                      {dueCards[currentIdx].front}
                    </p>
                  </div>

                  {/* Divider */}
                  {showAnswer && (
                    <div className="border-t border-white/10 my-6 py-4 animate-fade-in" id="flashcard-answer animate">
                      <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest block mb-2">BACK (CLINICAL REVEAL)</span>
                      <p className="text-slate-200 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                        {dueCards[currentIdx].back}
                      </p>
                    </div>
                  )}
                </div>

                {/* Show/Action Buttons */}
                <div className="pt-6" id="card-actions-wrapper">
                  {!showAnswer ? (
                    <button
                      id="reveal-answer-btn"
                      onClick={() => setShowAnswer(true)}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Reveal Response
                    </button>
                  ) : (
                    <div className="space-y-3" id="grading-grid-row">
                      <span className="text-[10px] font-mono text-center block text-slate-400 uppercase tracking-wider">How accurately did you recall?</span>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          id="grade-again"
                          onClick={() => handleGradeCard("again")}
                          className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 py-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                        >
                          <span>Again</span>
                          <span className="text-[10px] text-red-400 font-mono normal-case">(&lt;10m)</span>
                        </button>
                        <button
                          id="grade-hard"
                          onClick={() => handleGradeCard("hard")}
                          className="bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-300 py-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                        >
                          <span>Hard</span>
                          <span className="text-[10px] text-orange-400 font-mono normal-case">(+20%)</span>
                        </button>
                        <button
                          id="grade-good"
                          onClick={() => handleGradeCard("good")}
                          className="bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 py-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                        >
                          <span>Good</span>
                          <span className="text-[10px] text-blue-400 font-mono normal-case">(Normal)</span>
                        </button>
                        <button
                          id="grade-easy"
                          onClick={() => handleGradeCard("easy")}
                          className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 py-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                        >
                          <span>Easy</span>
                          <span className="text-[10px] text-emerald-400 font-mono normal-case">(Bonus)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation help */}
              <div className="flex justify-between items-center text-xs text-slate-400" id="anki-nav-row">
                <button
                  id="skip-card"
                  onClick={() => {
                    setCurrentIdx((currentIdx + 1) % dueCards.length);
                    setShowAnswer(false);
                  }}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Skip Card <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="cursor-pointer hover:underline text-teal-400 font-bold" onClick={() => onNavigateToDisease(dueCards[currentIdx].diseaseId)}>
                  ✏️ View related details page
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl animate-fade-in text-slate-200" id="deck-list-panel">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3" id="deck-sub-header">
            <div>
              <h3 className="text-md font-sans font-bold text-white">Active Flashcard Deck Log</h3>
              <p className="text-xs text-slate-400">Every card currently configured in your personal spaced repetition engine.</p>
            </div>
            <span className="text-xs font-mono font-medium text-teal-400">{flashcards.length} Total Cards</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="cards-log-list">
            {flashcards.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">No flashcards found. Click "+ Add Study Card" to write one!</div>
            ) : (
              flashcards.map(card => (
                <div key={card.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start justify-between gap-4 text-xs shadow-md" id={`card-item-${card.id}`}>
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2 items-center">
                      <span className="bg-teal-400/10 text-teal-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-teal-500/20 uppercase">
                        {getDiseaseName(card.diseaseId)}
                      </span>
                      <span className="text-slate-400 font-mono text-[9px]">
                        Due: {card.nextReviewDate.split("T")[0]} (Mult: x{card.easeFactor.toFixed(1)})
                      </span>
                    </div>
                    <p className="text-white font-extrabold font-sans text-xs">
                      <span className="text-teal-400 font-mono mr-1 font-bold">Q:</span>{card.front}
                    </p>
                    <p className="text-slate-300 font-sans text-xs">
                      <span className="text-blue-400 font-mono mr-1 font-bold">A:</span>{card.back}
                    </p>
                  </div>
                  <button
                    id={`delete-fc-${card.id}`}
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-slate-400 hover:text-red-400 p-1 mt-1 shrink-0 cursor-pointer"
                    title="Delete Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "create" && (
        <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl animate-fade-in text-slate-200" id="add-card-panel">
          <h3 className="text-md font-sans font-extrabold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Write Custom High-Yield Active Recall Card
          </h3>

          <form onSubmit={handleCreateCard} className="space-y-4" id="create-card-form">
            <div id="select-disease-wrapper">
              <label htmlFor="cardDiseaseSelection" className="block text-xs font-bold text-slate-300 mb-1">
                Link to Disease Study Page (Optional):
              </label>
              <select
                id="cardDiseaseSelection"
                className="w-full text-xs bg-slate-950/45 border border-white/10 rounded-lg px-3 py-2 outline-none text-slate-200 focus:border-teal-400"
                value={selectedDiseaseId}
                onChange={(e) => setSelectedDiseaseId(e.target.value)}
              >
                <option value="">-- No Link (General Study Term) --</option>
                {diseases.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div id="form-front-wrapper">
              <label htmlFor="cardFrontInput" className="block text-xs font-bold text-slate-300 mb-1 block">
                Front (Question / Prompt):
              </label>
              <textarea
                id="cardFrontInput"
                placeholder="e.g. What is the standard diagnostic criteria for..."
                rows={2}
                className="w-full text-xs bg-slate-950/45 border border-white/10 rounded-lg px-3 py-2 outline-none text-slate-200 placeholder-slate-500 focus:border-teal-400"
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                required
              />
            </div>

            <div id="form-back-wrapper">
              <label htmlFor="cardBackInput" className="block text-xs font-bold text-slate-300 mb-1 block">
                Back (High-Yield Active Recall Response):
              </label>
              <textarea
                id="cardBackInput"
                placeholder="e.g. Duke Criteria (needs 2 major or 5 minor criteria)..."
                rows={3}
                className="w-full text-xs bg-slate-950/45 border border-white/10 rounded-lg px-3 py-2 outline-none text-slate-200 placeholder-slate-500 focus:border-teal-400"
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                required
              />
            </div>

            <button
              id="submit-card-btn"
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs py-2.5 transition-all shadow-md shadow-teal-500/10 cursor-pointer"
            >
              Add Card to Review Database
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

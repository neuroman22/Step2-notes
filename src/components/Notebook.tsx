import React, { useState, useRef } from "react";
import { Subject, Topic, Subtopic, Disease, Annotation, Flashcard } from "../types";
import {
  ChevronRight, BookOpen, Search, Plus, Trash2, Edit2, CheckCircle2, Circle, Sparkles, BrainCircuit,
  HelpCircle, AlertCircle, FileText, Upload, Image as ImageIcon, X, ArrowRight, Loader2
} from "lucide-react";

interface NotebookProps {
  subjects: Subject[];
  topics: Topic[];
  subtopics: Subtopic[];
  diseases: Disease[];
  flashcards: Flashcard[];
  onUpdateDiseases: (newDiseases: Disease[]) => void;
  onUpdateFlashcards: (newCards: Flashcard[]) => void;
  selectedDiseaseId: string;
  onSelectDisease: (diseaseId: string) => void;
}

export default function Notebook({
  subjects,
  topics,
  subtopics,
  diseases,
  flashcards,
  onUpdateDiseases,
  onUpdateFlashcards,
  selectedDiseaseId,
  onSelectDisease
}: NotebookProps) {
  // Tree state
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>(["s1"]);
  const [expandedTopics, setExpandedTopics] = useState<string[]>(["t1"]);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit states for current disease sheet
  const [isEditing, setIsEditing] = useState(false);
  const [editedDiagnosis, setEditedDiagnosis] = useState("");
  const [editedTreatment, setEditedTreatment] = useState("");
  const [editedComplications, setEditedComplications] = useState("");
  const [editedNotes, setEditedNotes] = useState("");

  // Keyword management
  const [newKeywordInput, setNewKeywordInput] = useState("");

  // Highlighter & Annotation active selection
  const [highlightedText, setHighlightedText] = useState("");
  const [annotationNote, setAnnotationNote] = useState("");
  const [annotationImageUrl, setAnnotationImageUrl] = useState("");
  const [isAILookupLoading, setIsAILookupLoading] = useState(false);
  const [aiLookupResult, setAiLookupResult] = useState<any | null>(null);

  // Drag and drop base64 file state
  const [dragging, setDragging] = useState(false);

  // Active viewing annotation modal/box
  const [viewingAnnotation, setViewingAnnotation] = useState<Annotation | null>(null);

  const disease = diseases.find(d => d.id === selectedDiseaseId) || diseases[0];

  const toggleSubject = (subId: string) => {
    setExpandedSubjects(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const toggleTopic = (topId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topId) ? prev.filter(id => id !== topId) : [...prev, topId]
    );
  };

  // Sync edits when disease or edit mode changes
  React.useEffect(() => {
    if (disease) {
      setEditedDiagnosis(disease.diagnosis);
      setEditedTreatment(disease.treatment);
      setEditedComplications(disease.complications);
      setEditedNotes(disease.notes);
    }
    // Clear selection
    setHighlightedText("");
    setAiLookupResult(null);
  }, [disease, isEditing]);

  const handleSaveEdits = () => {
    if (!disease) return;
    const updated = diseases.map(d => {
      if (d.id === disease.id) {
        return {
          ...d,
          diagnosis: editedDiagnosis,
          treatment: editedTreatment,
          complications: editedComplications,
          notes: editedNotes
        };
      }
      return d;
    });
    onUpdateDiseases(updated);
    setIsEditing(false);
  };

  const handleToggleCompleted = () => {
    if (!disease) return;
    const updated = diseases.map(d => {
      if (d.id === disease.id) {
        return { ...d, isCompleted: !d.isCompleted };
      }
      return d;
    });
    onUpdateDiseases(updated);
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disease || !newKeywordInput.trim()) return;
    const trimmed = newKeywordInput.trim();
    if (disease.keywords.includes(trimmed)) return;

    const updated = diseases.map(d => {
      if (d.id === disease.id) {
        return { ...d, keywords: [...d.keywords, trimmed] };
      }
      return d;
    });
    onUpdateDiseases(updated);
    setNewKeywordInput("");
  };

  const handleRemoveKeyword = (keyword: string) => {
    if (!disease) return;
    const updated = diseases.map(d => {
      if (d.id === disease.id) {
        return { ...d, keywords: d.keywords.filter(k => k !== keyword) };
      }
      return d;
    });
    onUpdateDiseases(updated);
  };

  // Text selection change callback
  const handleTextSelectionCheck = () => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
      // Ensure it is a valid single keyword or term (not an entire page)
      if (text.length > 1 && text.length < 50) {
        setHighlightedText(text);
        setAiLookupResult(null); // Clear previous lookups
      }
    }
  };

  // Base64 file converting helpers
  const handleUploadedFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid Attachment: Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAnnotationImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadedFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadedFile(files[0]);
    }
  };

  // Store manual annotation with highlighted words
  const handleSaveAnnotation = () => {
    if (!disease || !highlightedText) return;

    const newAnn: Annotation = {
      id: `ann_${Date.now()}`,
      word: highlightedText,
      note: annotationNote.trim() || "Studying terminology.",
      imageUrl: annotationImageUrl || undefined,
      createdAt: new Date().toISOString()
    };

    // Update disease details
    const updated = diseases.map(d => {
      if (d.id === disease.id) {
        return {
          ...d,
          annotations: [...d.annotations, newAnn]
        };
      }
      return d;
    });

    onUpdateDiseases(updated);

    // Reset helper parameters
    setHighlightedText("");
    setAnnotationNote("");
    setAnnotationImageUrl("");
    setAiLookupResult(null);
  };

  const handleRemoveAnnotation = (annId: string) => {
    if (!disease) return;
    const updated = diseases.map(d => {
      if (d.id === disease.id) {
        return {
          ...d,
          annotations: d.annotations.filter(a => a.id !== annId)
        };
      }
      return d;
    });
    onUpdateDiseases(updated);
    if (viewingAnnotation?.id === annId) {
      setViewingAnnotation(null);
    }
  };

  // 1. API Integration: Gemini Medical term explanation lookup
  const handleGeminiTermLookup = async () => {
    if (!highlightedText) return;
    setIsAILookupLoading(true);
    setAiLookupResult(null);

    try {
      const response = await fetch("/api/gemini/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: highlightedText, diseaseContext: disease?.name })
      });
      const data = await response.json();
      setAiLookupResult(data);
      // Auto-populate annotation text with Gemini AI outcome
      setAnnotationNote(
        `AI DEFINITION:\n${data.definition}\n\nCLINICAL PREPARATION (STEP 2):\n${data.clinicalSignificance}`
      );
    } catch (e) {
      console.error("Gemini term lookup failed", e);
    } finally {
      setIsAILookupLoading(false);
    }
  };

  // 2. API Integration: Auto flashcards generation from sections
  const [isGeneratingDecks, setIsGeneratingDecks] = useState(false);
  const handleGeminiFlashcardDraft = async () => {
    if (!disease) return;
    setIsGeneratingDecks(true);

    try {
      const response = await fetch("/api/gemini/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diseaseName: disease.name,
          diagnosis: disease.diagnosis,
          treatment: disease.treatment,
          complications: disease.complications
        })
      });

      const data = await response.json();

      if (data.cards && Array.isArray(data.cards)) {
        // Build actual Flashcard formats
        const drafts: Flashcard[] = data.cards.map((c: any, index: number) => ({
          id: `fc_gen_${Date.now()}_${index}`,
          diseaseId: disease.id,
          subjectId: "s1", // auto-subject
          front: c.front,
          back: c.back,
          intervalDays: 1,
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewDate: new Date().toISOString()
        }));

        onUpdateFlashcards([...flashcards, ...drafts]);
        alert(`Success! Generated and added ${drafts.length} high-yield flashcards to your SRS deck.`);
      }
    } catch (e) {
      console.error(e);
      alert("Flashcard generation failed. Please specify details first.");
    } finally {
      setIsGeneratingDecks(false);
    }
  };

  // Custom text rendering showing custom wavy underline on annotated phrases
  const renderAnnotatedText = (text: string, annotations: Annotation[]) => {
    if (!text) return "";
    if (annotations.length === 0) return text;

    // Filter annotations for actual matches in current text
    const termMatches = annotations.filter(a => text.toLowerCase().includes(a.word.toLowerCase()));
    if (termMatches.length === 0) return text;

    // Sort by length desc to prevent substring issues
    termMatches.sort((a, b) => b.word.length - a.word.length);
    const escapedTerms = termMatches.map(t => t.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

    const parts = text.split(regex);
    return parts.map((part, index) => {
      const matched = termMatches.find(t => t.word.toLowerCase() === part.toLowerCase());
      if (matched) {
        return (
          <span
            key={`match-${index}`}
            id={`tag-${matched.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setViewingAnnotation(matched);
            }}
            className="cursor-pointer medical-term-underline font-semibold transition-all select-none text-teal-300 shadow-sm"
            title="Spaced Clinical Annotation (Click to inspect)"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Searching tree items
  const filteredDiseases = searchQuery
    ? diseases.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : diseases;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="notebook-layout-row" onMouseUp={handleTextSelectionCheck}>
      {/* A. Left Nav: Subject-Topic hierarchy browser tree panel with frosted filter */}
      <div className="md:col-span-4 frosted-glass shadow-xl rounded-2xl p-4 flex flex-col h-[750px]" id="tree-column">
        {/* Search bar */}
        <div className="flex bg-slate-950/45 rounded-lg px-2.5 py-2 items-center gap-1.5 border border-white/10 focus-within:border-teal-400 focus-within:bg-slate-950/65 transition-all mb-4" id="tree-search">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="notebookSearchInput"
            type="text"
            placeholder="Search diseases or keywords..."
            className="w-full text-xs bg-transparent outline-none text-slate-200 placeholder-slate-500 font-sans"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tree block */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3" id="tree-scroller">
          {searchQuery ? (
            <div className="space-y-1.5" id="flat-results animate">
              <span className="text-[10px] font-mono font-bold text-slate-400 block mb-2 uppercase tracking-widest">FOUND MEDICAL RECORDS</span>
              {filteredDiseases.length === 0 ? (
                <p className="text-xs text-slate-505 italic py-4 text-center">No disease matches. Check search spelling.</p>
              ) : (
                filteredDiseases.map(d => (
                  <button
                    key={d.id}
                    id={`search-res-${d.id}`}
                    onClick={() => onSelectDisease(d.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between border cursor-pointer ${
                      d.id === disease?.id ? "bg-white/15 border-white/25 text-white" : "bg-white/5 border-transparent text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="truncate">{d.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {d.isCompleted ? "✅ Completed" : "⏳ Active"}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            subjects.map(sub => {
              const subClosed = !expandedSubjects.includes(sub.id);
              return (
                <div key={sub.id} className="space-y-1" id={`tree-subject-${sub.id}`}>
                  {/* Subject trigger */}
                  <button
                    id={`btn-toggle-sub-${sub.id}`}
                    className="w-full flex items-center gap-1.5 text-xs font-bold font-sans text-slate-200 bg-white/5 p-2 rounded-lg hover:bg-white/10 hover:text-white text-left cursor-pointer transition-all border border-white/5"
                    onClick={() => toggleSubject(sub.id)}
                  >
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${!subClosed ? "rotate-90" : ""}`} />
                    <BookOpen className="w-4 h-4 text-slate-300" />
                    <span className="truncate flex-1">{sub.name}</span>
                  </button>

                  {/* Topic blocks inside Subject */}
                  {!subClosed && (
                    <div className="pl-3 space-y-2.5 mt-1 border-l border-slate-100 duration-200" id={`tree-topics-${sub.id}`}>
                      {topics
                        .filter(t => t.subjectId === sub.id)
                        .map(topic => {
                          const topicClosed = !expandedTopics.includes(topic.id);
                          return (
                            <div key={topic.id} className="space-y-1" id={`tree-topic-${topic.id}`}>
                              {/* Topic trigger */}
                              <button
                                id={`btn-toggle-topic-${topic.id}`}
                                className="w-full flex items-center gap-1 text-xs font-semibold font-sans text-slate-700 hover:text-indigo-600 text-left py-1"
                                onClick={() => toggleTopic(topic.id)}
                              >
                                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${!topicClosed ? "rotate-90" : ""}`} />
                                <span className="truncate">{topic.name}</span>
                              </button>

                              {/* Subtopics inside Topic */}
                              {!topicClosed && (
                                <div className="pl-3.5 space-y-2 border-l border-slate-100" id={`tree-subtopics-${topic.id}`}>
                                  {subtopics
                                    .filter(st => st.topicId === topic.id)
                                    .map(st => (
                                      <div key={st.id} className="space-y-1" id={`tree-subtop-${st.id}`}>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 block tracking-wide uppercase">{st.name}</span>
                                        {/* Diseases inside Subtopic */}
                                        <div className="space-y-0.5" id={`tree-diseases-${st.id}`}>
                                          {diseases
                                            .filter(d => d.subtopicId === st.id)
                                            .map(d => (
                                              <button
                                                key={d.id}
                                                id={`tree-disease-${d.id}`}
                                                onClick={() => onSelectDisease(d.id)}
                                                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                                  d.id === disease?.id
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-500/30 font-bold"
                                                    : "text-slate-300 hover:bg-white/5"
                                                }`}
                                              >
                                                <span className="truncate flex-1 pr-1">{d.name}</span>
                                                {d.isCompleted && (
                                                  <CheckCircle2 className={`w-3.5 h-3.5 ${d.id === disease?.id ? "text-white" : "text-teal-400 font-bold"}`} />
                                                )}
                                              </button>
                                            ))}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* B. Right: Detailed Diseases Workspace */}
      <div className="md:col-span-8 space-y-6" id="workspace-column">
        {disease ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[750px] flex flex-col justify-between shadow-2xl text-slate-100" id="workspace-card">
            {/* Header row details */}
            <div>
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4" id="workspace-header">
                <div>
                  <h1 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-2">
                    {disease.name}
                  </h1>
                  <span className="text-xs font-mono text-slate-400 block mt-1">
                    Pathological details, keywords, and active recall flashcard generation.
                  </span>
                </div>
                <div className="flex gap-2 animate-fade-in" id="workspace-actions">
                  <button
                    id="btn-toggle-complete"
                    onClick={handleToggleCompleted}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      disease.isCompleted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
                    }`}
                  >
                    {disease.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400 font-bold" /> : <Circle className="w-4 h-4" />}
                    {disease.isCompleted ? "Goal Completed" : "Mark Done"}
                  </button>
                  <button
                    id="btn-toggle-edit"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/15 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> {isEditing ? "Quit Edit" : "Edit Notes"}
                  </button>
                </div>
              </div>

              {/* Dynamic Text Selection Prompt Notification */}
              {highlightedText && (
                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 animate-fade-in mb-4" id="highlighter-toolbar">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs text-slate-200 font-semibold truncate max-w-sm">
                      Selected: <strong className="text-white block font-mono">"{highlightedText}"</strong>
                    </span>
                  </div>
                  <div className="flex gap-2" id="annotators-actions-flow">
                    <button
                      id="gemini-lookup-btn"
                      onClick={handleGeminiTermLookup}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold py-1 px-2.5 rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <BrainCircuit className="w-3 h-3 text-slate-950" /> Gemini definition
                    </button>
                    <button
                      id="save-ann-btn"
                      onClick={() => {
                        setAnnotationNote("");
                        setAnnotationImageUrl("");
                        setAiLookupResult(null);
                      }}
                      className="bg-slate-800 text-slate-200 py-1 px-2.5 rounded text-[11px] hover:bg-slate-700 hover:text-white cursor-pointer"
                    >
                      ➕ Create annotation
                    </button>
                    <button id="cancel-highlight-btn" onClick={() => setHighlightedText("")} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Active Selection / Image upload box */}
              {highlightedText && !isAILookupLoading && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 mb-4 text-xs shadow-inner animate-fade-in" id="annotation-inputs animate">
                  <div className="flex justify-between items-center" id="inputs-header">
                    <span className="font-bold text-slate-300">Write high-yield clinical note:</span>
                    <span className="text-[10px] text-slate-400 font-mono">Underlined highlighter displays on-the-fly</span>
                  </div>

                  {aiLookupResult && (
                    <div className="bg-white/5 p-3 rounded-lg border border-teal-500/20" id="gemini-lookup-outcome animate">
                      <span className="text-[9px] font-mono text-teal-400 font-bold block mb-1">GEMINI AI DEFINITION</span>
                      <p className="font-semibold block mb-1 text-white">{aiLookupResult.term}</p>
                      <p className="text-slate-300 text-[11px] leading-relaxed italic">{aiLookupResult.definition}</p>
                    </div>
                  )}

                  <textarea
                    id="annotationNoteInput"
                    rows={2}
                    placeholder="e.g., Explain why this represents the gold standard diagnostic step or associated Step 2 CK question types."
                    className="w-full bg-slate-950/45 border border-white/10 rounded-lg p-2 outline-none text-slate-200 placeholder-slate-500 focus:border-teal-400 focus:bg-slate-950/65"
                    value={annotationNote}
                    onChange={(e) => setAnnotationNote(e.target.value)}
                  />

                  {/* Image input support both Paste and Drag zone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="meta-images-row">
                    <div>
                      <label htmlFor="annotationImageUrlInput" className="block text-[10px] font-bold text-slate-400 mb-1">Paste Image URL:</label>
                      <input
                        id="annotationImageUrlInput"
                        type="text"
                        placeholder="https://image-url"
                        className="w-full bg-slate-950/45 border border-white/10 rounded-lg p-2 outline-none text-[11px] text-slate-200 placeholder-slate-500 focus:border-teal-400 focus:bg-slate-950/65"
                        value={annotationImageUrl}
                        onChange={(e) => setAnnotationImageUrl(e.target.value)}
                      />
                    </div>

                    {/* Drag and drop image dropzone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border border-dashed rounded-lg p-2 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        dragging ? "border-teal-400 bg-teal-400/10" : "border-white/10 bg-slate-950/45 hover:bg-slate-950/65"
                      }`}
                      onClick={() => document.getElementById("annotation-file-input")?.click()}
                    >
                      <input
                        id="annotation-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                      {annotationImageUrl ? (
                        <div className="flex items-center gap-1.5 text-xs text-teal-300 font-medium" id="attached-img-success">
                          <ImageIcon className="w-4 h-4" /> Selected base64 file
                          <button
                            id="remove-attached-img"
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setAnnotationImageUrl(""); }}
                            className="text-red-400 hover:text-red-300 ml-1 font-bold"
                          >
                            Reset
                          </button>
                        </div>
                      ) : (
                        <div className="text-slate-400 group flex flex-col items-center" id="drag-drop-instruction">
                          <Upload className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] block">Drag image file or click to select</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2" id="draft-actions">
                    <button
                      id="save-final-annotation-btn"
                      onClick={handleSaveAnnotation}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold py-1.5 px-3.5 rounded-lg text-xs cursor-pointer shadow-md shadow-teal-500/10"
                    >
                      Process & Annotate
                    </button>
                  </div>
                </div>
              )}

              {/* Loader during Gemini API query */}
              {isAILookupLoading && (
                <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20 flex flex-col items-center justify-center space-y-2 mb-4 animate-pulse" id="ai-fetching-loader">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  <p className="text-xs font-mono font-medium text-blue-300">Gemini is searching Step 2 CK high-yield indices for definitions...</p>
                </div>
              )}

              {/* Disease Data Scrollable Worksheets */}
              <div className="flex-1 overflow-y-auto pr-1 h-[450px] space-y-4" id="disease-scroller">
                {isEditing ? (
                  <div className="space-y-4 text-xs" id="edit-mode-form">
                    <div id="edit-diag-wrapper">
                      <label htmlFor="editedDiagnosisInput" className="block font-bold text-slate-300 mb-1 leading-tight">1. DIAGNOSIS (Classic Presentation & Evaluation):</label>
                      <textarea
                        id="editedDiagnosisInput"
                        rows={3}
                        className="w-full bg-slate-950/45 border border-white/10 rounded-lg p-2.5 outline-none font-sans text-xs focus:bg-slate-950/65 focus:border-blue-400 text-slate-200"
                        value={editedDiagnosis}
                        onChange={(e) => setEditedDiagnosis(e.target.value)}
                      />
                    </div>

                    <div id="edit-treat-wrapper">
                      <label htmlFor="editedTreatmentInput" className="block font-bold text-slate-300 mb-1 leading-tight">2. TREATMENT (First Line & Acute Management):</label>
                      <textarea
                        id="editedTreatmentInput"
                        rows={3}
                        className="w-full bg-slate-950/45 border border-white/10 rounded-lg p-2.5 outline-none font-sans text-xs focus:bg-slate-950/65 focus:border-blue-400 text-slate-200"
                        value={editedTreatment}
                        onChange={(e) => setEditedTreatment(e.target.value)}
                      />
                    </div>

                    <div id="edit-compl-wrapper">
                      <label htmlFor="editedComplicationsInput" className="block font-bold text-slate-300 mb-1 leading-tight">3. COMPLICATIONS & PROGNOSIS:</label>
                      <textarea
                        id="editedComplicationsInput"
                        rows={3}
                        className="w-full bg-slate-950/45 border border-white/10 rounded-lg p-2.5 outline-none font-sans text-xs focus:bg-slate-950/65 focus:border-blue-400 text-slate-200"
                        value={editedComplications}
                        onChange={(e) => setEditedComplications(e.target.value)}
                      />
                    </div>

                    <div id="edit-notes-wrapper">
                      <label htmlFor="editedNotesInput" className="block font-bold text-slate-300 mb-1 leading-tight">4. SPECIAL CLINICAL ASSOCIATION NOTES & MNEMONICS:</label>
                      <textarea
                        id="editedNotesInput"
                        rows={3}
                        className="w-full bg-slate-950/45 border border-white/10 rounded-lg p-2.5 outline-none font-sans text-xs focus:bg-slate-950/65 focus:border-blue-400 text-slate-200"
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                      />
                    </div>

                    <button
                      id="save-changes-btn"
                      onClick={handleSaveEdits}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg py-2.5 text-xs cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      Save Clinical Notebook Updates
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-slate-200" id="view-mode-details">
                    {/* Diagnosis box */}
                    <div className="border border-white/5 bg-white/5 p-4 rounded-xl" id="view-diag">
                      <h3 className="text-xs font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wide">1. Diagnosis & Clinical Criteria</h3>
                      <div className="font-sans text-xs leading-relaxed whitespace-pre-line text-slate-200">
                        {renderAnnotatedText(disease.diagnosis, disease.annotations)}
                      </div>
                    </div>

                    {/* Treatment box */}
                    <div className="border border-white/5 bg-white/5 p-4 rounded-xl" id="view-treatment">
                      <h3 className="text-xs font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wide">2. Treatment & Medical Management</h3>
                      <div className="font-sans text-xs leading-relaxed whitespace-pre-line text-slate-200">
                        {renderAnnotatedText(disease.treatment, disease.annotations)}
                      </div>
                    </div>

                    {/* Complications box */}
                    <div className="border border-white/5 bg-white/5 p-4 rounded-xl" id="view-compl">
                      <h3 className="text-xs font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wide">3. Traps, Complications & Prognosis</h3>
                      <div className="font-sans text-xs leading-relaxed whitespace-pre-line text-slate-200">
                        {renderAnnotatedText(disease.complications, disease.annotations)}
                      </div>
                    </div>

                    {/* Mnemonic notes list */}
                    <div className="border border-blue-500/10 bg-blue-500/5 p-4 rounded-xl" id="view-association-notes">
                      <h3 className="text-xs font-mono font-bold text-indigo-400 block mb-2 uppercase tracking-wide">4. High-Yield Associations & Notes</h3>
                      <div className="font-sans text-xs leading-relaxed whitespace-pre-line italic text-slate-200">
                        {renderAnnotatedText(disease.notes, disease.annotations)}
                      </div>
                    </div>

                    {/* Keywords panel */}
                    <div className="border border-white/5 bg-white/5 p-4 rounded-xl" id="view-keywords">
                      <h3 className="text-xs font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wide">Disease Core Keywords</h3>
                      <form onSubmit={handleAddKeyword} className="flex gap-2 mb-3" id="add-keyword-form">
                        <input
                          id="newKeywordInput"
                          type="text"
                          placeholder="Add new high-yield keyword"
                          className="flex-1 bg-slate-950/45 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-teal-400 text-slate-200"
                          value={newKeywordInput}
                          onChange={(e) => setNewKeywordInput(e.target.value)}
                        />
                        <button
                          id="submit-keyword"
                          type="submit"
                          className="bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs px-3 font-extrabold cursor-pointer"
                        >
                          Add
                        </button>
                      </form>

                      <div className="flex flex-wrap gap-1.5" id="keywords-list-flex">
                        {disease.keywords.length === 0 ? (
                          <span className="text-xs text-slate-500 font-sans italic">No custom keywords logged yet. Add some to search later!</span>
                        ) : (
                          disease.keywords.map((word, ix) => (
                            <span
                              key={word + ix}
                              className="bg-white/10 text-slate-200 font-medium rounded-md px-2 py-1 text-xs flex items-center gap-1 hover:bg-white/15 transition-all select-none border border-white/5"
                              id={`keyword-badge-${word}`}
                            >
                              <span>{word}</span>
                              <button
                                id={`remove-keyword-btn-${word}`}
                                type="button"
                                onClick={() => handleRemoveKeyword(word)}
                                className="text-slate-400 hover:text-red-400 font-bold ml-1 cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Row (SRS deck auto drafts) */}
            {!isEditing && (
              <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-white/5" id="bottom-srs-actions">
                <span className="text-slate-400 font-sans font-medium">Spaced Flashcards queue count: {flashcards.filter(f => f.diseaseId === disease.id).length} cards</span>
                <button
                  id="gemini-draft-fc-btn"
                  onClick={handleGeminiFlashcardDraft}
                  disabled={isGeneratingDecks}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all outline-none cursor-pointer shadow-md shadow-teal-500/10"
                >
                  {isGeneratingDecks ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      Drafting Flashcards...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse text-slate-950 fill-white" />
                      Gemini: Auto-Draft active flashcards
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl h-96 flex items-center justify-center border border-dashed border-white/10" id="notebook-empty">
            <p className="text-slate-500 italic">No disease card active. Highlight tree element to view.</p>
          </div>
        )}
      </div>

      {/* C. Popup Modals: Detailed slide/box showing custom annotations clicked */}
      {viewingAnnotation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4" id="annotation-overlay">
          <div className="frosted-glass-heavy rounded-2xl p-6 max-w-lg w-full max-h-[90%] overflow-y-auto shadow-2xl border border-white/15 animate-slide-up flex flex-col justify-between text-slate-200" id="annotation-overlay-card">
            <div>
              <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-4" id="overlay-header">
                <div>
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Interactive Medical Annotation</h4>
                  <span className="text-lg font-sans font-black text-white mt-1 block">"{viewingAnnotation.word}"</span>
                </div>
                <button
                  id="close-overlay-btn"
                  onClick={() => setViewingAnnotation(null)}
                  className="text-slate-400 hover:text-white outline-none cursor-pointer"
                >
                  <X className="w-5 h-5 font-bold" />
                </button>
              </div>

              {/* Annotation description info */}
              <div className="space-y-4 text-sm leading-relaxed text-slate-200" id="overlay-details">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 whitespace-pre-line text-slate-200 text-xs shadow-inner" id="overlay-note">
                  {viewingAnnotation.note}
                </div>

                {/* Annotation base64 image or url */}
                {viewingAnnotation.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/40 p-2 max-h-72 flex justify-center items-center shadow-lg" id="overlay-img-wrapper">
                    <img
                      src={viewingAnnotation.imageUrl}
                      alt={`Clinical graphic for ${viewingAnnotation.word}`}
                      className="max-w-full max-h-full object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10 text-xs" id="overlay-footer">
              <span className="text-slate-400 font-mono">Created: {viewingAnnotation.createdAt.split("T")[0]}</span>
              <button
                id="delete-ann-item-btn"
                onClick={() => handleRemoveAnnotation(viewingAnnotation.id)}
                className="text-red-400 hover:text-red-300 font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete Highlight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

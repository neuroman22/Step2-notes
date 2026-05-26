export interface Annotation {
  id: string;
  word: string;
  note: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Disease {
  id: string;
  name: string;
  subtopicId: string;
  diagnosis: string;
  treatment: string;
  complications: string;
  notes: string;
  keywords: string[];
  annotations: Annotation[];
  isCompleted: boolean;
}

export interface Subtopic {
  id: string;
  name: string;
  topicId: string;
  diseaseIds: string[];
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  subtopicIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  topicIds: string[];
}

export interface Flashcard {
  id: string;
  diseaseId: string;
  subjectId: string;
  front: string;
  back: string;
  intervalDays: number; // SRS interval
  easeFactor: number;   // SRS ease factor modifier
  repetitions: number;  // SRS consecutive successful reviews
  nextReviewDate: string; // ISO String (UTC)
}

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  diseaseId?: string; // Optional links to disease study
  notes?: string;
}

export interface ExamRecord {
  id: string;
  type: 'CMS' | 'NBME';
  name: string; // e.g. "NBME Form 11", "Pediatrics Form 1"
  subject: string; // Medicine, Surgery, OBGYN, Peds, Psych, FM, etc.
  score: number; // e.g. score out of 290 or scale score (e.g. 245) or percent correct (0-100)
  date: string; // YYYY-MM-DD
  targetScore?: number;
  incorrectTopics?: string[]; // missed keywords/topics
  notes?: string;
}

export interface LookupResult {
  term: string;
  definition: string;
  clinicalSignificance: string;
  keyAssociations: string[];
  suggestedFlashcards?: { front: string; back: string }[];
}

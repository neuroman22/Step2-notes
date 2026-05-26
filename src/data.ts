import { Subject, Topic, Subtopic, Disease, Flashcard, Task, ExamRecord } from "./types";

// High-Yield Seed Data representing real USMLE Step 2 CK study structures
export const INITIAL_SUBJECTS: Subject[] = [
  { id: "s1", name: "Internal Medicine", topicIds: ["t1", "t2"] },
  { id: "s2", name: "Pediatrics", topicIds: ["t3"] },
  { id: "s3", name: "Obstetrics & Gynecology", topicIds: ["t4"] },
  { id: "s4", name: "Surgery", topicIds: ["t5"] }
];

export const INITIAL_TOPICS: Topic[] = [
  { id: "t1", name: "Cardiology", subjectId: "s1", subtopicIds: ["st1", "st2"] },
  { id: "t2", name: "Infectious Disease", subjectId: "s1", subtopicIds: ["st3"] },
  { id: "t3", name: "Neonatology", subjectId: "s2", subtopicIds: ["st4"] },
  { id: "t4", name: "Gynecologic Oncology", subjectId: "s3", subtopicIds: ["st5"] },
  { id: "t5", name: "Trauma Surgery", subjectId: "s4", subtopicIds: ["st6"] }
];

export const INITIAL_SUBTOPICS: Subtopic[] = [
  { id: "st1", name: "Valvular Heart Diseases", topicId: "t1", diseaseIds: ["d1"] },
  { id: "st2", name: "Aortic Syndromes", topicId: "t1", diseaseIds: ["d2"] },
  { id: "st3", name: "Bacterial Pneumonia", topicId: "t2", diseaseIds: ["d3"] },
  { id: "st4", name: "Respiratory Distress", topicId: "t3", diseaseIds: ["d4"] },
  { id: "st5", name: "Cervical Pathology", topicId: "t4", diseaseIds: ["d5"] },
  { id: "st6", name: "Abdominal Trauma", topicId: "t5", diseaseIds: ["d6"] }
];

export const INITIAL_DISEASES: Disease[] = [
  {
    id: "d1",
    name: "Infective Endocarditis",
    subtopicId: "st1",
    diagnosis: "Diagnose using Duke Criteria (2 major, or 1 major + 3 minor, or 5 minor criteria).\n\nMajor Criteria:\n- Positive blood cultures (2 separate cultures for typical bacteria like S. aureus or S. viridans).\n- Echocardiographic evidence (new valvular regurgitation, vegetation, or abscess on TTE or TEE - TEE is most accurate!).\n\nMinor Criteria:\n- Predisposition (IV drug use, prosthetic valve, or valvular disease).\n- Fever (>38°C/100.4°F).\n- Vascular phenomena (Janeway lesions, Mycotic aneurysm, arterial emboli).\n- Immunological phenomena (Roth spots, Osler nodes, Glomerulonephritis, positive Rheumatoid factor).\n\nAlways order blood cultures before starting antibiotics!",
    treatment: "Empiric treatment depends on valve status:\n- Native valve: IV Vancomycin (covers MRSA) + Ampicillin/sulbactam or Ceftriaxone.\n- Prosthetic valve (<1 yr since surgery): IV Vancomycin + Gentamicin + Rifampin.\n\nOnce culture isolates the organism, narrow therapy (e.g., Penicillin G or Ceftriaxone for S. viridans). Duration is typically 4-6 weeks.\n\nSurgical indications include: heart failure, persistent bacteremia despite treatment, fungal etiology, or large vegetations (>10mm) with embolic potential.",
    complications: "- Acute Heart Failure (most common cause of death, secondary to severe valvular regurgitation).\n- Septic embolization (leading to stroke, splenic infarct, or renal infarct).\n- Atrioventricular block (prolonged PR interval, typically signals a perivalvular ring abscess, usually aortic).\n- Glomerulonephritis (secondary to immune complex deposition).",
    notes: "High yield associations: S. bovis (S. gallolyticus) endocarditis is highly associated with underlying colorectal cancer. Always order a colonoscopy if S. bovis is isolated! Culture-negative endocarditis are often due to HACEK organisms (Haemophilus, Aggregatibacter, Cardiobacterium, Eikenella, Kingella) and Coxiella burnetii.",
    keywords: ["Duke Criteria", "TEE", "Janeway lesions", "Osler nodes", "S. bovis", "HACEK", "Valvular Regurgit", "Aortic Abscess"],
    annotations: [
      {
        id: "a1",
        word: "TEE",
        note: "Transesophageal Echocardiography is the most sensitive test to evaluate for vegetations and valvular abscesses (90%+ sensitive vs ~60% for TTE). Use first in prosthetic valves or when suspicion is high despite a negative TTE.",
        createdAt: "2026-05-26T21:25:00Z"
      },
      {
        id: "a2",
        word: "S. bovis",
        note: "Also known as Streptococcus gallolyticus. Crucial Step 2 correlation: always order colonoscopy next because of high association with colon malignancies/polyps.",
        createdAt: "2026-05-26T21:25:00Z"
      }
    ],
    isCompleted: true
  },
  {
    id: "d2",
    name: "Aortic Dissection",
    subtopicId: "st2",
    diagnosis: "Clinical Presentation: Sudden onset, tearing chest pain radiating to the back. Unequal blood pressure in arms (>20 mmHg difference). \n- Best initial test: Chest X-ray (reveals a widened mediastinum).\n- Gold standard / Best diagnostic test (hemodynamically stable): CT Angiography (CTA).\n- Hemodynamically unstable: Transesophageal Echocardiography (TEE) at the bedside in the ICU or OR.",
    treatment: "Depends on Stanford classification:\n- Stanford Type A (involves ascending aorta): Emergency Surgical Repair immediately + medical control.\n- Stanford Type B (descending aorta only): Medical management is first-line. Use IV Beta-blockers (such as Labetalol or Esmolol) to control blood pressure (target SBP 100-120 mmHg) and heart rate (target HR < 60 bpm). Ensure you lower the heart rate BEFORE giving vasodilators like nitroprusside to avoid reflex tachycardia, which increases shear stress on the dissection fold.",
    complications: "- Retrograde tear into coronary ostia causes acute myocardial infarction (usually RCA, leading to inferior STEMI).\n- Rupture into the pericardial sac leading to cardiac tamponade (beck triad: hypotension, JVD, muffled heart sounds).\n- Aortic regurgitation (new diastolic murmur) due to leaflet displacement.\n- Stroke or visceral ischemia (renal failure, bowel ischemia) due to branch arterial compromise.",
    notes: "Frequently associated with chronic severe hypertension (most common risk factor) and connective tissue disorders (Marfan syndrome, Ehlers-Danlos - especially in young patients). Pre-existing aortic aneurysms and bicuspid aortic valves also increase risk.",
    keywords: ["Tearing chest pain", "Widened mediastinum", "Labetalol", "Type A vs B", "Cardiac tamponade", "CT Angiography", "Asymmetric BP"],
    annotations: [],
    isCompleted: false
  },
  {
    id: "d3",
    name: "Community-Acquired Pneumonia",
    subtopicId: "st3",
    diagnosis: "Presents with fever, productive cough, pleuritic chest pain, and dyspnea. Physical exam reveals crackles, bronchial breath sounds, increased tactile fremitus, and dullness to percussion.\n- Best initial test: Chest X-ray (lobar infiltration, interstitial infiltrates, or bronchopneumonia pattern).\n- Assessment of Severity: Use CURB-65 criteria to decide inpatient vs outpatient care (Confusion, Urea >19, RR >= 30, BP SBP <90 or DBP <=60, Age >= 65).\n  - Score 0-1: Outpatient.\n  - Score 2: Inpatient medical ward.\n  - Score >=3: ICU assessment.",
    treatment: "Antibiotic Selection:\n- Healthy Outpatient: Amoxicillin, Doxycycline, or Macrolide (azithromycin).\n- Outpatient with Comorbidities: Respiratory fluoroquinolone (Levofloxacin, Moxifloxacin) OR Beta-lactam + Macrolide.\n- Inpatient Ward: IV Beta-lactam (Ceftriaxone) + Macrolide (Azithromycin) OR IV respiratory fluoroquinolone.\n- ICU: Ceftriaxone + Azithromycin OR Ceftriaxone + Fluoroquinolone (may add Linezolid/Vancomycin if MRSA suspected).",
    complications: "- Parapneumonic pleural effusion (simple vs complicated vs empyema - characterized by pH < 7.2, glucose < 60, high LDH. Requires chest tube drainage!).\n- Lung abscess (commonly S. aureus, Klebsiella, or anaerobes in aspiration risk).\n- ARDS (Acute Respiratory Distress Syndrome).\n- Sepsis and respiratory failure.",
    notes: "S. pneumoniae is the #1 cause overall. Mycoplasma pneumoniae presents as 'atypical' or 'walking' pneumonia in young adults, associated with bullous myringitis and cold agglutinins (IgM). Legionella pneumophila is associated with contaminated water systems, gastrointestinal symptoms (diarrhea), and hyponatremia.",
    keywords: ["CURB-65", "Parapneumonic effusion", "Walking pneumonia", "Mycoplasma", "Legionella", "Cold agglutinins", "Hyponatremia"],
    annotations: [],
    isCompleted: false
  },
  {
    id: "d4",
    name: "Respiratory Distress Syndrome (Neonatal)",
    subtopicId: "st4",
    diagnosis: "Due to surfactant deficiency, leading to alveolar collapse and diffuse atelectasis. Seen in premature infants.\n- Presentation: Grunting, nasal flaring, tachypnea, and chest retractions immediately after birth.\n- Diagnostic: Chest X-ray shows diffuse 'ground-glass' appearance with air bronchograms and low lung volumes.",
    treatment: "Prevention: Antenatal corticosteroids (such as Betamethasone) given to mothers at risk for preterm delivery between 24 and 34 weeks gestation to accelerate lung maturity.\n\nManagement:\n- Best initial: Bubble CPAP (continuous positive airway pressure).\n- If failing CPAP or severe respiratory failure: Endotracheal intubation and direct administration of Exogenous Surfactant. Maintain oxygenation but avoid excessive toxicity to reduce complications.",
    complications: "- Bronchopulmonary Dysplasia (BPD) secondary to prolonged mechanical ventilation and high fraction of inspired oxygen.\n- Retinopathy of Prematurity (ROP) due to hyperoxia inducing retinal vessel proliferation.\n- Intraventricular hemorrhage (IVH).\n- Patent Ductus Arteriosus (PDA) due to persistent hypoxia.",
    notes: "Risk is increased by maternal diabetes (hyperinsulinemia in the fetus blocks cortisol-induced surfactant synthesis). Risk is decreased by maternal hypertension/IUGR due to stress-induced accelerated lung maturation.",
    keywords: ["Surfactant", "Ground-glass", "Air bronchograms", "Betamethasone", "BPD", "Hyperoxia", "Maternal diabetes"],
    annotations: [],
    isCompleted: false
  },
  {
    id: "d5",
    name: "Cervical Cancer",
    subtopicId: "st5",
    diagnosis: "Presents with postcoital bleeding, spotting, or malodorous vaginal discharge. Associated with high-risk HPV types (16, 18, 31, 33).\n- Screening: Pap smear cytology +/- HPV co-testing starting at age 21.\n- Diagnosis: If screening is abnormal, follow-up colposcopy with biopsy of suspicious vascular loops (acetic acid application turns abnormal cells white - 'acetowhite changes').\n- Diagnostic staging is clinical, involving physical examination, pelvic exam, and CT/MRI.",
    treatment: "Staging-directed therapy:\n- Microinvasive (Stage IA1): Simple hysterectomy or cone biopsy (if fertility desired).\n- Invasive localized (Stage IB to IIA): Radical hysterectomy or primary chemoradiotherapy (Cisplatin + Radiation).\n- Advanced (Stage IIB and higher, characterized by pelvic sidewall or parametrial involvement): ALWAYS treat with Primary Chemoradiotherapy (Cisplatin + Brachytherapy + External Beam Radiation). Surgery is NOT indicated for Stage IIB or later!",
    complications: "- Hydronephrosis and Renal Failure (most common cause of death, due to tumor compressing the ureters).\n- Rectovaginal or Vesicovaginal fistulas.\n- Severe vaginal bleeding.\n- Pelvic pain due to lumbosacral plexus encroachment.",
    notes: "Cervical cancer is an AIDS-defining illness under CDC definitions. HPV produces E6 (blocks tumor suppressor protein p53) and E7 (inhibits Rb protein), facilitating dysregulated host cells cycle progression.",
    keywords: ["HPV 16 and 18", "Colposcopy", "Acetowhite", "Stage IIB Parametrial", "Hydronephrosis", "E6 and E7", "Cisplatin"],
    annotations: [],
    isCompleted: false
  },
  {
    id: "d6",
    name: "Splenic Rupture",
    subtopicId: "st6",
    diagnosis: "Classic presentation: Blunt abdominal trauma (e.g., motor vehicle crash or sports) followed by left upper quadrant (LUQ) abdominal pain and left shoulder pain (Kehr sign, due to diaphragmatic irritation).\n- Best initial evaluation: FAST exam (Focused Assessment with Sonography for Trauma) at the bedside.\n  - If FAST is positive and patient is HEMODYNAMICALLY UNSTABLE: Urgent exploratory laparotomy.\n  - If FAST is positive/unclear and patient is HEMODYNAMICALLY STABLE: Abdominal CT scan with IV contrast (allows precise grading of splenic laceration).",
    treatment: "- Hemodynamically Stable (Grades I-III Lacerations): Conservative management is preferred. Admit to ICU, monitor serial hemoglobin, strict bed rest. Embolization of splenic artery can be performed if active contrast extravasation is visible on CT.\n- Hemodynamically Unstable or Grade IV-V: Splenectomy or surgical repair. \n\nPost-splenectomy immunization: Spleen is a secondary lymphoid organ crucial for clearing encapsulated bacteria. Vaccine triad must be given at least 14 days post-op: pneumococcus, meningococcus, and Haemophilus influenzae type B (HiB), plus daily prophylactic oral penicillin in children.",
    complications: "- Overwhelming Post-Splenectomy Infection (OPSI) - highly lethal sepsis with Streptococcus pneumoniae, Neisseria meningitidis, or Hemophilus influenzae.\n- Delayed splenic hemorrhage (occurs within weeks of injury due to subcapsular hematoma rupture).\n- Postoperative thrombocytosis (transient rise in platelets up to 1 million/uL, usually responsive to aspirin if symptomatic).\n- Left pleural effusion or subphrenic abscess.",
    notes: "Patients with Mononucleosis (EBV infection) are at massive risk of splenic rupture from minimal or no trauma. They must avoid contact sports for a minimum of 3-4 weeks from symptom onset or until splenomegaly resolves.",
    keywords: ["FAST exam", "Kehr sign", "Laparotomy vs CT", "Encapsulated bacter", "OPSI vaccine triad", "Epstein-Barr mononu", "Serial hemoglobin"],
    annotations: [],
    isCompleted: false
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "f1",
    diseaseId: "d1",
    subjectId: "s1",
    front: "What is the most accurate test to evaluate for valvular vegetations and perivalvular abscesses in Infective Endocarditis?",
    back: "Transesophageal Echocardiography (TEE). It enjoys 90%+ sensitivity and is much more accurate than a TTE, especially for prosthetic valves or looking for ring abscesses.",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "f2",
    diseaseId: "d1",
    subjectId: "s1",
    front: "Isolation of which organism in Infective Endocarditis mandates an immediate colonoscopy?",
    back: "Streptococcus bovis (specifically Streptococcus gallolyticus), due to its strong clinical correlation with colorectal adenomas and carcinomas.",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "f3",
    diseaseId: "d2",
    subjectId: "s1",
    front: "What is the immediate management strategy for a Stanford Type B Descending Aortic Dissection?",
    back: "First-line is medical management with IV Beta-blockers (e.g., Labetalol) to control systolic blood pressure (target 100-120 mmHg) and heart rate (target < 60 bpm) to reduce shear stress. Surgery is reserved for complications.",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "f4",
    diseaseId: "d5",
    subjectId: "s3",
    front: "In Cervical Cancer, what is the key dividing line between surgical management and primary radiation therapy?",
    back: "Stage IIB or higher (evidence of parametrial involvement or extension to pelvic sidewall). From Stage IIB onwards, primary chemoradiation (+ cisplatin) is required; surgery is contraindicated.",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "f5",
    diseaseId: "d6",
    subjectId: "s4",
    front: "What immunological vaccine bundle must be administered to clinical patients undergoing asplenia, and when?",
    back: "Vaccines against Streptococcus pneumoniae, Neisseria meningitidis, and Haemophilus influenzae type B (HiB). Administered ideally 14+ days after splenectomy to allow full immune response.",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  }
];

export const INITIAL_TASKS: Task[] = [
  { id: "tk1", title: "Review Valvular Cardiac Murmurs", date: new Date().toISOString().split("T")[0], completed: true },
  { id: "tk2", title: "Complete OBGYN screening guidelines (Pap, Mammogram)", date: new Date().toISOString().split("T")[0], completed: false, diseaseId: "d5" },
  { id: "tk3", title: "Study neonatal respiratory distress criteria with air bronchograms", date: new Date(Date.now() + 86400000).toISOString().split("T")[0], completed: false, diseaseId: "d4" },
  { id: "tk4", title: "Read Splenic Injury grading & OPSI vaccine timing", date: new Date(Date.now() + 172800000).toISOString().split("T")[0], completed: false, diseaseId: "d6" }
];

export const INITIAL_EXAMS: ExamRecord[] = [
  { id: "ex1", type: "CMS", name: "Medicine Form 8", subject: "Medicine", score: 82, date: "2026-05-10" },
  { id: "ex2", type: "CMS", name: "Pediatrics Form 6", subject: "Pediatrics", score: 76, date: "2026-05-14" },
  { id: "ex3", type: "CMS", name: "OBGYN Form 5", subject: "OBGYN", score: 85, date: "2026-05-18" },
  { id: "ex4", type: "NBME", name: "NBME Form 9", subject: "Step 2 CK", score: 232, date: "2026-05-02", targetScore: 250 },
  { id: "ex5", type: "NBME", name: "NBME Form 11", subject: "Step 2 CK", score: 244, date: "2026-05-16", targetScore: 250, incorrectTopics: ["Infectious Endocarditis", "Stanford Type A dissections", "Cervical cancer stage IIB"] },
  { id: "ex6", type: "NBME", name: "NBME Form 12", subject: "Step 2 CK", score: 251, date: "2026-05-24", targetScore: 252, incorrectTopics: ["Aortic Regurgitation murmurs", "FAST positive laparotomy", "CURB-65 pneumonia"] }
];

// Helper functions for persistent LocalStorage
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`med_study_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error("Failed to load state for", key, e);
    return defaultValue;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`med_study_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save state for", key, e);
  }
}

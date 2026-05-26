import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured or is default placeholder.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Quick Medical term lookup
app.post("/api/gemini/lookup", async (req, res) => {
  try {
    const { term, diseaseContext } = req.body;
    if (!term || typeof term !== "string") {
      res.status(400).json({ error: "No query term specified." });
      return;
    }

    let ai;
    try {
      ai = getGenAI();
    } catch (err: any) {
      // Graceful degraded mode when API Key is missing or default
      res.json({
        term,
        definition: `Defined offline (API Key not fully set up yet): Medical lookup for "${term}".`,
        clinicalSignificance: "Configure your GEMINI_API_KEY in the Settings > Secrets section of Google AI Studio for production-grade contextual definitions and smart high-yield association graphs.",
        keyAssociations: ["Check Step 2 CK Prep Guidelines", "Configure GEMINI_API_KEY", "Verify local medical studies"],
        offline: true
      });
      return;
    }

    const contextPrompt = diseaseContext ? ` This term is highlight/used in the context of the disease "${diseaseContext}".` : "";
    const prompt = `Provide a premium, high-yield clinical lookup for the medical term: "${term}".${contextPrompt} Create an objective definition, clinical significance for exam preparation (USMLE/NBME-focused), and key clinical associations. Ensure the content is accurate and strictly professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite USMLE Step 2 CK expert clinical instructor. Your explanations are concise, high-yield, accurate, and structured perfectly for active recall.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING },
            clinicalSignificance: { type: Type.STRING },
            keyAssociations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["term", "definition", "clinicalSignificance", "keyAssociations"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("Gemini lookup failed:", error);
    res.status(500).json({ error: error.message || "An error occurred during lookups." });
  }
});

// 2. API: Generate intelligent flashcards from disease sections
app.post("/api/gemini/generate-cards", async (req, res) => {
  try {
    const { diseaseName, diagnosis, treatment, complications } = req.body;
    if (!diseaseName) {
      res.status(400).json({ error: "Missing disease name." });
      return;
    }

    let ai;
    try {
      ai = getGenAI();
    } catch (err: any) {
      // Degraded card generation when API Key is missing
      res.json({
        cards: [
          {
            front: `What is the primary diagnostic approach for ${diseaseName}?`,
            back: diagnosis ? `Based on notes: ${diagnosis.slice(0, 100)}...` : `Standard evaluation for ${diseaseName}.`
          },
          {
            front: `What constitutes the first-line treatment for ${diseaseName}?`,
            back: treatment ? `Based on notes: ${treatment.slice(0, 100)}...` : `Standard management for ${diseaseName}.`
          }
        ],
        offline: true
      });
      return;
    }

    const prompt = `Based on the following medical notes for the disease "${diseaseName}", generate 3-4 high-yield active recall flashcards perfect for Anki review (Step 2 CK focus). Create diverse cards asking about classic presentation/best initial test/most accurate test/first-line treatment or unique complications.
DIAGNOSIS DETAILS:
${diagnosis || "Not specified."}
TREATMENT DETAILS:
${treatment || "Not specified."}
COMPLICATIONS DETAILS:
${complications || "Not specified."}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a Step 2 CK medical tutor. Write active recall flashcards in a question/answer format. Front should be a highly directed question (e.g. \"Best initial test for...\") and Back must be brief and strictly accurate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["front", "back"]
              }
            }
          },
          required: ["cards"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response received from card generator.");
    }

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("Gemini card generation failed:", error);
    res.status(500).json({ error: error.message || "An error occurred during card generation." });
  }
});

// Initialize Vite and server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Medical Notebook backend active at http://localhost:${PORT}`);
  });
}

startServer();

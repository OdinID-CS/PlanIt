import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get Gemini Client lazily and safely on each request
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Generate Study/Project Plan Endpoint
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { goal, timeframe, timeframeUnit, intensity, knowledgeLevel, learningStyle } = req.body;

    if (!goal || !timeframe) {
      return res.status(400).json({ error: "Goal and timeframe are required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are PlanIt, an elite educational psychologist and agile project manager. Your job is to generate a highly detailed, extremely practical, and realistic day-by-day action plan for a student or professional attempting to achieve a learning goal or complete a project.
Strictly adhere to the user's parameters:
- Goal: ${goal}
- Timeframe: ${timeframe} ${timeframeUnit || "days"}
- Study pace/Intensity: ${intensity || "Moderate"}
- Prior knowledge level: ${knowledgeLevel || "Beginner"}
- Preferred learning style: ${learningStyle || "Balanced"}

Break down the objective into actionable, bite-sized tasks for EACH individual day in the timeframe. Make sure tasks are concrete, specific, and reference realistic learning activities. Do not write generic or repetitive instructions. Design suggested search terms/topics for resources. Ensure the tone is motivating and encouraging!`;

    const prompt = `Create a custom day-by-day planner for: "${goal}".
Duration: ${timeframe} ${timeframeUnit || "days"}
Intensity level: ${intensity}
Prior experience: ${knowledgeLevel}
Learning style preference: ${learningStyle}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy, motivating title for the generated plan." },
            summary: { type: Type.STRING, description: "A highly motivating brief 2-3 sentence overview explaining why this plan is optimized for the user's specific goals and timeline." },
            intensity: { type: Type.STRING, description: "Description of the study pace and expected total hour investment, e.g., 'Intensive (4-5 hours/day, 20 total hours)'" },
            milestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-4 high-level major milestones for this plan."
            },
            days: {
              type: Type.ARRAY,
              description: "Detailed day-by-day breakdown of the plan.",
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER, description: "The sequential day number starting from 1." },
                  dayTitle: { type: Type.STRING, description: "The theme or main focus of the day, e.g., 'Limits and Continuity Basics'" },
                  focus: { type: Type.STRING, description: "A quick summary of the learning objective for this day." },
                  estimatedTime: { type: Type.STRING, description: "Expected time investment, e.g., '3 hours' or '1.5 hours'." },
                  tasks: {
                    type: Type.ARRAY,
                    description: "Actionable, concrete study tasks for the user to execute.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, description: "Short title of the task." },
                        description: { type: Type.STRING, description: "A detailed description of exactly what to do, what to practice, or what to build." },
                        resources: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "Suggested resource titles or specific YouTube/Google search queries, e.g., 'Khan Academy Introduction to Limits', 'Paul's Online Calculus notes limits'"
                        }
                      },
                      required: ["title", "description", "resources"]
                    }
                  },
                  dailyTip: { type: Type.STRING, description: "A customized, practical study or productivity tip relevant to the day's tasks." }
                },
                required: ["dayNumber", "dayTitle", "focus", "estimatedTime", "tasks", "dailyTip"]
              }
            }
          },
          required: ["title", "summary", "intensity", "milestones", "days"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response content from Gemini.");
    }

    const plan = JSON.parse(response.text.trim());
    res.json(plan);
  } catch (error: any) {
    console.error("Plan generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating your plan." });
  }
});

// 2. Chat Study Buddy Endpoint
app.post("/api/chat-buddy", async (req, res) => {
  try {
    const { messages, contextPlanTitle, contextDay, contextTask } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a supportive, highly knowledgeable, and friendly AI Study Buddy integrated into the PlanIt application.
Your goal is to explain concepts clearly, answer questions, provide simple examples, or quiz the user to help them master their current topics.
You are currently helping the user with their plan: "${contextPlanTitle || 'General Study'}".
${contextDay ? `They are currently focused on Day ${contextDay.dayNumber}: "${contextDay.dayTitle}" (${contextDay.focus}).` : ""}
${contextTask ? `Specifically, they need help or explanation regarding the task: "${contextTask.title}" - "${contextTask.description}".` : ""}

Provide concise, encouraging, and clear educational explanations. Use markdown formatting to make things readable. If they ask for practice questions, provide 1 or 2 simple ones. Keep responses engaging and friendly!`;

    // Format chat messages for Gemini chat
    // We can use generateContent with the history as contents
    // Turn user message format { role: 'user' | 'assistant', content: string } into { role: 'user' | 'model', parts: [{ text: string }] }
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat buddy error:", error);
    res.status(500).json({ error: error.message || "An error occurred in Chat Study Buddy." });
  }
});

// Start server and configure development / production mode
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
    console.log(`PlanIt server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();

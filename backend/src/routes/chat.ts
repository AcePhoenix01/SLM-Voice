import { Router, Request, Response } from "express";
import OpenAI from "openai";

export const chatRouter = Router();

chatRouter.post("/", async (req: Request, res: Response) => {
  try {
    let { provider, messages, model, systemPrompt, temperature } = req.body;

    if (!messages || !model) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Rewrite invalid model ID to the correct working one
    if (model === "nvidia/llama-nemotron-rerank-vl-1b-v2:free") {
      model = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
    }

    // If no provider sent, default based on model name
    let resolvedProvider = provider;
    if (!resolvedProvider) {
      if (model.includes("gemma") || model.includes("gemini")) {
        resolvedProvider = "google";
      } else if (model.includes("mistral")) {
        resolvedProvider = "mistral";
      } else if (model.includes("llama") || model.includes("nemotron") || model.includes("openrouter")) {
        resolvedProvider = "openrouter";
      } else {
        resolvedProvider = "google"; // Default fallback
      }
    }

    if (resolvedProvider === "openrouter") {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "OpenRouter API Key is not configured in backend." });
      }

      const openrouterClient = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Internal Voice AI Builder",
        },
      });

      const apiMessages = [];
      if (systemPrompt) {
        apiMessages.push({ role: "system", content: systemPrompt });
      }
      apiMessages.push(...messages);

      const response = await openrouterClient.chat.completions.create({
        model: model,
        messages: apiMessages as any,
        temperature: temperature ?? 0.7,
      });

      return res.json({
        role: "assistant",
        content: response.choices[0].message.content,
      });
    }

    if (resolvedProvider === "google") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Google AI Studio API Key is not configured in backend." });
      }

      // Convert messages to Google format: role is 'user' or 'model'
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // Google AI Studio requires the first message to be from the user
      if (contents.length > 0 && contents[0].role === "model") {
        contents.unshift({
          role: "user",
          parts: [{ text: "Hello" }]
        });
      }

      const payload: any = { contents };
      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google API returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return res.json({
        role: "assistant",
        content: content,
      });
    }

    if (resolvedProvider === "mistral") {
      const apiKey = process.env.MISTRAL_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Mistral API Key is not configured in backend." });
      }

      const mistralClient = new OpenAI({
        baseURL: "https://api.mistral.ai/v1",
        apiKey: apiKey,
      });

      const apiMessages = [];
      if (systemPrompt) {
        apiMessages.push({ role: "system", content: systemPrompt });
      }
      apiMessages.push(...messages);

      const response = await mistralClient.chat.completions.create({
        model: model,
        messages: apiMessages as any,
        temperature: temperature ?? 0.7,
      });

      return res.json({
        role: "assistant",
        content: response.choices[0].message.content,
      });
    }

    return res.status(400).json({ error: `Unsupported provider: ${resolvedProvider}` });

  } catch (error: any) {
    console.error("Chat API Error:", error.message);
    res.status(500).json({ 
      error: "Failed to communicate with AI provider",
      details: error.message 
    });
  }
});

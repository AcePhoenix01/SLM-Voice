import { Router, Request, Response } from "express";
import { Readable } from "stream";
import OpenAI, { toFile } from "openai";

export const voiceRouter = Router();

import multer from "multer";
import { SonioxNodeClient } from "@soniox/node";
import fs from "fs";

// Configure multer to save in memory (necessary for serverless / Vercel)
const upload = multer({ storage: multer.memoryStorage() });

voiceRouter.post("/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const provider = req.body.provider || "soniox";

    if (provider === "openai" || provider === "groq") {
      const apiKey = provider === "groq" ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
      const baseURL = provider === "groq" ? "https://api.groq.com/openai/v1" : undefined;
      const model = provider === "groq" ? "whisper-large-v3" : "whisper-1";

      if (!apiKey) {
        return res.status(400).json({ error: `${provider.toUpperCase()}_API_KEY is not configured in backend .env.` });
      }

      const openai = new OpenAI({ apiKey, baseURL });
      const file = await toFile(req.file.buffer, req.file.originalname || "audio.webm", { type: req.file.mimetype });

      const response = await openai.audio.transcriptions.create({
        file: file,
        model: model,
      });

      return res.json({ text: response.text });
    }

    const apiKey = process.env.SONIOX_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "SONIOX_API_KEY is not configured" });
    }

    const client = new SonioxNodeClient({ api_key: apiKey });
    
    // Transcribe the file synchronously from the memory buffer
    // By default it auto-detects language or defaults to English
    const result = await client.stt.transcribeFromFile(Readable.from(req.file.buffer), {
      model: "stt-async-v5",
      wait: true,
      filename: req.file.originalname || "audio.webm",
    }) as any;

    // Log result shape for debugging
    const resultJson = result.toJSON ? result.toJSON() : result;
    console.log("Soniox result:", JSON.stringify(resultJson, null, 2));

    // Extract transcript text from the result
    let transcript = "";
    
    // The result from wait:true has a .transcript property which is a SonioxTranscript
    if (result.status === "error" || resultJson.status === "error") {
      throw new Error(resultJson.error_message || "Soniox transcription failed");
    }

    if (result.transcript) {
      // transcript.words is an array of word objects
      if (result.transcript.words && Array.isArray(result.transcript.words)) {
        transcript = result.transcript.words.map((w: any) => w.text).join("");
      } else if (typeof result.transcript === "string") {
        transcript = result.transcript;
      }
    } else if (result.words && Array.isArray(result.words)) {
      transcript = result.words.map((w: any) => w.text).join("");
    } else if (result.text) {
      transcript = result.text;
    }

    res.json({ text: transcript.trim() });
  } catch (error: any) {
    console.error("Voice Transcription Error:", error.message);
    res.status(500).json({ error: "Internal server error during transcription", details: error.message });
  }
});

const voiceIdMap: Record<string, string> = {
  rachel: "21m00Tcm4TlvDq8ikWAM",
  domi: "AZnzlk1XvdvUeBnXmlld",
  bella: "EXAVITQu4vr4xnSDxMaL",
  antoni: "ErXwobaYiN019PkySvjV",
  elli: "MF3mGyEYCl7XYWbVnPEj",
  josh: "TxGEqn7nUa7bBiJ47DgJ",
  arnold: "VR6A4mx77AxzNIgH2W3y",
  adam: "pNInz6obpgHs51d9lhqq",
  sam: "yoZ06aFlWSXTebXj9txY"
};

voiceRouter.post("/synthesize", async (req: Request, res: Response) => {
  try {
    const { text, voice = "rachel", stability = 0.5 } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing 'text' in request body" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });
    }

    const voiceId = voiceIdMap[voice.toLowerCase()] || "EXAVITQu4vr4xnSDxMaL";

    // Call ElevenLabs API
    // Using model: eleven_turbo_v2 as requested in defaults, or eleven_multilingual_v2
    let elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: stability,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    // If it fails and we didn't already use the default Bella voice, fallback to Bella
    if (!elevenLabsResponse.ok && voiceId !== "EXAVITQu4vr4xnSDxMaL") {
      console.warn(`ElevenLabs failed for voice ${voice} (${voiceId}). Falling back to Bella (EXAVITQu4vr4xnSDxMaL)...`);
      elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_turbo_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );
    }

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error("ElevenLabs API Error:", errorText);
      return res.status(elevenLabsResponse.status).json({ error: "Failed to synthesize speech", details: errorText });
    }

    // Stream the audio back to the client
    res.setHeader("Content-Type", "audio/mpeg");
    
    // Convert Web stream to Node stream
    const arrayBuffer = await elevenLabsResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.send(buffer);
  } catch (error: any) {
    console.error("Voice Synthesis Error:", error.message);
    res.status(500).json({ error: "Internal server error during speech synthesis", details: error.message });
  }
});

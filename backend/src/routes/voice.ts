import { Router, Request, Response } from "express";
import { Readable } from "stream";
import OpenAI, { toFile } from "openai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

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

    const elevenlabs = new ElevenLabsClient({ apiKey });
    let audioStream: any;

    try {
      audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
        text: text,
        modelId: "eleven_flash_v2",
        voiceSettings: {
          stability: stability,
          similarityBoost: 0.75,
        },
      });
    } catch (sdkError: any) {
      if (voiceId !== "EXAVITQu4vr4xnSDxMaL") {
        console.warn(`ElevenLabs SDK failed for voice ${voice} (${voiceId}). Falling back to Bella (EXAVITQu4vr4xnSDxMaL)...`);
        audioStream = await elevenlabs.textToSpeech.convert("EXAVITQu4vr4xnSDxMaL", {
          text: text,
          modelId: "eleven_flash_v2",
          voiceSettings: {
            stability: 0.5,
            similarityBoost: 0.75,
          },
        });
      } else {
        throw sdkError;
      }
    }

    // Stream the audio back to the client
    res.setHeader("Content-Type", "audio/mpeg");
    
    if (audioStream && typeof audioStream.pipe === "function") {
      audioStream.pipe(res);
    } else if (audioStream && typeof audioStream.getReader === "function") {
      // Convert Web ReadableStream to Node.js Readable stream
      Readable.fromWeb(audioStream as any).pipe(res);
    } else {
      // Fallback if the SDK returns a buffer or arrayBuffer
      const buffer = Buffer.isBuffer(audioStream) 
        ? audioStream 
        : Buffer.from(await audioStream.arrayBuffer());
      res.send(buffer);
    }
  } catch (error: any) {
    console.error("Voice Synthesis Error:", error.message);
    res.status(500).json({ error: "Internal server error during speech synthesis", details: error.message });
  }
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { chatRouter } from "./routes/chat";
import { agentsRouter } from "./routes/agents";
import { voiceRouter } from "./routes/voice";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Mount on both with and without /api prefix to support local development and Vercel routing
app.use("/api/chat", chatRouter);
app.use("/chat", chatRouter);

app.use("/api/agents", agentsRouter);
app.use("/agents", agentsRouter);

app.use("/api/voice", voiceRouter);
app.use("/voice", voiceRouter);

// Health check
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Voice AI Builder backend running on http://localhost:${PORT}`);
  });
}

export default app;

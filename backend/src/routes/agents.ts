import { Router, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

export const agentsRouter = Router();

const DATA_FILE = path.join(__dirname, "../../data.json");

// Helper to read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return { agents: [] };
    }
    throw error;
  }
}

// Helper to write data
async function writeData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Get all agents
agentsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const data = await readData();
    res.json(data.agents);
  } catch (error) {
    console.error("Error reading agents:", error);
    res.status(500).json({ error: "Failed to load agents" });
  }
});

// Save/Update an agent
agentsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const agentData = req.body;
    
    if (!agentData || !agentData.id) {
      return res.status(400).json({ error: "Invalid agent data provided" });
    }

    const data = await readData();
    const existingIndex = data.agents.findIndex((a: any) => a.id === agentData.id);

    if (existingIndex >= 0) {
      data.agents[existingIndex] = agentData;
    } else {
      data.agents.push(agentData);
    }

    await writeData(data);
    res.json({ success: true, agent: agentData });
  } catch (error) {
    console.error("Error saving agent:", error);
    res.status(500).json({ error: "Failed to save agent" });
  }
});

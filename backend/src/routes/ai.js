import { Router } from "express";
import * as ai from "../services/aiService.js";

const router = Router();

router.post("/summarize", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("your")) {
    return res.json({ summary: "AI не настроен. Добавьте ANTHROPIC_API_KEY в .env файл." });
  }
  try {
    const summary = await ai.summarizeMessages(req.body.messages || []);
    res.json({ summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/reply", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("your")) {
    return res.json({ reply: "AI не настроен. Добавьте ANTHROPIC_API_KEY в .env файл." });
  }
  try {
    const reply = await ai.generateReply(req.body.message);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/prioritize", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("your")) {
    return res.json({ priorities: [] });
  }
  try {
    const priorities = await ai.classifyPriority(req.body.messages || []);
    res.json({ priorities });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

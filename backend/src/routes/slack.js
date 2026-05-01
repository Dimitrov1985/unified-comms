import { Router } from "express";
import * as slack from "../services/slackService.js";

const router = Router();

router.get("/messages", async (req, res) => {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || token.startsWith("xoxb-your")) {
    return res.json({ connected: false, messages: [] });
  }
  try {
    const messages = await slack.getMessages(token);
    res.json({ connected: true, messages });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/send", async (req, res) => {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || token.startsWith("xoxb-your")) {
    return res.status(401).json({ error: "Slack not configured" });
  }
  try {
    await slack.sendMessage(token, req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/channels", async (req, res) => {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || token.startsWith("xoxb-your")) {
    return res.json({ channels: [] });
  }
  try {
    const channels = await slack.getChannels(token);
    res.json({ channels });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/status", (_req, res) => {
  const token = process.env.SLACK_BOT_TOKEN;
  res.json({ connected: !!(token && !token.startsWith("xoxb-your")) });
});

export default router;

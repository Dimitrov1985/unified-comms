import { Router } from "express";
import * as gmail from "../services/gmailService.js";
import { saveGmailTokens, loadGmailTokens } from "../services/store.js";

const router = Router();

// Load saved tokens on startup
let storedTokens = loadGmailTokens();

router.get("/auth", (_req, res) => {
  res.redirect(gmail.getAuthUrl());
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  storedTokens = await gmail.getTokens(code);
  saveGmailTokens(storedTokens);
  res.redirect(`${process.env.FRONTEND_URL}?gmail=connected`);
});

router.get("/messages", async (req, res) => {
  if (!storedTokens) return res.json({ connected: false, messages: [] });
  try {
    const messages = await gmail.getMessages(storedTokens.access_token);
    res.json({ connected: true, messages });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/send", async (req, res) => {
  if (!storedTokens) return res.status(401).json({ error: "Not connected" });
  try {
    await gmail.sendEmail(storedTokens.access_token, req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/status", (_req, res) => {
  res.json({ connected: !!storedTokens });
});

export default router;

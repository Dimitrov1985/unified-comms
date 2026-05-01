import { Router } from "express";
import * as wa from "../services/whatsappService.js";

const router = Router();

// Twilio webhook — incoming messages
router.get("/webhook", (_req, res) => res.send("WhatsApp webhook OK"));
router.post("/webhook", (req, res) => {
  wa.addIncoming(req.body);
  res.set("Content-Type", "text/xml");
  res.send("<Response></Response>");
});

router.get("/messages", (_req, res) => {
  const configured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    !process.env.TWILIO_ACCOUNT_SID.startsWith("your")
  );
  res.json({ connected: configured, messages: wa.getMessages() });
});

router.post("/read/:id", (req, res) => {
  wa.markAsRead(req.params.id);
  res.json({ ok: true });
});

router.post("/send", async (req, res) => {
  try {
    await wa.sendMessage(req.body.to, req.body.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/status", (_req, res) => {
  res.json({
    connected: !!(
      process.env.TWILIO_ACCOUNT_SID &&
      !process.env.TWILIO_ACCOUNT_SID.startsWith("your")
    ),
  });
});

export default router;

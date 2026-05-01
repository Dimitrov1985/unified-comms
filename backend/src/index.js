import "dotenv/config";
import express from "express";
import cors    from "cors";
import gmailRoutes    from "./routes/gmail.js";
import slackRoutes    from "./routes/slack.js";
import whatsappRoutes from "./routes/whatsapp.js";
import aiRoutes       from "./routes/ai.js";

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://unified-comms.vercel.app",
    "http://localhost:3000",
    "http://localhost:3003",
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/gmail",     gmailRoutes);
app.use("/api/slack",     slackRoutes);
app.use("/api/whatsapp",  whatsappRoutes);
app.use("/api/ai",        aiRoutes);

// Alias — совпадает с redirect URI зарегистрированным в Google Cloud
app.use("/auth/gmail",    gmailRoutes);

// Health check + all connection statuses
app.get("/api/status", (_req, res) => {
  res.json({
    status:  "ok",
    version: "1.0.0",
    services: {
      gmail:     !!process.env.GMAIL_CLIENT_ID     && !process.env.GMAIL_CLIENT_ID.startsWith("your"),
      slack:     !!process.env.SLACK_BOT_TOKEN     && !process.env.SLACK_BOT_TOKEN.startsWith("xoxb-your"),
      whatsapp:  !!process.env.TWILIO_ACCOUNT_SID  && !process.env.TWILIO_ACCOUNT_SID.startsWith("your"),
      ai:        !!process.env.ANTHROPIC_API_KEY   && !process.env.ANTHROPIC_API_KEY.startsWith("your"),
    },
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Unified Comms backend: http://localhost:${PORT}`);
  console.log(`   Status: http://localhost:${PORT}/api/status\n`);
});

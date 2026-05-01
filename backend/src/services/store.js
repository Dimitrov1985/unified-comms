import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dir  = path.dirname(fileURLToPath(import.meta.url));
const DATA   = path.join(__dir, "../../data");

fs.mkdirSync(DATA, { recursive: true });

function filePath(name) {
  return path.join(DATA, `${name}.json`);
}

function read(name) {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), "utf-8"));
  } catch {
    return null;
  }
}

function write(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

// ── Gmail tokens ─────────────────────────────────────────────────────────────
export function saveGmailTokens(tokens) { write("gmail_tokens", tokens); }
export function loadGmailTokens()       { return read("gmail_tokens"); }

// ── WhatsApp messages ─────────────────────────────────────────────────────────
export function saveMessages(messages)  { write("whatsapp_messages", messages); }
export function loadMessages()          { return read("whatsapp_messages") || []; }

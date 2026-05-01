import twilio from "twilio";
import { saveMessages, loadMessages } from "./store.js";

const getClient = () =>
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Load persisted messages on startup
const incomingMessages = loadMessages();

export function addIncoming(msg) {
  incomingMessages.unshift({
    id:        `wa-${Date.now()}`,
    source:    "whatsapp",
    from:      msg.From?.replace("whatsapp:", "") || "Unknown",
    body:      msg.Body || "",
    timestamp: Date.now(),
    read:      false,
  });
  if (incomingMessages.length > 100) incomingMessages.pop();
  saveMessages(incomingMessages);
}

export function getMessages() {
  return incomingMessages;
}

export function markAsRead(id) {
  const msg = incomingMessages.find((m) => m.id === id);
  if (msg) {
    msg.read = true;
    saveMessages(incomingMessages);
  }
}

export async function sendMessage(to, body) {
  const client = getClient();
  const sent = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to:   `whatsapp:${to}`,
    body,
  });

  // Save outgoing message too
  incomingMessages.unshift({
    id:        `wa-out-${Date.now()}`,
    source:    "whatsapp",
    from:      "Вы",
    to,
    body,
    timestamp: Date.now(),
    read:      true,
    outgoing:  true,
  });
  saveMessages(incomingMessages);
  return sent;
}

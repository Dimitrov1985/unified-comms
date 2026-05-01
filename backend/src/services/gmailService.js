import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt:      "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
}

export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getMessages(accessToken, maxResults = 20) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    labelIds: ["INBOX"],
  });

  if (!list.data.messages) return [];

  const messages = await Promise.all(
    list.data.messages.map(async (m) => {
      const msg = await gmail.users.messages.get({ userId: "me", id: m.id });
      const headers = msg.data.payload.headers;
      const get = (name) => headers.find((h) => h.name === name)?.value || "";

      const bodyPart = msg.data.payload.parts?.find((p) => p.mimeType === "text/plain");
      const body = bodyPart
        ? Buffer.from(bodyPart.body.data || "", "base64").toString("utf-8")
        : "";

      return {
        id:        m.id,
        source:    "gmail",
        from:      get("From"),
        to:        get("To"),
        subject:   get("Subject"),
        body:      body.slice(0, 500),
        date:      get("Date"),
        timestamp: new Date(get("Date")).getTime() || Date.now(),
        read:      !msg.data.labelIds?.includes("UNREAD"),
      };
    })
  );

  return messages;
}

export async function sendEmail(accessToken, { to, subject, body }) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).toString("base64url");

  await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
}

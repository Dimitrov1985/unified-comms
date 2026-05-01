import { WebClient } from "@slack/web-api";

export async function getMessages(botToken, limit = 20) {
  const client = new WebClient(botToken);

  // Get all channels the bot is in
  const chList = await client.conversations.list({ types: "public_channel,private_channel", limit: 10 });
  const channels = chList.channels || [];

  const messages = [];

  for (const channel of channels.slice(0, 5)) {
    try {
      const history = await client.conversations.history({ channel: channel.id, limit });
      for (const msg of history.messages || []) {
        if (!msg.text || msg.subtype) continue;

        // Resolve username
        let fromName = msg.username || "Unknown";
        if (msg.user) {
          try {
            const info = await client.users.info({ user: msg.user });
            fromName = info.user?.real_name || info.user?.name || msg.user;
          } catch {}
        }

        messages.push({
          id:        `slack-${channel.id}-${msg.ts}`,
          source:    "slack",
          from:      fromName,
          channel:   channel.name,
          body:      msg.text.slice(0, 500),
          timestamp: Math.floor(parseFloat(msg.ts) * 1000),
          read:      true,
        });
      }
    } catch {}
  }

  return messages.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export async function sendMessage(botToken, { channel, text }) {
  const client = new WebClient(botToken);
  await client.chat.postMessage({ channel, text });
}

export async function getChannels(botToken) {
  const client = new WebClient(botToken);
  const res = await client.conversations.list({ types: "public_channel,private_channel", limit: 20 });
  return (res.channels || []).map((c) => ({ id: c.id, name: c.name }));
}

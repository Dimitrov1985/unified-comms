import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function summarizeMessages(messages) {
  if (!messages.length) return "Нет сообщений для анализа.";

  const text = messages
    .slice(0, 15)
    .map((m) => `[${m.source.toUpperCase()}] ${m.from}: ${m.body}`)
    .join("\n");

  const response = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 400,
    system:     "Ты помощник для анализа переписки. Отвечай кратко на русском языке.",
    messages: [
      {
        role:    "user",
        content: `Сделай краткое резюме этих сообщений (2-4 предложения):\n\n${text}`,
      },
    ],
  });

  return response.content[0].text;
}

export async function generateReply(message) {
  const response = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 200,
    system:     "Ты помощник для деловой переписки. Составляй вежливые, краткие ответы на русском языке.",
    messages: [
      {
        role:    "user",
        content: `Составь вариант ответа на это сообщение:\n\nОт: ${message.from}\nТема: ${message.subject || "-"}\nТекст: ${message.body}`,
      },
    ],
  });

  return response.content[0].text;
}

export async function classifyPriority(messages) {
  if (!messages.length) return [];

  const text = messages
    .slice(0, 10)
    .map((m, i) => `${i + 1}. [${m.source}] ${m.from}: ${m.body?.slice(0, 100)}`)
    .join("\n");

  const response = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 300,
    system:     "Ты помощник для приоритизации сообщений. Отвечай только JSON.",
    messages: [
      {
        role:    "user",
        content: `Определи приоритет каждого сообщения (high/medium/low). Ответь JSON массивом: [{"index":1,"priority":"high"},...]:\n\n${text}`,
      },
    ],
  });

  try {
    return JSON.parse(response.content[0].text);
  } catch {
    return [];
  }
}

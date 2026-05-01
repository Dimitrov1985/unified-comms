import { useState, useCallback, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export function useMessages() {
  const [messages,  setMessages]  = useState([]);
  const [statuses,  setStatuses]  = useState({ gmail: false, slack: false, whatsapp: false, ai: false });
  const [loading,   setLoading]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary,   setSummary]   = useState(null);
  const [filter,    setFilter]    = useState("all"); // all | gmail | slack | whatsapp

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/status`);
      const data = await res.json();
      setStatuses(data.services || {});
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [gmailRes, slackRes, waRes] = await Promise.all([
        fetch(`${API}/gmail/messages`).then((r) => r.json()).catch(() => ({ messages: [] })),
        fetch(`${API}/slack/messages`).then((r) => r.json()).catch(() => ({ messages: [] })),
        fetch(`${API}/whatsapp/messages`).then((r) => r.json()).catch(() => ({ messages: [] })),
      ]);

      const all = [
        ...(gmailRes.messages   || []),
        ...(slackRes.messages   || []),
        ...(waRes.messages      || []),
      ].sort((a, b) => b.timestamp - a.timestamp);

      setMessages(all);
    } finally {
      setLoading(false);
    }
  }, []);

  const summarize = useCallback(async (msgs) => {
    setAiLoading(true);
    setSummary(null);
    try {
      const res = await fetch(`${API}/ai/summarize`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: msgs }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const generateReply = useCallback(async (message) => {
    const res = await fetch(`${API}/ai/reply`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ message }),
    });
    const data = await res.json();
    return data.reply;
  }, []);

  const markAsRead = useCallback(async (msg) => {
    if (msg.source === "whatsapp" && !msg.read) {
      await fetch(`${API}/whatsapp/read/${msg.id}`, { method: "POST" });
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, read: true } : m)
      );
    }
  }, []);

  const sendReply = useCallback(async ({ source, to, channel, subject, body }) => {
    if (source === "gmail") {
      await fetch(`${API}/gmail/send`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ to, subject: `Re: ${subject || ""}`, body }),
      });
    } else if (source === "slack") {
      await fetch(`${API}/slack/send`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ channel, text: body }),
      });
    } else if (source === "whatsapp") {
      await fetch(`${API}/whatsapp/send`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ to, body }),
      });
    }
    await fetchAll();
  }, [fetchAll]);

  const filtered = filter === "all" ? messages : messages.filter((m) => m.source === filter);

  useEffect(() => { fetchStatuses(); fetchAll(); }, []);

  return {
    messages: filtered,
    allMessages: messages,
    statuses, loading, aiLoading,
    summary, filter,
    setFilter, fetchAll, summarize, generateReply, sendReply, markAsRead,
  };
}

import React, { useState } from "react";

export default function MessageDetail({ msg, onReply, onGenerateReply, onClose }) {
  const [replyText,  setReplyText]  = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [sent,       setSent]       = useState(false);

  if (!msg) return (
    <div style={styles.empty}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
      <div style={{ color: "var(--muted)" }}>Выберите сообщение</div>
    </div>
  );

  const time = new Date(msg.timestamp).toLocaleString("ru-RU");

  const handleGenerate = async () => {
    setGenerating(true);
    const reply = await onGenerateReply(msg);
    setReplyText(reply || "");
    setGenerating(false);
  };

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply({
      source:  msg.source,
      to:      msg.from,
      channel: msg.channel,
      subject: msg.subject,
      body:    replyText,
    });
    setSent(true);
    setReplyText("");
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={styles.detail}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{msg.subject || msg.channel || "Сообщение"}</div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
            От: {msg.from} · {time}
          </div>
        </div>
        <button className="btn-ghost" style={{ fontSize: 18, padding: "4px 10px" }} onClick={onClose}>✕</button>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{msg.body}</p>
      </div>

      {/* Reply */}
      <div style={styles.replyBox}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>Ответить</span>
          <button
            className="btn-ghost"
            style={{ fontSize: 12, padding: "3px 10px", marginLeft: "auto" }}
            disabled={generating}
            onClick={handleGenerate}
          >
            {generating ? <span className="spinner" /> : "🤖 AI ответ"}
          </button>
        </div>
        <textarea
          style={styles.textarea}
          placeholder="Введите ответ..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={4}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          {sent && <span style={{ color: "var(--green)", fontSize: 12, marginRight: 12, alignSelf: "center" }}>✓ Отправлено</span>}
          <button className="btn-primary" disabled={!replyText.trim() || sending} onClick={handleSend}>
            {sending ? <span className="spinner" /> : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted)",
  },
  detail: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  body: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    fontSize: 14,
    lineHeight: 1.7,
  },
  replyBox: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface)",
  },
  textarea: {
    width: "100%",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "var(--text)",
    fontFamily: "inherit",
    fontSize: 13,
    resize: "vertical",
    outline: "none",
  },
};

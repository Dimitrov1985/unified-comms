import React, { useState } from "react";

const SOURCE_COLORS = {
  gmail:    { bg: "#ea433522", color: "#ea4335", label: "Gmail"    },
  slack:    { bg: "#4a154b22", color: "#e01e5a", label: "Slack"    },
  whatsapp: { bg: "#25d36622", color: "#25d366", label: "WhatsApp" },
};

export default function MessageItem({ msg, onSelect, selected }) {
  const src   = SOURCE_COLORS[msg.source] || { bg: "#fff1", color: "#fff", label: msg.source };
  const time  = new Date(msg.timestamp).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      style={{
        ...styles.item,
        background: selected ? "var(--surface2)" : "transparent",
        borderLeft: selected ? "3px solid var(--accent)" : "3px solid transparent",
      }}
      onClick={() => onSelect(msg)}
    >
      <div style={styles.row}>
        <span style={{ ...styles.sourceBadge, background: src.bg, color: src.color }}>
          {src.label}
        </span>
        {!msg.read && <span style={styles.unreadDot} />}
        <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 11 }}>{time}</span>
      </div>
      <div style={styles.from}>{msg.from}</div>
      {msg.subject && <div style={styles.subject}>{msg.subject}</div>}
      {msg.channel && <div style={{ ...styles.subject, color: "var(--muted)" }}>#{msg.channel}</div>}
      <div style={styles.preview}>{msg.body?.slice(0, 100)}</div>
    </div>
  );
}

const styles = {
  item: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    transition: "background .1s",
  },
  row: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  sourceBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 99,
    textTransform: "uppercase",
    letterSpacing: .5,
  },
  unreadDot: {
    width: 7, height: 7,
    borderRadius: "50%",
    background: "var(--accent)",
    display: "inline-block",
  },
  from:    { fontWeight: 600, fontSize: 13, marginBottom: 2 },
  subject: { fontSize: 12, fontWeight: 500, marginBottom: 2 },
  preview: { fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};

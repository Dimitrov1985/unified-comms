import React from "react";

const SOURCES = [
  { id: "all",       label: "Все",       icon: "💬" },
  { id: "gmail",     label: "Gmail",     icon: "✉️"  },
  { id: "slack",     label: "Slack",     icon: "💼" },
  { id: "whatsapp",  label: "WhatsApp",  icon: "📱" },
];

const BLOCKCHAIN = [
  { id: "payments",  label: "Платежи",   icon: "💳" },
  { id: "tokens",    label: "Токены",    icon: "🪙" },
  { id: "rewards",   label: "Награды",   icon: "🎁" },
];

export default function Sidebar({ filter, setFilter, statuses, counts, onRefresh }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={{ fontSize: 20 }}>🔗</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Unified Comms</span>
      </div>

      <nav style={{ flex: 1 }}>
        <div style={styles.sectionLabel}>Сообщения</div>
        {SOURCES.map((s) => (
          <button
            key={s.id}
            style={{
              ...styles.navItem,
              background: filter === s.id ? "var(--accent)22" : "transparent",
              color:      filter === s.id ? "var(--accent)"   : "var(--text)",
              borderLeft: filter === s.id ? "3px solid var(--accent)" : "3px solid transparent",
            }}
            onClick={() => setFilter(s.id)}
          >
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <span style={{ flex: 1 }}>{s.label}</span>
            {counts[s.id] > 0 && (
              <span style={styles.badge}>{counts[s.id]}</span>
            )}
          </button>
        ))}

        <div style={{ ...styles.sectionLabel, marginTop: 16 }}>Блокчейн</div>
        {BLOCKCHAIN.map((s) => (
          <button
            key={s.id}
            style={{
              ...styles.navItem,
              background: filter === s.id ? "var(--accent)22" : "transparent",
              color:      filter === s.id ? "var(--accent)"   : "var(--text)",
              borderLeft: filter === s.id ? "3px solid var(--accent)" : "3px solid transparent",
            }}
            onClick={() => setFilter(s.id)}
          >
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <span style={{ flex: 1 }}>{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Service status */}
      <div style={styles.statusBlock}>
        <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
          Подключения
        </div>
        {[
          { key: "gmail",    label: "Gmail",    icon: "✉️"  },
          { key: "slack",    label: "Slack",    icon: "💼" },
          { key: "whatsapp", label: "WhatsApp", icon: "📱" },
          { key: "ai",       label: "Claude AI",icon: "🤖" },
        ].map((s) => (
          <div key={s.key} style={styles.statusRow}>
            <span>{s.icon}</span>
            <span style={{ flex: 1, fontSize: 12 }}>{s.label}</span>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: statuses[s.key] ? "var(--green)" : "var(--red)",
              display: "inline-block",
            }} />
          </div>
        ))}
      </div>

      <button className="btn-ghost" style={{ margin: "12px", fontSize: 12 }} onClick={onRefresh}>
        ↻ Обновить
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 220,
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "18px 16px",
    borderBottom: "1px solid var(--border)",
    color: "var(--accent)",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 16px",
    borderRadius: 0,
    fontWeight: 500,
    fontSize: 14,
    textAlign: "left",
  },
  badge: {
    background: "var(--accent)",
    color: "#fff",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 700,
    padding: "1px 7px",
    minWidth: 20,
    textAlign: "center",
  },
  sectionLabel: {
    color: "var(--muted)",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    padding: "8px 16px 4px",
  },
  statusBlock: {
    padding: "12px 16px",
    borderTop: "1px solid var(--border)",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 0",
    fontSize: 12,
    color: "var(--muted)",
  },
};

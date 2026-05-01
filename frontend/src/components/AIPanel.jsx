import React from "react";

export default function AIPanel({ messages, summary, loading, onSummarize }) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={{ fontSize: 16 }}>🤖</span>
        <span style={{ fontWeight: 600 }}>Claude AI</span>
      </div>

      <button
        className="btn-primary"
        style={{ width: "100%", marginBottom: 12 }}
        disabled={loading || !messages.length}
        onClick={() => onSummarize(messages)}
      >
        {loading ? <span className="spinner" /> : "Анализировать переписку"}
      </button>

      {summary ? (
        <div style={styles.summary}>
          <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>
            Резюме
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>{summary}</p>
        </div>
      ) : (
        <div style={styles.placeholder}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
            Нажмите "Анализировать" чтобы получить резюме всех сообщений
          </div>
        </div>
      )}

      <div style={styles.features}>
        <div style={styles.featureItem}>
          <span>📋</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Авто-резюме</div>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>Краткий обзор переписки</div>
          </div>
        </div>
        <div style={styles.featureItem}>
          <span>💡</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Умные ответы</div>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>AI составит ответ за тебя</div>
          </div>
        </div>
        <div style={styles.featureItem}>
          <span>🎯</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Приоритеты</div>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>Важные сообщения вперёд</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    width: 240,
    background: "var(--surface)",
    borderLeft: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: 16,
    flexShrink: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid var(--border)",
  },
  summary: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 0",
    marginBottom: 16,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: "auto",
    paddingTop: 16,
    borderTop: "1px solid var(--border)",
  },
  featureItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    fontSize: 16,
  },
};

import React, { useState } from "react";
import { useMessages }    from "./hooks/useMessages";
import { useWeb3 }        from "./hooks/useWeb3";
import Sidebar            from "./components/Sidebar";
import MessageItem        from "./components/MessageItem";
import MessageDetail      from "./components/MessageDetail";
import AIPanel            from "./components/AIPanel";
import PaymentPanel       from "./components/PaymentPanel";
import TokenBalance       from "./components/TokenBalance";
import RewardsDashboard   from "./components/RewardsDashboard";

const BLOCKCHAIN_VIEWS = ["payments", "tokens", "rewards"];

export default function App() {
  const {
    messages, allMessages, statuses, loading, aiLoading,
    summary, filter, setFilter, fetchAll, summarize, generateReply, sendReply, markAsRead,
  } = useMessages();

  const web3 = useWeb3();
  const [selected, setSelected] = useState(null);

  const isBlockchain = BLOCKCHAIN_VIEWS.includes(filter);

  const unread = (src) => allMessages.filter((m) =>
    !m.read && !m.outgoing && (src === "all" ? true : m.source === src)
  ).length;

  const counts = {
    all:      unread("all"),
    gmail:    unread("gmail"),
    slack:    unread("slack"),
    whatsapp: unread("whatsapp"),
  };

  const handleSuccess = () => web3.refreshBalances();

  return (
    <div style={styles.app}>
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        statuses={statuses}
        counts={counts}
        onRefresh={fetchAll}
      />

      {isBlockchain ? (
        /* ── Blockchain view ── */
        <div style={styles.blockchainView}>
          {/* Wallet header */}
          <div style={styles.walletBar}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>
              {filter === "payments" ? "💳 Платежи" : filter === "tokens" ? "🪙 Токены PLT" : "🎁 Награды"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {web3.account ? (
                <>
                  <span style={styles.chip}>ETH {parseFloat(web3.balance).toFixed(4)}</span>
                  <span style={{ ...styles.chip, color: "var(--green)" }}>PLT {parseFloat(web3.tokenBal).toFixed(2)}</span>
                  <span style={styles.chip}>🟢 {web3.account.slice(0,6)}…{web3.account.slice(-4)}</span>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={web3.disconnect}>Выйти</button>
                </>
              ) : (
                <button className="btn-primary" disabled={web3.loading} onClick={web3.connectMetaMask}>
                  {web3.loading ? <span className="spinner" /> : "🦊 Подключить MetaMask"}
                </button>
              )}
            </div>
          </div>

          <div style={styles.blockchainContent}>
            {filter === "payments" && (
              <PaymentPanel
                processor={web3.processor}
                token={web3.token}
                account={web3.account}
                onSuccess={handleSuccess}
              />
            )}
            {filter === "tokens" && (
              <TokenBalance
                tokenBal={web3.tokenBal}
                account={web3.account}
                token={web3.token}
              />
            )}
            {filter === "rewards" && (
              <RewardsDashboard
                rewardSys={web3.rewardSys}
                account={web3.account}
                onReward={handleSuccess}
              />
            )}
          </div>
        </div>
      ) : (
        /* ── Messaging view ── */
        <>
          <div style={styles.list}>
            <div style={styles.listHeader}>
              <span style={{ fontWeight: 600 }}>
                {filter === "all" ? "Все сообщения" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </span>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>{messages.length} сообщений</span>
            </div>
            <div style={styles.listBody}>
              {loading ? (
                <div style={styles.center}><span className="spinner" /></div>
              ) : messages.length === 0 ? (
                <div style={styles.center}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>Нет сообщений</div>
                </div>
              ) : (
                messages.map((m) => (
                  <MessageItem
                    key={m.id}
                    msg={m}
                    selected={selected?.id === m.id}
                    onSelect={(msg) => { setSelected(msg); markAsRead(msg); }}
                  />
                ))
              )}
            </div>
          </div>

          <div style={styles.detail}>
            <MessageDetail
              msg={selected}
              onReply={sendReply}
              onGenerateReply={generateReply}
              onClose={() => setSelected(null)}
            />
          </div>

          <AIPanel
            messages={messages}
            summary={summary}
            loading={aiLoading}
            onSummarize={summarize}
          />
        </>
      )}
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
  },
  list: {
    width: 300,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid var(--border)",
    flexShrink: 0,
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  listBody: {
    flex: 1,
    overflowY: "auto",
  },
  detail: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "var(--muted)",
  },
  blockchainView: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  walletBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  blockchainContent: {
    flex: 1,
    overflowY: "auto",
    padding: "32px",
    maxWidth: 640,
    width: "100%",
    margin: "0 auto",
  },
  chip: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 13,
    fontWeight: 500,
  },
};

import React, { useState, useEffect } from "react";
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function App() {
  const {
    messages, allMessages, statuses, loading, aiLoading,
    summary, filter, setFilter, fetchAll, summarize, generateReply, sendReply, markAsRead,
  } = useMessages();

  const web3      = useWeb3();
  const isMobile  = useIsMobile();
  const [selected,    setSelected]    = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Mobile view: "list" | "detail" | "ai"
  const [mobileView, setMobileView]   = useState("list");

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

  const handleSelect = (msg) => {
    setSelected(msg);
    markAsRead(msg);
    if (isMobile) setMobileView("detail");
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    setSidebarOpen(false);
    setMobileView("list");
  };

  // ── Blockchain panel ─────────────────────────────────────────
  const BlockchainPanel = () => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={styles.walletBar}>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          {filter === "payments" ? "💳 Платежи" : filter === "tokens" ? "🪙 Токены PLT" : "🎁 Награды"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {web3.account && web3.chainId !== 11155111 && (
            <span style={{ color: "#f59e0b", fontSize: 11 }}>⚠️ Sepolia</span>
          )}
          {web3.account ? (
            <>
              <span style={styles.chip}>ETH {parseFloat(web3.balance).toFixed(3)}</span>
              <span style={{ ...styles.chip, color: "var(--green)" }}>PLT {parseFloat(web3.tokenBal).toFixed(1)}</span>
              <span style={styles.chip}>🟢 {web3.account.slice(0,4)}…{web3.account.slice(-3)}</span>
              <button className="btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={web3.disconnect}>Выйти</button>
            </>
          ) : (
            <button className="btn-primary" style={{ fontSize: 12 }} disabled={web3.loading} onClick={web3.connectMetaMask}>
              {web3.loading ? <span className="spinner" /> : "🦊 MetaMask"}
            </button>
          )}
        </div>
      </div>
      <div style={styles.blockchainContent}>
        {filter === "payments" && <PaymentPanel processor={web3.processor} token={web3.token} account={web3.account} onSuccess={handleSuccess} />}
        {filter === "tokens"   && <TokenBalance tokenBal={web3.tokenBal} account={web3.account} token={web3.token} signer={web3.signer} />}
        {filter === "rewards"  && <RewardsDashboard rewardSys={web3.rewardSys} account={web3.account} onReward={handleSuccess} />}
      </div>
    </div>
  );

  // ── Mobile layout ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

        {/* Mobile header */}
        <div style={styles.mobileHeader}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span style={{ fontWeight: 700, color: "var(--accent)" }}>🔗 Unified Comms</span>
          <button style={styles.menuBtn} onClick={fetchAll}>↻</button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div style={styles.overlay} onClick={() => setSidebarOpen(false)}>
            <div style={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
              <Sidebar
                filter={filter}
                setFilter={handleFilterChange}
                statuses={statuses}
                counts={counts}
                onRefresh={() => { fetchAll(); setSidebarOpen(false); }}
              />
            </div>
          </div>
        )}

        {/* Mobile content */}
        {isBlockchain ? (
          <BlockchainPanel />
        ) : (
          <>
            {/* Bottom tab bar for mobile */}
            {selected && mobileView === "detail" ? (
              <div style={{ flex: 1 }}>
                <button style={styles.backBtn} onClick={() => { setMobileView("list"); setSelected(null); }}>
                  ← Назад
                </button>
                <MessageDetail
                  msg={selected}
                  onReply={sendReply}
                  onGenerateReply={generateReply}
                  onClose={() => { setMobileView("list"); setSelected(null); }}
                />
              </div>
            ) : mobileView === "ai" ? (
              <div style={{ flex: 1, padding: 16 }}>
                <button style={styles.backBtn} onClick={() => setMobileView("list")}>← Назад</button>
                <AIPanel messages={messages} summary={summary} loading={aiLoading} onSummarize={summarize} />
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={styles.listHeader}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {filter === "all" ? "Все сообщения" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>{messages.length}</span>
                    <button style={{ ...styles.menuBtn, fontSize: 12 }} onClick={() => setMobileView("ai")}>🤖 AI</button>
                  </div>
                </div>
                {loading ? (
                  <div style={styles.center}><span className="spinner" /></div>
                ) : messages.length === 0 ? (
                  <div style={styles.center}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>Нет сообщений</div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <MessageItem key={m.id} msg={m} selected={false} onSelect={handleSelect} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────
  return (
    <div style={styles.app}>
      <Sidebar filter={filter} setFilter={setFilter} statuses={statuses} counts={counts} onRefresh={fetchAll} />

      {isBlockchain ? <BlockchainPanel /> : (
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
                  <MessageItem key={m.id} msg={m} selected={selected?.id === m.id} onSelect={handleSelect} />
                ))
              )}
            </div>
          </div>
          <div style={styles.detail}>
            <MessageDetail msg={selected} onReply={sendReply} onGenerateReply={generateReply} onClose={() => setSelected(null)} />
          </div>
          <AIPanel messages={messages} summary={summary} loading={aiLoading} onSummarize={summarize} />
        </>
      )}
    </div>
  );
}

const styles = {
  app:         { display: "flex", height: "100vh", overflow: "hidden" },
  list:        { width: 300, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", flexShrink: 0 },
  listHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)" },
  listBody:    { flex: 1, overflowY: "auto" },
  detail:      { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  center:      { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--muted)" },
  walletBar:   { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexWrap: "wrap", gap: 8 },
  blockchainContent: { flex: 1, overflowY: "auto", padding: "24px 16px", maxWidth: 640, width: "100%", margin: "0 auto" },
  chip:        { background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 500 },

  // Mobile
  mobileHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 50 },
  menuBtn:      { background: "transparent", border: "none", color: "var(--text)", fontSize: 20, padding: "4px 8px", cursor: "pointer" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 100, display: "flex" },
  mobileSidebar:{ width: 240, height: "100%", overflowY: "auto" },
  backBtn:      { display: "block", background: "transparent", border: "none", color: "var(--accent)", fontSize: 14, fontWeight: 600, padding: "12px 16px", cursor: "pointer" },
};

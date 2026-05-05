import React from "react";
import TokenSwap from "./TokenSwap";

export default function TokenBalance({ tokenBal, account, token, signer }) {
  const bal = parseFloat(tokenBal || "0");

  const features = [
    { label: "Extra Storage",   required: 100,  icon: "💾" },
    { label: "Premium Access",  required: 500,  icon: "⭐" },
    { label: "VIP Status",      required: 1000, icon: "👑" },
  ];

  return (
    <>
    <div className="card">
      <h2 style={{ marginBottom: 4, fontSize: 18 }}>PLT Token</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
        Use tokens to unlock platform features
      </p>

      {/* Balance display */}
      <div style={styles.balBox}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "var(--accent2)" }}>
          {bal.toFixed(2)}
        </div>
        <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 2 }}>PLT</div>
      </div>

      {/* Progress bars for features */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {features.map((f) => {
          const progress = Math.min(bal / f.required, 1);
          const unlocked = bal >= f.required;
          return (
            <div key={f.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                <span>{f.icon} {f.label}</span>
                <span style={{ color: unlocked ? "var(--accent2)" : "var(--muted)" }}>
                  {unlocked ? "Unlocked ✓" : `${bal.toFixed(0)} / ${f.required} PLT`}
                </span>
              </div>
              <div style={styles.track}>
                <div style={{
                  ...styles.fill,
                  width: `${progress * 100}%`,
                  background: unlocked ? "var(--accent2)" : "var(--accent)",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {!account && (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 16 }}>
          Connect your wallet to view balance
        </p>
      )}
    </div>

    <TokenSwap signer={signer} account={account} onSuccess={() => {}} />
  </>
  );
}

const styles = {
  balBox: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "20px",
    textAlign: "center",
  },
  track: {
    height: 6,
    background: "var(--border)",
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    transition: "width .4s ease",
  },
};

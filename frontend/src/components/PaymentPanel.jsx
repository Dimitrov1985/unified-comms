import React, { useState } from "react";
import { ethers } from "ethers";
import { SERVICE_LABELS, ETH_PRICES, PLT_PRICES, handleTx } from "../utils/web3Utils";

const SERVICES = [1, 2, 3];

export default function PaymentPanel({ processor, token, account, onSuccess }) {
  const [payMode, setPayMode]   = useState("eth"); // "eth" | "token"
  const [pending, setPending]   = useState(null);
  const [txMsg,   setTxMsg]     = useState(null);

  const pay = async (serviceId) => {
    if (!account) return;
    setPending(serviceId);
    setTxMsg(null);

    let ok;
    if (payMode === "eth") {
      const price = ethers.parseEther(ETH_PRICES[serviceId]);
      ok = await handleTx(
        processor.payWithETH(serviceId, { value: price }),
        () => setTxMsg(`Оплата через ETH успешна!`),
        (e) => setTxMsg(`Ошибка: ${e}`)
      );
    } else {
      // Approve first, then pay
      const price = ethers.parseEther(PLT_PRICES[serviceId]);
      try {
        const approveTx = await token.approve(await processor.getAddress(), price);
        await approveTx.wait();
        ok = await handleTx(
          processor.payWithToken(serviceId),
          () => setTxMsg(`Оплата токенами PLT успешна!`),
          (e) => setTxMsg(`Ошибка: ${e}`)
        );
      } catch (e) {
        setTxMsg(`Ошибка approve: ${e.message}`);
      }
    }

    if (ok) onSuccess?.();
    setPending(null);
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: 20, fontSize: 18 }}>Оплата сервисов</h2>

      {/* Mode selector */}
      <div style={styles.modeBar}>
        <button
          className={payMode === "eth" ? "btn-primary" : "btn-ghost"}
          style={{ flex: 1 }}
          onClick={() => setPayMode("eth")}
        >
          ETH
        </button>
        <button
          className={payMode === "token" ? "btn-success" : "btn-ghost"}
          style={{ flex: 1 }}
          onClick={() => setPayMode("token")}
        >
          PLT Токены
        </button>
      </div>

      {/* Service cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {SERVICES.map((id) => {
          const svc   = SERVICE_LABELS[id];
          const price = payMode === "eth" ? `${ETH_PRICES[id]} ETH` : `${PLT_PRICES[id]} PLT`;
          return (
            <div key={id} style={styles.serviceRow}>
              <span style={{ fontSize: 22 }}>{svc.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{svc.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{price}</div>
              </div>
              <button
                className={payMode === "eth" ? "btn-primary" : "btn-success"}
                style={{ minWidth: 100 }}
                disabled={!account || pending === id}
                onClick={() => pay(id)}
              >
                {pending === id ? <span className="spinner" /> : "Купить"}
              </button>
            </div>
          );
        })}
      </div>

      {txMsg && (
        <div style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 8,
          background: txMsg.startsWith("Ошибка") ? "var(--danger)22" : "var(--accent2)22",
          color:      txMsg.startsWith("Ошибка") ? "var(--danger)"   : "var(--accent2)",
          fontSize: 13,
        }}>
          {txMsg}
        </div>
      )}

      {!account && (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 14 }}>
          Подключите кошелёк для оплаты
        </p>
      )}
    </div>
  );
}

const styles = {
  modeBar: {
    display: "flex",
    gap: 8,
  },
  serviceRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "14px 16px",
  },
};

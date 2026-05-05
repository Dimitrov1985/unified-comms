import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { handleTx } from "../utils/web3Utils";
import TokenSaleABI from "../contracts/TokenSale.json";
import addresses    from "../contracts/addresses.json";

const RATE = 1000; // 1 ETH = 1000 PLT

export default function TokenSwap({ signer, account, onSuccess }) {
  const [mode,     setMode]     = useState("buy");  // "buy" | "sell"
  const [amount,   setAmount]   = useState("");
  const [output,   setOutput]   = useState("");
  const [pending,  setPending]  = useState(false);
  const [msg,      setMsg]      = useState(null);
  const [saleContract, setSale] = useState(null);

  useEffect(() => {
    if (!signer || !addresses.tokenSale) return;
    setSale(new ethers.Contract(addresses.tokenSale, TokenSaleABI.abi, signer));
  }, [signer]);

  const calcOutput = (val) => {
    setAmount(val);
    if (!val || isNaN(val)) { setOutput(""); return; }
    if (mode === "buy") {
      setOutput((parseFloat(val) * RATE).toFixed(2) + " PLT");
    } else {
      setOutput((parseFloat(val) / RATE).toFixed(6) + " ETH");
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setAmount("");
    setOutput("");
    setMsg(null);
  };

  const execute = async () => {
    if (!saleContract || !amount) return;
    setPending(true);
    setMsg(null);

    if (mode === "buy") {
      await handleTx(
        saleContract.buy({ value: ethers.parseEther(amount) }),
        () => { setMsg(`Куплено ${parseFloat(amount) * RATE} PLT!`); onSuccess?.(); },
        (e) => setMsg(`Ошибка: ${e}`)
      );
    } else {
      const pltWei = ethers.parseEther(amount);
      // Approve first
      try {
        // Get token contract from signer
        const tokenAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
        const tokenContract = new ethers.Contract(addresses.token, tokenAbi, signer);
        const approveTx = await tokenContract.approve(addresses.tokenSale, pltWei);
        await approveTx.wait();
        await handleTx(
          saleContract.sell(pltWei),
          () => { setMsg(`Продано! Получено ${parseFloat(amount) / RATE} ETH`); onSuccess?.(); },
          (e) => setMsg(`Ошибка: ${e}`)
        );
      } catch (e) {
        setMsg(`Ошибка: ${e.message}`);
      }
    }

    setPending(false);
    setAmount("");
    setOutput("");
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Обмен токенов</h2>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          className={mode === "buy" ? "btn-success" : "btn-ghost"}
          style={{ flex: 1 }}
          onClick={() => switchMode("buy")}
        >
          Купить PLT
        </button>
        <button
          className={mode === "sell" ? "btn-danger" : "btn-ghost"}
          style={{ flex: 1 }}
          onClick={() => switchMode("sell")}
        >
          Продать PLT
        </button>
      </div>

      {/* Rate info */}
      <div style={styles.rateBox}>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>Курс обмена</span>
        <span style={{ fontWeight: 600 }}>1 ETH = {RATE} PLT</span>
      </div>

      {/* Input */}
      <div style={{ marginTop: 16 }}>
        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>
          {mode === "buy" ? "Отдаю ETH:" : "Отдаю PLT:"}
        </div>
        <input
          style={styles.input}
          type="number"
          min="0"
          step={mode === "buy" ? "0.001" : "1"}
          placeholder={mode === "buy" ? "0.01" : "10"}
          value={amount}
          onChange={(e) => calcOutput(e.target.value)}
        />
      </div>

      {/* Output */}
      {output && (
        <div style={styles.outputBox}>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>Получу:</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--accent2)" }}>{output}</span>
        </div>
      )}

      {/* Button */}
      <button
        className={mode === "buy" ? "btn-success" : "btn-danger"}
        style={{ width: "100%", marginTop: 16 }}
        disabled={!account || !amount || pending || !saleContract}
        onClick={execute}
      >
        {pending ? <span className="spinner" /> : mode === "buy" ? `Купить PLT` : `Продать PLT`}
      </button>

      {!account && (
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 10 }}>
          Подключите кошелёк для обмена
        </p>
      )}

      {msg && (
        <div style={{
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 8,
          background: msg.startsWith("Ошибка") ? "var(--danger)22" : "var(--accent2)22",
          color:      msg.startsWith("Ошибка") ? "var(--danger)"   : "var(--accent2)",
          fontSize: 13,
        }}>
          {msg}
        </div>
      )}
    </div>
  );
}

const styles = {
  rateBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 14px",
  },
  input: {
    width: "100%",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "var(--text)",
    fontFamily: "inherit",
    fontSize: 16,
    outline: "none",
  },
  outputBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    padding: "12px 14px",
    background: "var(--surface2)",
    border: "1px solid var(--accent2)44",
    borderRadius: 8,
  },
};

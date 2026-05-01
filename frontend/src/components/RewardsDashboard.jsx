import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { handleTx } from "../utils/web3Utils";

const ACHIEVEMENTS = [
  { id: 1, icon: "🥇", name: "Первые шаги",    desc: "Выполни первый платёж" },
  { id: 2, icon: "🤝", name: "Социальная сеть", desc: "Пригласи 5 друзей" },
  { id: 3, icon: "🔥", name: "Верный игрок",    desc: "30 дней подряд" },
];

export default function RewardsDashboard({ rewardSys, account, onReward }) {
  const [stats,      setStats]      = useState(null);
  const [canLogin,   setCanLogin]   = useState(false);
  const [achievements, setAch]      = useState({});
  const [refInput,   setRefInput]   = useState("");
  const [msg,        setMsg]        = useState(null);
  const [pending,    setPending]    = useState(null);

  const load = useCallback(async () => {
    if (!rewardSys || !account) return;
    const s = await rewardSys.getUserStats(account);
    setStats({
      earned:   ethers.formatEther(s.earned),
      referrals: Number(s.referrals),
      streak:    Number(s.streak),
    });
    setCanLogin(await rewardSys.canClaimLogin(account));

    const unlocked = {};
    for (const a of ACHIEVEMENTS) {
      unlocked[a.id] = await rewardSys.unlockedAchievements(account, a.id);
    }
    setAch(unlocked);
  }, [rewardSys, account]);

  useEffect(() => { load(); }, [load]);

  const claimLogin = async () => {
    setPending("login");
    setMsg(null);
    await handleTx(
      rewardSys.claimDailyLogin(),
      () => { setMsg("Ежедневный бонус получен! +2 PLT"); onReward?.(); load(); },
      (e) => setMsg(`Ошибка: ${e}`)
    );
    setPending(null);
  };

  const register = async () => {
    if (!ethers.isAddress(refInput)) { setMsg("Неверный адрес реферера"); return; }
    setPending("ref");
    setMsg(null);
    await handleTx(
      rewardSys.registerWithReferral(refInput),
      () => { setMsg("Зарегистрировано! Реферер получил 50 PLT"); load(); },
      (e) => setMsg(`Ошибка: ${e}`)
    );
    setPending(null);
    setRefInput("");
  };

  if (!account) return (
    <div className="card">
      <p style={{ color: "var(--muted)" }}>Подключите кошелёк для просмотра наград</p>
    </div>
  );

  return (
    <div className="card">
      <h2 style={{ marginBottom: 20, fontSize: 18 }}>Награды и достижения</h2>

      {/* Stats row */}
      {stats && (
        <div style={styles.statsRow}>
          <StatBox label="Заработано PLT" value={parseFloat(stats.earned).toFixed(2)} accent />
          <StatBox label="Рефералы"       value={stats.referrals} />
          <StatBox label="Серия дней"     value={`${stats.streak} 🔥`} />
        </div>
      )}

      {/* Daily login */}
      <div style={{ marginTop: 20 }}>
        <button
          className="btn-success"
          style={{ width: "100%" }}
          disabled={!canLogin || pending === "login"}
          onClick={claimLogin}
        >
          {pending === "login"
            ? <span className="spinner" />
            : canLogin ? "Получить ежедневный бонус" : "Бонус уже получен сегодня ✓"
          }
        </button>
      </div>

      {/* Referral */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Реферальная система</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={styles.input}
            placeholder="Адрес реферера (0x…)"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
          />
          <button className="btn-primary" disabled={pending === "ref"} onClick={register}>
            {pending === "ref" ? <span className="spinner" /> : "Зарегистрироваться"}
          </button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
          Реферер получит 50 PLT за каждого приглашённого
        </p>
      </div>

      {/* Achievements */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Достижения</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} style={{
              ...styles.achRow,
              opacity: achievements[a.id] ? 1 : 0.5,
            }}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>{a.desc}</div>
              </div>
              {achievements[a.id]
                ? <span className="badge badge-green">Разблокировано</span>
                : <span className="badge badge-purple">100 PLT</span>
              }
            </div>
          ))}
        </div>
      </div>

      {msg && (
        <div style={{
          marginTop: 16,
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

function StatBox({ label, value, accent }) {
  return (
    <div style={{
      flex: 1,
      background: "var(--surface2)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "12px 16px",
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        color: accent ? "var(--accent2)" : "var(--text)",
      }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

const styles = {
  statsRow: { display: "flex", gap: 12 },
  achRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "12px 14px",
  },
  input: {
    flex: 1,
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "var(--text)",
    fontFamily: "inherit",
    fontSize: 13,
    outline: "none",
  },
};

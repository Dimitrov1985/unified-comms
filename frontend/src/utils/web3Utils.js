import { ethers } from "ethers";

export const truncateAddr = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

export const fmtEther = (val, decimals = 4) =>
  parseFloat(ethers.formatEther(val)).toFixed(decimals);

export const fmtToken = (val, decimals = 2) =>
  parseFloat(ethers.formatEther(val)).toFixed(decimals);

export const SERVICE_LABELS = {
  1: { name: "Доп. хранилище",    icon: "💾" },
  2: { name: "Премиум на месяц",   icon: "⭐" },
  3: { name: "Премиум на год",     icon: "🏆" },
};

export const ETH_PRICES = {
  1: "0.001",
  2: "0.005",
  3: "0.05",
};

export const PLT_PRICES = {
  1: "100",
  2: "500",
  3: "5000",
};

export async function handleTx(txPromise, onSuccess, onError) {
  try {
    const tx = await txPromise;
    await tx.wait();
    onSuccess?.();
    return true;
  } catch (e) {
    const msg = e?.reason || e?.message || "Transaction failed";
    onError?.(msg);
    return false;
  }
}

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import TokenABI     from "../contracts/PlatformToken.json";
import ProcessorABI from "../contracts/PaymentProcessor.json";
import RewardsABI   from "../contracts/RewardSystem.json";
import addresses    from "../contracts/addresses.json";

export function useWeb3() {
  const [provider,  setProvider]  = useState(null);
  const [signer,    setSigner]    = useState(null);
  const [account,   setAccount]   = useState(null);
  const [chainId,   setChainId]   = useState(null);
  const [balance,   setBalance]   = useState("0");
  const [tokenBal,  setTokenBal]  = useState("0");
  const [connType,  setConnType]  = useState(null); // "metamask" | "walletconnect"
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const [token,     setToken]     = useState(null);
  const [processor, setProcessor] = useState(null);
  const [rewardSys, setRewardSys] = useState(null);

  // ── shared setup after provider is ready ────────────────────────────────
  const _setup = useCallback(async (rawProvider, type) => {
    const prov = new ethers.BrowserProvider(rawProvider);
    const sign = await prov.getSigner();
    const addr = await sign.getAddress();
    const net  = await prov.getNetwork();

    setProvider(prov);
    setSigner(sign);
    setAccount(addr);
    setChainId(Number(net.chainId));
    setConnType(type);

    const tkn  = new ethers.Contract(addresses.token,            TokenABI.abi,     sign);
    const proc = new ethers.Contract(addresses.paymentProcessor, ProcessorABI.abi, sign);
    const rwd  = new ethers.Contract(addresses.rewardSystem,     RewardsABI.abi,   sign);
    setToken(tkn);
    setProcessor(proc);
    setRewardSys(rwd);

    const ethBal = await prov.getBalance(addr);
    const tokBal = await tkn.balanceOf(addr);
    setBalance(ethers.formatEther(ethBal));
    setTokenBal(ethers.formatEther(tokBal));
  }, []);

  // ── MetaMask ─────────────────────────────────────────────────────────────
  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask не обнаружен. Установите MetaMask или используйте WalletConnect.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await _setup(window.ethereum, "metamask");
    } catch (e) {
      setError(e.message || "Ошибка подключения MetaMask");
    } finally {
      setLoading(false);
    }
  }, [_setup]);

  // ── WalletConnect ────────────────────────────────────────────────────────
  const connectWalletConnect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { EthereumProvider } = await import("@walletconnect/ethereum-provider");

      const wcProvider = await EthereumProvider.init({
        projectId: import.meta.env.VITE_WC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694",
        chains: [1],
        optionalChains: [11155111, 31337],
        showQrModal: true,
        metadata: {
          name: "CriptaMoney",
          description: "Крипто-платформа с ERC-20 токенами",
          url: "http://localhost:3001",
          icons: [],
        },
      });

      await wcProvider.enable();
      await _setup(wcProvider, "walletconnect");

      wcProvider.on("disconnect", () => disconnect());
      wcProvider.on("accountsChanged", (accs) => {
        if (accs.length === 0) disconnect();
      });
    } catch (e) {
      if (!e.message?.includes("User rejected")) {
        setError(e.message || "Ошибка WalletConnect");
      }
    } finally {
      setLoading(false);
    }
  }, [_setup]);

  // ── Disconnect ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance("0");
    setTokenBal("0");
    setToken(null);
    setProcessor(null);
    setRewardSys(null);
    setConnType(null);
  }, []);

  // ── Refresh balances ─────────────────────────────────────────────────────
  const refreshBalances = useCallback(async () => {
    if (!provider || !account || !token) return;
    const ethBal = await provider.getBalance(account);
    const tokBal = await token.balanceOf(account);
    setBalance(ethers.formatEther(ethBal));
    setTokenBal(ethers.formatEther(tokBal));
  }, [provider, account, token]);

  // ── MetaMask listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum || connType !== "metamask") return;
    const onAccounts = (accs) => { if (accs.length === 0) disconnect(); else connectMetaMask(); };
    const onChain    = () => connectMetaMask();
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged",    onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged",    onChain);
    };
  }, [connType, connectMetaMask, disconnect]);

  return {
    provider, signer, account, chainId, connType,
    balance, tokenBal,
    token, processor, rewardSys,
    loading, error,
    connectMetaMask, connectWalletConnect, disconnect,
    refreshBalances,
  };
}

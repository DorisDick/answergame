"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";

export const useWallet = () => {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<ethers.ContractRunner | undefined>(undefined);

  // 用于检查链和签名者是否相同
  const sameChain = useRef<(chainId: number | undefined) => boolean>((currentChainId) => {
    return currentChainId === chainId;
  });

  const sameSigner = useRef<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>((currentSigner) => {
    return currentSigner?.address === ethersSigner?.address;
  });

  // 检查是否安装了MetaMask
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  }, []);

  // 连接钱包
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error("请安装MetaMask钱包");
    }

    try {
      const ethereum = window.ethereum as ethers.Eip1193Provider;
      
      // 请求连接
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      if (accounts.length === 0) {
        throw new Error("未选择账户");
      }

      setProvider(ethereum);
      setAccounts(accounts as string[]);
      setIsConnected(true);

      // 获取链ID
      const chainId = await ethereum.request({ method: "eth_chainId" });
      setChainId(Number.parseInt(chainId as string, 16));

      // 创建ethers provider和signer
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      const signer = await ethersProvider.getSigner();
      
      setEthersSigner(signer);
      setEthersReadonlyProvider(ethersProvider);

    } catch (error) {
      console.error("连接钱包失败:", error);
      throw error;
    }
  }, [isMetaMaskInstalled]);

  // 断开连接
  const disconnect = useCallback(() => {
    setProvider(undefined);
    setChainId(undefined);
    setAccounts([]);
    setIsConnected(false);
    setEthersSigner(undefined);
    setEthersReadonlyProvider(undefined);
  }, []);

  // 切换网络
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!provider) {
      throw new Error("钱包未连接");
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: targetChainId === 31337 ? "Hardhat" : (targetChainId === 11155111 ? "Sepolia" : "Unknown Network"),
              rpcUrls: [
                targetChainId === 31337
                  ? "http://localhost:8545"
                  : (targetChainId === 11155111 ? "https://rpc.sepolia.org" : "")
              ],
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }, [provider]);

  // 监听账户变化
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccounts(accounts);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(Number.parseInt(chainId, 16));
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider, disconnect]);

  // 检查是否已连接
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const checkConnection = async () => {
      try {
        const ethereum = window.ethereum as ethers.Eip1193Provider;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        
        if (accounts.length > 0) {
          setProvider(ethereum);
          setAccounts(accounts as string[]);
          setIsConnected(true);

          const chainId = await ethereum.request({ method: "eth_chainId" });
          setChainId(Number.parseInt(chainId as string, 16));

          const ethersProvider = new ethers.BrowserProvider(ethereum);
          const signer = await ethersProvider.getSigner();
          
          setEthersSigner(signer);
          setEthersReadonlyProvider(ethersProvider);
        }
      } catch (error) {
        console.error("检查连接状态失败:", error);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled]);

  return {
    provider,
    chainId,
    accounts,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connect,
    disconnect,
    switchNetwork,
  };
};

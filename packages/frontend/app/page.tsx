"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useFhevm } from "@/fhevm/useFhevm";
import { useAnswerGame } from "@/hooks/useAnswerGame";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { QuestionCard } from "@/components/QuestionCard";
import { UserStats } from "@/components/UserStats";
import { Leaderboard } from "@/components/Leaderboard";

export default function Home() {
  const {
    provider,
    chainId,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    connect,
    switchNetwork,
  } = useWallet();

  const { instance: fhevmInstance, status: fhevmStatus, error: fhevmError } = useFhevm({
    provider,
    chainId,
    enabled: isConnected,
    initialMockChains: {
      31337: "http://localhost:8545",
    },
  });

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const {
    questions,
    userStats,
    leaderboard,
    isLoading,
    error,
    submitAnswer,
    getTokenBalance,
    canAnswer,
    accuracy,
    decryptAndVerify,
    resetLocalAnswers,
    answeredMap,
  } = useAnswerGame({
    instance: fhevmInstance,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    fhevmDecryptionSignatureStorage,
  });

  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
  const [activeTab, setActiveTab] = useState<"questions" | "stats" | "leaderboard">("questions");
  const [resetSeed, setResetSeed] = useState<number>(0);

  // 加载代币余额
  useEffect(() => {
    if (ethersSigner) {
      getTokenBalance().then(setTokenBalance);
    }
  }, [ethersSigner, getTokenBalance]);

  // 切换到Hardhat网络
  const handleSwitchToHardhat = async () => {
    try {
      await switchNetwork(31337);
    } catch (error) {
      console.error("切换网络失败:", error);
    }
  };

  // 切换到Sepolia网络
  const handleSwitchToSepolia = async () => {
    try {
      await switchNetwork(11155111);
    } catch (error) {
      console.error("切换网络失败:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            答题即挖矿
          </h1>
          <p className="text-gray-600 mb-8">
            连接钱包开始答题，答对题目即可获得代币奖励！
          </p>
          <button
            onClick={connect}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            连接 MetaMask
          </button>
        </div>
      </div>
    );
  }

  const allowedChainIds = new Set([31337, 11155111]);
  if (typeof chainId === "number" && !allowedChainIds.has(chainId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            请切换到支持的网络
          </h1>
          <p className="text-gray-600 mb-8">
            当前网络: {chainId}，请切换到 Hardhat (31337) 或 Sepolia (11155111)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleSwitchToHardhat}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              切换到 Hardhat
            </button>
            <button
              onClick={handleSwitchToSepolia}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              切换到 Sepolia
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">答题即挖矿</h1>
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                FHEVM
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                余额: {(Number(tokenBalance) / 1e18).toFixed(2)} ANS
              </div>
              <div className="text-sm text-gray-600">
                网络: {chainId}
              </div>
              <button
                onClick={() => {
                  resetLocalAnswers();
                  setResetSeed((v) => v + 1);
                }}
                className="ml-2 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                title="重置题目状态（调试用）"
              >
                重置题目状态
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Bar */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                fhevmStatus === "ready"
                  ? "bg-green-100 text-green-800"
                  : fhevmStatus === "loading"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                FHEVM: {fhevmStatus}
              </div>
              {fhevmError && (
                <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                  {String(fhevmError.message || fhevmError)}
                </div>
              )}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                canAnswer ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                答题状态: {canAnswer ? "可答题" : "今日已达上限"}
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm">
                错误: {error}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "questions", label: "答题", count: questions.length },
              { id: "stats", label: "个人统计" },
              { id: "leaderboard", label: "排行榜" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === "questions" && (
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">题目列表</h2>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, idx) => (
                    <QuestionCard
                      key={`${question.id}-${idx}`}
                      question={question}
                      onSubmit={submitAnswer}
                      answered={answeredMap?.[question.id]}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">暂无题目</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">个人统计</h2>
              <UserStats
                stats={userStats}
                tokenBalance={tokenBalance}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">排行榜</h2>
              <Leaderboard
                entries={leaderboard}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <UserStats
                stats={userStats}
                tokenBalance={tokenBalance}
                isLoading={isLoading}
              />
              <Leaderboard
                entries={leaderboard}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

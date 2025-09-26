"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import type { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { AnswerGameABI } from "@/abi/AnswerGameABI";
import { ContractAddresses, ContractAddressesByChain } from "@/abi/ContractAddresses";

// 题目类型
export type Question = {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
  isActive: boolean;
};

// 用户统计
export type UserStats = {
  totalAnswered: number;
  correctAnswers: number;
  totalReward: number;
  dailyAnswers: number;
  lastAnswerDate: number;
};

// 答题记录
export type UserAnswer = {
  questionId: number;
  encryptedAnswer: string;
  isCorrect: boolean;
  timestamp: number;
  reward: number;
};

// 排行榜条目
export type LeaderboardEntry = {
  user: string;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  totalReward: number;
  rank: number;
};

export const useAnswerGame = (parameters: {
  instance: FhevmInstance | undefined;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
  fhevmDecryptionSignatureStorage?: GenericStringStorage;
}) => {
  const {
    instance,
    eip1193Provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    fhevmDecryptionSignatureStorage,
  } = parameters;

  // 状态管理
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answeredMap, setAnsweredMap] = useState<Record<number, { ok: boolean }>>({});
  const resetLocalAnswers = useCallback(() => {
    setAnsweredMap({});
  }, []);

  // 合约地址（支持按链ID选择，默认回退到本地地址）
  const addressBook = useMemo(() => {
    const byChain = chainId ? (ContractAddressesByChain as any)?.[String(chainId)] : undefined;
    return byChain ?? (ContractAddresses as any);
  }, [chainId]);
  const answerGameAddress = (addressBook?.AnswerGame?.address ?? undefined) as `0x${string}` | undefined;
  const answerTokenAddress = (addressBook?.AnswerToken?.address ?? undefined) as `0x${string}` | undefined;
  const leaderboardAddress = (addressBook?.Leaderboard?.address ?? undefined) as `0x${string}` | undefined;

  // 使用自动生成的完整 ABI
  const answerGameABI = AnswerGameABI as unknown as any[];

  const answerTokenABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  const leaderboardABI = [
    "function getLeaderboard(uint8 leaderboardType, uint256 offset, uint256 limit) view returns (tuple(address user, uint256 score, uint256 correctAnswers, uint256 totalAnswered, uint256 totalReward, uint256 rank)[])",
    "function getUserRank(uint8 leaderboardType, address user) view returns (uint256)"
  ];

  function getReadonlyProvider(): ethers.Provider | undefined {
    // 在本地链强制使用固定 RPC，避免浏览器钱包连到不同本地节点导致地址不匹配
    if (chainId === 31337) {
      return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    }
    // 其它网络使用现有只读 Provider
    const p: any = ethersReadonlyProvider ?? ethersSigner?.provider;
    if (p && typeof (p as ethers.Provider).getCode === "function") {
      return p as ethers.Provider;
    }
    return undefined;
  }

  // 工具：按 id 去重
  function dedupeById(list: Question[]): Question[] {
    const m = new Map<number, Question>();
    for (const q of list) if (!m.has(q.id)) m.set(q.id, q);
    return Array.from(m.values());
  }

  // 工具：按题目内容去重（题干+选项+正确答案+难度），保留 id 最小的一条
  function createContentKey(q: Question): string {
    return [q.questionText, ...(q.options ?? []), q.correctAnswer, q.difficulty]
      .map((x) => String(x))
      .join("||");
  }
  function dedupeByContent(list: Question[]): Question[] {
    const m = new Map<string, Question>();
    for (const q of list) {
      const k = createContentKey(q);
      const prev = m.get(k);
      if (!prev || q.id < prev.id) {
        m.set(k, q);
      }
    }
    return Array.from(m.values());
  }

  // 获取题目列表（按 id 升序、稳定顺序；将合约返回的 BigInt 转 number）
  const loadQuestions = useCallback(async () => {
    const ro = getReadonlyProvider();
    if (!ro || !answerGameAddress) return;

    try {
      setIsLoading(true);
      const code = await ro.getCode(answerGameAddress);
      if (!code || code === "0x") {
        console.warn("AnswerGame has no code at", answerGameAddress, "on chain", chainId);
        setError("合约地址无代码，请重新部署并生成地址");
        return;
      }
      const contract = new ethers.Contract(answerGameAddress, answerGameABI, ro);
      const total: number = Number(await contract.questionCount());
      const calls: Promise<any>[] = [];
      for (let i = 0; i < total; i++) {
        calls.push(contract.getQuestion(i).catch(() => undefined));
      }
      const rawList = await Promise.all(calls);
      const normalizedRaw: Question[] = (rawList ?? [])
        .filter((q: any) => q && Boolean(q.isActive))
        .map((q: any) => ({
        id: Number(q.id),
        questionText: q.questionText,
        options: Array.isArray(q.options) ? q.options.slice() : [],
        correctAnswer: Number(q.correctAnswer),
        difficulty: Number(q.difficulty),
        isActive: Boolean(q.isActive),
      }));

      // 去重（按 id），然后按 id 升序
      const mapById = new Map<number, Question>();
      for (const q of normalizedRaw) {
        if (!mapById.has(q.id)) mapById.set(q.id, q);
      }
      const normalized = Array.from(mapById.values()).sort(
        (a: Question, b: Question) => a.id - b.id
      );

      // 先按内容去重，再二次按 id 去重保障稳定
      const deduped = dedupeById(dedupeByContent(normalized));
      const count = Math.min(10, deduped.length);
      setQuestions(() => deduped.slice(0, count));
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError("加载题目失败");
    } finally {
      setIsLoading(false);
    }
  }, [ethersReadonlyProvider, ethersSigner, chainId, answerGameAddress]);

  // 获取用户统计
  const loadUserStats = useCallback(async () => {
    const ro = getReadonlyProvider();
    if (!ro || !ethersSigner || !answerGameAddress) return;

    try {
      const code = await ro.getCode(answerGameAddress);
      if (!code || code === "0x") return;
      const contract = new ethers.Contract(answerGameAddress, answerGameABI, ro);
      const stats = await contract.getUserStats(ethersSigner.address);
      setUserStats({
        totalAnswered: Number(stats.totalAnswered),
        correctAnswers: Number(stats.correctAnswers),
        totalReward: Number(stats.totalReward),
        dailyAnswers: Number(stats.dailyAnswers),
        lastAnswerDate: Number(stats.lastAnswerDate),
      });
    } catch (err) {
      console.error("Failed to load user stats:", err);
    }
  }, [ethersReadonlyProvider, ethersSigner, chainId, answerGameAddress]);

  // 获取用户答题记录
  const loadUserAnswers = useCallback(async () => {
    const ro = getReadonlyProvider();
    if (!ro || !ethersSigner || !answerGameAddress) return;

    try {
      const code = await ro.getCode(answerGameAddress);
      if (!code || code === "0x") return;
      const contract = new ethers.Contract(answerGameAddress, answerGameABI, ro);
      const answers = await contract.getUserAnswers(ethersSigner.address, 0, 10);
      setUserAnswers(answers);
    } catch (err) {
      console.error("Failed to load user answers:", err);
    }
  }, [ethersReadonlyProvider, ethersSigner, chainId, answerGameAddress]);

  // 获取排行榜
  const loadLeaderboard = useCallback(async () => {
    const ro = getReadonlyProvider();
    if (!ro || !leaderboardAddress) return;

    try {
      const code = await ro.getCode(leaderboardAddress);
      if (!code || code === "0x") return;
      const contract = new ethers.Contract(leaderboardAddress, leaderboardABI, ro);
      const entries = await contract.getLeaderboard(0, 0, 10); // 获取前10名
      setLeaderboard(entries);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  }, [ethersReadonlyProvider, ethersSigner, chainId, leaderboardAddress]);

  // 解密指定答题记录的密文答案，并调用合约验证
  const decryptAndVerify = useCallback(
    async (answerIndex: number) => {
      // 在 Mock 场景下跳过解密验证流程（submitAnswerMock 已给出明文验证与奖励）
      const isMock = Boolean((instance as unknown as { __isMock?: boolean }).__isMock);
      if (isMock) {
        return;
      }

      if (!instance || !ethersSigner || !ethersReadonlyProvider || !answerGameAddress) {
        return;
      }

      try {
        // 生成/加载解密授权签名
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [answerGameAddress],
          ethersSigner,
          fhevmDecryptionSignatureStorage ?? { getItem: async () => null, setItem: async () => {} }
        );
        if (!sig) {
          setError("无法获取FHE解密签名");
          return;
        }

        // 读取该次答题的密文答案句柄
        const roContract = new ethers.Contract(answerGameAddress, answerGameABI, ethersReadonlyProvider);
        const handle: string = await roContract.getEncryptedAnswer(ethersSigner.address, answerIndex);

        // 调用 userDecrypt 解密出明文答案
        const res = await instance.userDecrypt(
          [{ handle, contractAddress: answerGameAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const decrypted = res[handle];
        if (typeof decrypted === "undefined") {
          setError("解密失败：未找到结果");
          return;
        }

        // 提交明文到合约进行验证（与合约逻辑一致）
        const wrContract = new ethers.Contract(answerGameAddress, answerGameABI, ethersSigner);
        const tx = await wrContract.verifyAnswer(answerIndex, Number(decrypted));
        await tx.wait();

        await loadUserStats();
        await loadUserAnswers();
      } catch (e) {
        console.error("decryptAndVerify error", e);
        setError("解密或验证失败");
      }
    },
    [instance, ethersSigner, ethersReadonlyProvider, answerGameAddress, answerGameABI, fhevmDecryptionSignatureStorage, loadUserStats, loadUserAnswers]
  );

  // 提交答案
  const submitAnswer = useCallback(async (questionId: number, answer: number) => {
    if (!instance || !ethersSigner || !answerGameAddress) {
      throw new Error("Missing required dependencies");
    }

    try {
      setIsLoading(true);
      
      // 创建加密输入
      const input = instance.createEncryptedInput(answerGameAddress, ethersSigner.address);
      input.add32(answer);
      
      // 加密答案
      const encrypted = await input.encrypt();
      
      // 调用提交：Mock 实例下走 verifyAnswer 直通（用于本地无 FHEVM 节点）
      const isMock = Boolean((instance as unknown as { __isMock?: boolean }).__isMock);
      const contract = new ethers.Contract(answerGameAddress, answerGameABI, ethersSigner);
      let tx;
      if (isMock) {
        // 本地 Mock：直接调用合约的 submitAnswerMock
        tx = await contract.submitAnswerMock(questionId, answer);
      } else {
        tx = await contract.submitAnswer(questionId, encrypted.handles[0], encrypted.inputProof);
      }
      await tx.wait();
      
      // 刷新数据
      await loadUserStats();
      await loadUserAnswers();

      // 标记该题已作答并计算对错（前端态）
      const q = questions.find((q) => q.id === questionId);
      const ok = q ? Number(q.correctAnswer) === Number(answer) : false;
      setAnsweredMap((prev) => ({ ...prev, [questionId]: { ok } }));

      // 自动尝试解密并验证最新一条答题记录
      if (ethersSigner && !isMock) {
        const ro = new ethers.Contract(answerGameAddress, answerGameABI, ethersReadonlyProvider ?? ethersSigner);
        const ua = await ro.getUserAnswers(ethersSigner.address, 0, 9999);
        const idx = Math.max(0, Number(ua.length) - 1);
        await decryptAndVerify(idx);
      }
      
      return { ok, correctAnswer: q?.correctAnswer } as const;
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setError("提交答案失败");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [instance, ethersSigner, ethersReadonlyProvider, answerGameAddress, loadUserStats, loadUserAnswers, decryptAndVerify, answerGameABI, questions]);

  // 验证答案
  const verifyAnswer = useCallback(async (answerIndex: number, decryptedAnswer: number) => {
    if (!ethersSigner || !answerGameAddress) {
      throw new Error("Missing required dependencies");
    }

    try {
      setIsLoading(true);
      
      const contract = new ethers.Contract(answerGameAddress, answerGameABI, ethersSigner);
      const tx = await contract.verifyAnswer(answerIndex, decryptedAnswer);
      await tx.wait();
      
      // 刷新数据
      await loadUserStats();
      await loadUserAnswers();
      
    } catch (err) {
      console.error("Failed to verify answer:", err);
      setError("验证答案失败");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ethersSigner, answerGameAddress, loadUserStats, loadUserAnswers]);

  // 重置每日限制
  const resetDailyLimit = useCallback(async () => {
    if (!ethersSigner || !answerGameAddress) {
      throw new Error("Missing required dependencies");
    }

    try {
      setIsLoading(true);
      
      const contract = new ethers.Contract(answerGameAddress, answerGameABI, ethersSigner);
      const tx = await contract.resetDailyLimit();
      await tx.wait();
      
      // 刷新数据
      await loadUserStats();
      
    } catch (err) {
      console.error("Failed to reset daily limit:", err);
      setError("重置每日限制失败");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ethersSigner, answerGameAddress, loadUserStats]);

  // 获取代币余额
  const getTokenBalance = useCallback(async (): Promise<bigint> => {
    if (!ethersReadonlyProvider || !ethersSigner || !answerTokenAddress) {
      return 0n;
    }

    try {
      const contract = new ethers.Contract(answerTokenAddress, answerTokenABI, ethersReadonlyProvider);
      const balance = await contract.balanceOf(ethersSigner.address);
      return balance;
    } catch (err) {
      console.error("Failed to get token balance:", err);
      return 0n;
    }
  }, [ethersReadonlyProvider, ethersSigner, answerTokenAddress]);

  // 自动加载数据：仅在 chainId 变化时刷新，避免严格模式下重复加载
  const lastChainRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (lastChainRef.current !== chainId) {
      lastChainRef.current = chainId;
      loadQuestions();
      loadLeaderboard();
    }
  }, [chainId, loadQuestions, loadLeaderboard]);

  useEffect(() => {
    if (ethersSigner) {
      loadUserStats();
      loadUserAnswers();
    }
  }, [ethersSigner, loadUserStats, loadUserAnswers]);

  return {
    // 数据
    questions,
    userStats,
    userAnswers,
    leaderboard,
    isLoading,
    error,
    
    // 合约地址
    answerGameAddress,
    answerTokenAddress,
    leaderboardAddress,
    
    // 方法
    loadQuestions,
    loadUserStats,
    loadUserAnswers,
    loadLeaderboard,
    submitAnswer,
    verifyAnswer, // 保留原API，但内部默认走 decryptAndVerify 更推荐
    decryptAndVerify,
    resetDailyLimit,
    getTokenBalance,
    resetLocalAnswers,
    
    // 计算属性
    canAnswer: userStats ? userStats.dailyAnswers < 10 : false,
    accuracy: userStats && userStats.totalAnswered > 0 
      ? (userStats.correctAnswers / userStats.totalAnswered) * 100 
      : 0,
    // 本地记录
    answeredMap,
  };
};

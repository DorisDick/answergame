"use client";

import { UserStats as UserStatsType } from "@/hooks/useAnswerGame";

interface UserStatsProps {
  stats: UserStatsType | null;
  tokenBalance: bigint;
  isLoading?: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({
  stats,
  tokenBalance,
  isLoading = false,
}) => {
  const formatTokenBalance = (balance: bigint) => {
    return (Number(balance) / 1e18).toFixed(2);
  };

  const getAccuracy = () => {
    if (!stats || stats.totalAnswered === 0) return 0;
    return ((stats.correctAnswers / stats.totalAnswered) * 100).toFixed(1);
  };

  const getDailyProgress = () => {
    if (!stats) return 0;
    return (stats.dailyAnswers / 10) * 100; // 假设每日限制是10题
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">个人统计</h3>
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">个人统计</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-primary-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            {stats.totalAnswered}
          </div>
          <div className="text-sm text-gray-600">总答题数</div>
        </div>
        
        <div className="text-center p-4 bg-success-50 rounded-lg">
          <div className="text-2xl font-bold text-success-600">
            {stats.correctAnswers}
          </div>
          <div className="text-sm text-gray-600">正确答题数</div>
        </div>
        
        <div className="text-center p-4 bg-warning-50 rounded-lg">
          <div className="text-2xl font-bold text-warning-600">
            {getAccuracy()}%
          </div>
          <div className="text-sm text-gray-600">正确率</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatTokenBalance(tokenBalance)}
          </div>
          <div className="text-sm text-gray-600">代币余额 (ANS)</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>今日答题进度</span>
          <span>{stats.dailyAnswers}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getDailyProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <div className="flex justify-between">
          <span>总奖励:</span>
          <span className="font-medium">{formatTokenBalance(BigInt(stats.totalReward))} ANS</span>
        </div>
        <div className="flex justify-between">
          <span>最后答题:</span>
          <span className="font-medium">
            {stats.lastAnswerDate > 0 
              ? new Date(stats.lastAnswerDate * 1000).toLocaleDateString()
              : "从未答题"
            }
          </span>
        </div>
      </div>
    </div>
  );
};

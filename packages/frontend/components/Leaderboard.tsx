"use client";

import { LeaderboardEntry } from "@/hooks/useAnswerGame";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  isLoading = false,
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatScore = (score: number) => {
    return (score / 1e18).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">排行榜</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">排行榜</h3>
        <p className="text-gray-500 text-center py-8">暂无排行榜数据</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">排行榜</h3>
      
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.user}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              index < 3
                ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-gray-700">
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {formatAddress(entry.user)}
                </div>
                <div className="text-sm text-gray-500">
                  {entry.correctAnswers}/{entry.totalAnswered} 题
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatScore(entry.score)}
              </div>
              <div className="text-sm text-gray-500">
                {formatScore(entry.totalReward)} ANS
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        排行榜每小时更新一次
      </div>
    </div>
  );
};

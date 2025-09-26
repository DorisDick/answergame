// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AnswerGame.sol";

/// @title Leaderboard - 排行榜合约
/// @author AnswerGame Team
/// @notice 管理用户排行榜和奖励分发
contract Leaderboard {
    // 排行榜条目
    struct LeaderboardEntry {
        address user;
        uint256 score; // 综合分数 = 正确率 * 总奖励
        uint256 correctAnswers;
        uint256 totalAnswered;
        uint256 totalReward;
        uint256 rank;
    }
    
    // 排行榜类型
    enum LeaderboardType {
        WEEKLY,  // 周榜
        MONTHLY, // 月榜
        ALL_TIME // 总榜
    }
    
    // 状态变量
    AnswerGame public answerGame;
    address public admin;
    
    // 排行榜数据
    mapping(LeaderboardType => LeaderboardEntry[]) public leaderboards;
    mapping(LeaderboardType => uint256) public lastUpdateTime;
    
    // 奖励配置
    mapping(LeaderboardType => uint256) public rewardPools;
    mapping(LeaderboardType => uint256[]) public rankRewards; // 各排名奖励
    
    // 事件
    event LeaderboardUpdated(LeaderboardType leaderboardType, uint256 timestamp);
    event RewardsDistributed(LeaderboardType leaderboardType, address[] winners, uint256[] amounts);
    
    // 修饰符
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    constructor(address _answerGame) {
        answerGame = AnswerGame(_answerGame);
        admin = msg.sender;
        
        // 初始化奖励配置
        _initializeRewards();
    }
    
    /// @notice 初始化奖励配置
    function _initializeRewards() internal {
        // 周榜奖励：前10名
        rankRewards[LeaderboardType.WEEKLY] = [
            1000 * 10**18, // 第1名
            800 * 10**18,  // 第2名
            600 * 10**18,  // 第3名
            400 * 10**18,  // 第4名
            300 * 10**18,  // 第5名
            200 * 10**18,  // 第6名
            150 * 10**18,  // 第7名
            100 * 10**18,  // 第8名
            80 * 10**18,   // 第9名
            50 * 10**18    // 第10名
        ];
        
        // 月榜奖励：前20名
        rankRewards[LeaderboardType.MONTHLY] = [
            5000 * 10**18, // 第1名
            4000 * 10**18, // 第2名
            3000 * 10**18, // 第3名
            2500 * 10**18, // 第4名
            2000 * 10**18, // 第5名
            1500 * 10**18, // 第6名
            1200 * 10**18, // 第7名
            1000 * 10**18, // 第8名
            800 * 10**18,  // 第9名
            600 * 10**18,  // 第10名
            500 * 10**18,  // 第11名
            400 * 10**18,  // 第12名
            300 * 10**18,  // 第13名
            250 * 10**18,  // 第14名
            200 * 10**18,  // 第15名
            150 * 10**18,  // 第16名
            120 * 10**18,  // 第17名
            100 * 10**18,  // 第18名
            80 * 10**18,   // 第19名
            50 * 10**18    // 第20名
        ];
        
        // 总榜奖励：前50名
        rankRewards[LeaderboardType.ALL_TIME] = new uint256[](50);
        for (uint256 i = 0; i < 50; i++) {
            if (i < 10) {
                rankRewards[LeaderboardType.ALL_TIME][i] = (10000 - i * 500) * 10**18;
            } else if (i < 30) {
                rankRewards[LeaderboardType.ALL_TIME][i] = (5000 - (i - 10) * 100) * 10**18;
            } else {
                rankRewards[LeaderboardType.ALL_TIME][i] = (3000 - (i - 30) * 50) * 10**18;
            }
        }
    }
    
    /// @notice 更新排行榜
    /// @param leaderboardType 排行榜类型
    function updateLeaderboard(LeaderboardType leaderboardType) external {
        require(
            block.timestamp >= lastUpdateTime[leaderboardType] + _getUpdateInterval(leaderboardType),
            "Leaderboard update too frequent"
        );
        
        // 清空当前排行榜
        delete leaderboards[leaderboardType];
        
        // 获取所有用户数据并计算分数
        // 注意：这里需要遍历所有用户，在实际应用中可能需要优化
        // 为了演示，我们假设有一个获取所有用户地址的方法
        
        lastUpdateTime[leaderboardType] = block.timestamp;
        emit LeaderboardUpdated(leaderboardType, block.timestamp);
    }
    
    /// @notice 添加用户到排行榜
    /// @param leaderboardType 排行榜类型
    /// @param user 用户地址
    function addUserToLeaderboard(LeaderboardType leaderboardType, address user) external {
        require(user != address(0), "Invalid user address");
        
        // 获取用户统计
        AnswerGame.UserStats memory stats = answerGame.getUserStats(user);
        
        // 计算综合分数 = 正确率 * 总奖励
        uint256 score = 0;
        if (stats.totalAnswered > 0) {
            uint256 accuracy = (stats.correctAnswers * 10000) / stats.totalAnswered; // 精确到0.01%
            score = (accuracy * stats.totalReward) / 10000;
        }
        
        // 创建排行榜条目
        LeaderboardEntry memory entry = LeaderboardEntry({
            user: user,
            score: score,
            correctAnswers: stats.correctAnswers,
            totalAnswered: stats.totalAnswered,
            totalReward: stats.totalReward,
            rank: 0 // 将在排序后设置
        });
        
        leaderboards[leaderboardType].push(entry);
    }
    
    /// @notice 排序排行榜
    /// @param leaderboardType 排行榜类型
    function sortLeaderboard(LeaderboardType leaderboardType) external {
        LeaderboardEntry[] storage entries = leaderboards[leaderboardType];
        
        // 简单的冒泡排序（实际应用中应使用更高效的排序算法）
        for (uint256 i = 0; i < entries.length - 1; i++) {
            for (uint256 j = 0; j < entries.length - i - 1; j++) {
                if (entries[j].score < entries[j + 1].score) {
                    LeaderboardEntry memory temp = entries[j];
                    entries[j] = entries[j + 1];
                    entries[j + 1] = temp;
                }
            }
        }
        
        // 设置排名
        for (uint256 i = 0; i < entries.length; i++) {
            entries[i].rank = i + 1;
        }
    }
    
    /// @notice 获取排行榜
    /// @param leaderboardType 排行榜类型
    /// @param offset 偏移量
    /// @param limit 限制数量
    function getLeaderboard(
        LeaderboardType leaderboardType,
        uint256 offset,
        uint256 limit
    ) external view returns (LeaderboardEntry[] memory) {
        LeaderboardEntry[] storage entries = leaderboards[leaderboardType];
        uint256 length = entries.length;
        
        if (offset >= length) {
            return new LeaderboardEntry[](0);
        }
        
        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }
        
        LeaderboardEntry[] memory result = new LeaderboardEntry[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = entries[i];
        }
        
        return result;
    }
    
    /// @notice 获取用户排名
    /// @param leaderboardType 排行榜类型
    /// @param user 用户地址
    function getUserRank(LeaderboardType leaderboardType, address user) external view returns (uint256) {
        LeaderboardEntry[] storage entries = leaderboards[leaderboardType];
        
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].user == user) {
                return entries[i].rank;
            }
        }
        
        return 0; // 未上榜
    }
    
    /// @notice 分发排行榜奖励
    /// @param leaderboardType 排行榜类型
    function distributeRewards(LeaderboardType leaderboardType) external onlyAdmin {
        LeaderboardEntry[] storage entries = leaderboards[leaderboardType];
        uint256[] storage rewards = rankRewards[leaderboardType];
        
        require(entries.length > 0, "No entries in leaderboard");
        require(rewards.length > 0, "No rewards configured");
        
        address[] memory winners = new address[](rewards.length);
        uint256[] memory amounts = new uint256[](rewards.length);
        
        for (uint256 i = 0; i < rewards.length && i < entries.length; i++) {
            if (entries[i].rank > 0) {
                winners[i] = entries[i].user;
                amounts[i] = rewards[i];
                
                // 发放奖励通过 AnswerGame 受控入口
                answerGame.distributeReward(entries[i].user, rewards[i]);
            }
        }
        
        emit RewardsDistributed(leaderboardType, winners, amounts);
    }
    
    /// @notice 设置奖励池
    /// @param leaderboardType 排行榜类型
    /// @param amount 奖励数量
    function setRewardPool(LeaderboardType leaderboardType, uint256 amount) external onlyAdmin {
        rewardPools[leaderboardType] = amount;
    }
    
    /// @notice 获取更新间隔
    /// @param leaderboardType 排行榜类型
    function _getUpdateInterval(LeaderboardType leaderboardType) internal pure returns (uint256) {
        if (leaderboardType == LeaderboardType.WEEKLY) {
            return 7 days;
        } else if (leaderboardType == LeaderboardType.MONTHLY) {
            return 30 days;
        } else {
            return 1 days; // 总榜每天更新
        }
    }
    
    /// @notice 更新管理员
    /// @param newAdmin 新管理员地址
    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}

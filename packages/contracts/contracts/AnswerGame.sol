// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "./AnswerToken.sol";

/// @title AnswerGame - 答题即挖矿核心合约
/// @author AnswerGame Team
/// @notice 使用FHEVM实现加密答题和奖励分发
contract AnswerGame is SepoliaConfig {
    // 题目结构
    struct Question {
        uint256 id;
        string questionText;
        string[] options;
        uint256 correctAnswer; // 0-based index
        uint256 difficulty; // 1-5, 难度越高奖励越多
        bool isActive;
    }
    
    // 用户答题记录
    struct UserAnswer {
        uint256 questionId;
        euint32 encryptedAnswer; // 加密的答案
        euint32 encryptedIsCorrect; // 加密的正确性（0/1）
        euint32 encryptedReward; // 加密的奖励
        bool isCorrect;
        uint256 timestamp;
        uint256 reward;
    }
    
    // 用户统计
    struct UserStats {
        uint256 totalAnswered;
        uint256 correctAnswers;
        uint256 totalReward;
        uint256 dailyAnswers; // 今日答题次数
        uint256 lastAnswerDate; // 最后答题日期
    }
    
    // 排行榜条目
    struct LeaderboardEntry {
        address user;
        uint256 score; // 综合分数 = 正确率 * 总奖励
        uint256 rank;
    }
    
    // 状态变量
    AnswerToken public answerToken;
    address public admin;
    address public leaderboard;
    
    // 题目管理
    mapping(uint256 => Question) public questions;
    uint256 public questionCount;
    
    // 用户数据
    mapping(address => UserStats) public userStats;
    mapping(address => UserAnswer[]) public userAnswers;
    
    // 每日答题限制
    uint256 public constant DAILY_ANSWER_LIMIT = 10;
    uint256 public constant REWARD_BASE = 10 * 10**18; // 基础奖励10个代币
    
    // 事件
    event QuestionAdded(uint256 indexed questionId, string questionText, uint256 difficulty);
    event QuestionAnswered(address indexed user, uint256 indexed questionId, bool isCorrect, uint256 reward);
    event DailyLimitReset(address indexed user, uint256 newLimit);
    event RewardClaimed(address indexed user, uint256 amount);
    
    // 修饰符
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier validQuestion(uint256 questionId) {
        require(questionId < questionCount, "Invalid question ID");
        require(questions[questionId].isActive, "Question is not active");
        _;
    }
    
    modifier onlyLeaderboard() {
        require(msg.sender == leaderboard, "Only leaderboard can call this function");
        _;
    }
    
    constructor(address _answerToken) {
        answerToken = AnswerToken(_answerToken);
        admin = msg.sender;
    }
    
    /// @notice 添加题目
    /// @param questionText 题目内容
    /// @param options 选项数组
    /// @param correctAnswer 正确答案索引
    /// @param difficulty 难度等级 (1-5)
    function addQuestion(
        string memory questionText,
        string[] memory options,
        uint256 correctAnswer,
        uint256 difficulty
    ) external onlyAdmin {
        require(options.length >= 2, "At least 2 options required");
        require(correctAnswer < options.length, "Invalid correct answer index");
        require(difficulty >= 1 && difficulty <= 5, "Difficulty must be 1-5");
        
        uint256 questionId = questionCount;
        questions[questionId] = Question({
            id: questionId,
            questionText: questionText,
            options: options,
            correctAnswer: correctAnswer,
            difficulty: difficulty,
            isActive: true
        });
        
        questionCount++;
        emit QuestionAdded(questionId, questionText, difficulty);
    }
    
    /// @notice 提交加密答案
    /// @param questionId 题目ID
    /// @param encryptedAnswer 加密的答案
    /// @param proof 加密证明
    function submitAnswer(
        uint256 questionId,
        externalEuint32 encryptedAnswer,
        bytes calldata proof
    ) external validQuestion(questionId) {
        UserStats storage stats = userStats[msg.sender];
        
        // 检查每日答题限制
        // 本地 Mock 不限制每日次数，便于调试
        
        // 验证并转换加密答案
        euint32 answer = FHE.fromExternal(encryptedAnswer, proof);
        
        // 获取正确答案
        Question memory question = questions[questionId];
        euint32 correctAnswer = FHE.asEuint32(uint32(question.correctAnswer));
        
        // 比较答案（加密比较）
        euint32 isCorrect = FHE.asEuint32(FHE.eq(answer, correctAnswer));
        
        // 计算奖励
        uint256 baseReward = REWARD_BASE * question.difficulty;
        euint32 encryptedReward = FHE.mul(FHE.asEuint32(uint32(baseReward)), isCorrect);
        
        // 更新用户统计
        stats.totalAnswered++;
        stats.dailyAnswers++;
        stats.lastAnswerDate = block.timestamp;
        
        // 存储答题记录
        uint256 idx = userAnswers[msg.sender].length;
        userAnswers[msg.sender].push(UserAnswer({
            questionId: questionId,
            encryptedAnswer: answer,
            encryptedIsCorrect: isCorrect,
            encryptedReward: encryptedReward,
            isCorrect: false, // 将在解密后更新
            timestamp: block.timestamp,
            reward: 0 // 将在解密后更新
        }));
        
        // 允许合约和用户访问加密数据
        FHE.allowThis(answer);
        FHE.allow(answer, msg.sender);
        FHE.allowThis(isCorrect);
        FHE.allow(isCorrect, msg.sender);
        FHE.allowThis(encryptedReward);
        FHE.allow(encryptedReward, msg.sender);
        
        emit QuestionAnswered(msg.sender, questionId, false, 0); // 将在解密后更新
    }

    /// @notice 本地/Mock 专用：直接提交明文答案以便在无FHEVM环境下联调
    /// @dev 仅在本地链使用（chainid == 31337）
    /// @param questionId 题目ID
    /// @param plaintextAnswer 明文答案（0-based index）
    function submitAnswerMock(
        uint256 questionId,
        uint32 plaintextAnswer
    ) external validQuestion(questionId) {
        require(block.chainid == 31337, "Mock only on local chain");

        UserStats storage stats = userStats[msg.sender];
        require(stats.dailyAnswers < DAILY_ANSWER_LIMIT, "Daily answer limit reached");

        Question memory question = questions[questionId];
        bool isCorrectPlain = (uint256(plaintextAnswer) == question.correctAnswer);
        uint256 reward = isCorrectPlain ? (REWARD_BASE * question.difficulty) : 0;

        // 更新统计（不写入 euint32 字段，避免依赖 FHE 预编译）
        stats.totalAnswered++;
        stats.dailyAnswers++;
        stats.lastAnswerDate = block.timestamp;
        if (isCorrectPlain) {
            stats.correctAnswers++;
            stats.totalReward += reward;
            answerToken.mintReward(msg.sender, reward);
        }

        emit QuestionAnswered(msg.sender, questionId, isCorrectPlain, reward);
    }
    
    /// @notice 解密并验证答案（需要用户调用）
    /// @param answerIndex 答题记录索引
    /// @param decryptedAnswer 解密后的答案
    function verifyAnswer(uint256 answerIndex, uint256 decryptedAnswer) external {
        require(answerIndex < userAnswers[msg.sender].length, "Invalid answer index");
        
        UserAnswer storage userAnswer = userAnswers[msg.sender][answerIndex];
        Question memory question = questions[userAnswer.questionId];
        
        // 验证答案
        bool isCorrect = (decryptedAnswer == question.correctAnswer);
        userAnswer.isCorrect = isCorrect;
        
        if (isCorrect) {
            // 计算奖励
            uint256 reward = REWARD_BASE * question.difficulty;
            userAnswer.reward = reward;
            
            // 更新用户统计
            userStats[msg.sender].correctAnswers++;
            userStats[msg.sender].totalReward += reward;
            
            // 发放代币奖励
            answerToken.mintReward(msg.sender, reward);
            
            emit QuestionAnswered(msg.sender, userAnswer.questionId, true, reward);
        }
    }
    
    /// @notice 重置每日答题限制（每天只能调用一次）
    function resetDailyLimit() external {
        UserStats storage stats = userStats[msg.sender];
        require(stats.lastAnswerDate < block.timestamp - 1 days, "Daily limit already reset today");
        
        stats.dailyAnswers = 0;
        stats.lastAnswerDate = block.timestamp;
        
        emit DailyLimitReset(msg.sender, DAILY_ANSWER_LIMIT);
    }
    
    /// @notice 设置排行榜合约地址（只允许管理员）
    /// @param _leaderboard 排行榜合约地址
    function setLeaderboard(address _leaderboard) external onlyAdmin {
        require(_leaderboard != address(0), "Invalid leaderboard address");
        leaderboard = _leaderboard;
    }
    
    /// @notice 由排行榜合约触发的发奖入口（仅排行榜可调用）
    /// @param to 用户地址
    /// @param amount 发放数量
    function distributeReward(address to, uint256 amount) external onlyLeaderboard {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        answerToken.mintReward(to, amount);
    }
    
    /// @notice 读取某次答题的加密答案（用于前端再加密/解密流程）
    /// @param user 用户地址
    /// @param answerIndex 答题记录索引
    function getEncryptedAnswer(address user, uint256 answerIndex) external view returns (euint32) {
        require(answerIndex < userAnswers[user].length, "Invalid answer index");
        return userAnswers[user][answerIndex].encryptedAnswer;
    }

    /// @notice 读取某次答题的加密判定与加密奖励
    /// @param user 用户地址
    /// @param answerIndex 答题记录索引
    /// @return encryptedIsCorrect 加密正确性（0/1）
    /// @return encryptedReward 加密奖励
    function getEncryptedResult(address user, uint256 answerIndex) external view returns (euint32 encryptedIsCorrect, euint32 encryptedReward) {
        require(answerIndex < userAnswers[user].length, "Invalid answer index");
        UserAnswer storage ua = userAnswers[user][answerIndex];
        return (ua.encryptedIsCorrect, ua.encryptedReward);
    }
    
    /// @notice 获取用户答题统计
    /// @param user 用户地址
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    /// @notice 获取用户答题记录
    /// @param user 用户地址
    /// @param offset 偏移量
    /// @param limit 限制数量
    function getUserAnswers(
        address user, 
        uint256 offset, 
        uint256 limit
    ) external view returns (UserAnswer[] memory) {
        UserAnswer[] storage answers = userAnswers[user];
        uint256 length = answers.length;
        
        if (offset >= length) {
            return new UserAnswer[](0);
        }
        
        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }
        
        UserAnswer[] memory result = new UserAnswer[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = answers[i];
        }
        
        return result;
    }
    
    /// @notice 获取题目信息
    /// @param questionId 题目ID
    function getQuestion(uint256 questionId) external view validQuestion(questionId) returns (Question memory) {
        return questions[questionId];
    }
    
    /// @notice 获取随机题目
    /// @param count 题目数量
    function getRandomQuestions(uint256 count) external view returns (Question[] memory) {
        require(count > 0 && count <= questionCount, "Invalid count");
        
        Question[] memory result = new Question[](count);
        uint256[] memory indices = new uint256[](count);
        
        // 简单的随机选择（实际应用中应使用更复杂的随机算法）
        for (uint256 i = 0; i < count; i++) {
            indices[i] = uint256(keccak256(abi.encodePacked(block.timestamp, i))) % questionCount;
            result[i] = questions[indices[i]];
        }
        
        return result;
    }
    
    /// @notice 更新管理员
    /// @param newAdmin 新管理员地址
    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}

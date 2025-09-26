// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title AnswerToken - 答题即挖矿代币
/// @author AnswerGame Team
/// @notice ERC20代币，用于答题奖励系统
contract AnswerToken is ERC20, Ownable, ERC20Permit {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 100万代币
    uint256 public constant REWARD_POOL = 800000 * 10**18; // 80万代币用于奖励池
    uint256 public constant ADMIN_POOL = 200000 * 10**18; // 20万代币用于平台运营
    
    // 奖励池地址
    address public rewardPool;
    
    event RewardPoolUpdated(address indexed oldPool, address indexed newPool);
    
    constructor() 
        ERC20("Answer Token", "ANS") 
        Ownable(msg.sender)
        ERC20Permit("Answer Token")
    {
        // 铸造初始供应量
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // 设置奖励池为合约部署者
        rewardPool = msg.sender;
    }
    
    /// @notice 设置奖励池地址
    /// @param _rewardPool 新的奖励池地址
    function setRewardPool(address _rewardPool) external onlyOwner {
        require(_rewardPool != address(0), "Invalid reward pool address");
        address oldPool = rewardPool;
        rewardPool = _rewardPool;
        emit RewardPoolUpdated(oldPool, _rewardPool);
    }
    
    /// @notice 从奖励池发放代币
    /// @param to 接收者地址
    /// @param amount 发放数量
    function mintReward(address to, uint256 amount) external {
        require(msg.sender == rewardPool, "Only reward pool can mint rewards");
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
    }
    
    /// @notice 销毁代币
    /// @param amount 销毁数量
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /// @notice 获取奖励池余额
    function getRewardPoolBalance() external view returns (uint256) {
        return balanceOf(rewardPool);
    }
}

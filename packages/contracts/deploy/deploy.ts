import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, admin } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // 允许在本地部署时自定义部署者地址（支持 --deployer 与 LOCAL_DEPLOYER）
  const isLocal = ["localhost", "hardhat", "anvil"].includes(hre.network.name);
  const argv = process.argv;
  const getCliArg = (key: string): string | undefined => {
    const withEq = `--${key}=`;
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i];
      if (a.startsWith(withEq)) return a.slice(withEq.length);
      if (a === `--${key}` && i + 1 < argv.length) return argv[i + 1];
    }
    return undefined;
  };
  const candidateFromCli = getCliArg("deployer")?.trim();
  const candidateFromEnv = process.env.LOCAL_DEPLOYER?.trim();
  let deployerAddress = deployer;

  const pickCustomDeployer = candidateFromCli || candidateFromEnv;
  if (pickCustomDeployer && !pickCustomDeployer.startsWith("0x") || (pickCustomDeployer && pickCustomDeployer.length !== 42)) {
    throw new Error(`Invalid custom deployer address: ${pickCustomDeployer}`);
  }
  if (isLocal && pickCustomDeployer) {
    deployerAddress = pickCustomDeployer;
    // Impersonate 并为部署者地址充值
    await hre.network.provider.request({
      method: "hardhat_setBalance",
      params: [deployerAddress, "0x56BC75E2D63100000"], // 100 ETH
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [deployerAddress],
    });
    console.log(`使用自定义本地部署者地址: ${deployerAddress}`);
  } else if (!isLocal && pickCustomDeployer) {
    console.warn(`检测到自定义部署者(${pickCustomDeployer})，但当前网络 '${hre.network.name}' 非本地网络，将忽略该设置。`);
  }

  const deployerSigner = await hre.ethers.getSigner(deployerAddress);

  console.log("Deploying AnswerGame contracts...");
  console.log(`当前网络: ${hre.network.name}`);
  console.log(`默认部署者(来自 namedAccounts): ${deployer}`);
  console.log(`实际使用的部署者: ${deployerAddress}`);

  // 1. 部署AnswerToken
  const answerToken = await deploy("AnswerToken", {
    from: deployerAddress,
    log: true,
  });

  console.log(`AnswerToken deployed at: ${answerToken.address}`);

  // 2. 部署AnswerGame
  const answerGame = await deploy("AnswerGame", {
    from: deployerAddress,
    args: [answerToken.address],
    log: true,
  });

  console.log(`AnswerGame deployed at: ${answerGame.address}`);

  // 3. 部署Leaderboard
  const leaderboard = await deploy("Leaderboard", {
    from: deployerAddress,
    args: [answerGame.address],
    log: true,
  });

  console.log(`Leaderboard deployed at: ${leaderboard.address}`);

  // 4. 设置AnswerToken的奖励池为AnswerGame合约
  const answerTokenContract = await hre.ethers.getContractAt("AnswerToken", answerToken.address, deployerSigner);
  await (await answerTokenContract.setRewardPool(answerGame.address)).wait();
  console.log("AnswerToken reward pool set to AnswerGame contract");

  // 4.1 设置 AnswerGame 的排行榜地址
  const leaderboardAddress = leaderboard.address;
  const answerGameContract = await hre.ethers.getContractAt("AnswerGame", answerGame.address, deployerSigner);
  await (await answerGameContract.setLeaderboard(leaderboardAddress)).wait();
  console.log(`AnswerGame leaderboard set to: ${leaderboardAddress}`);

  // 5. 添加一些示例题目
  
  // 添加示例题目
  const sampleQuestions = [
    {
      questionText: "什么是区块链？",
      options: [
        "一种分布式账本技术",
        "一种加密货币",
        "一种编程语言",
        "一种数据库"
      ],
      correctAnswer: 0,
      difficulty: 1
    },
    {
      questionText: "FHEVM的主要特点是什么？",
      options: [
        "完全同态加密",
        "零知识证明",
        "多方计算",
        "以上都是"
      ],
      correctAnswer: 3,
      difficulty: 3
    },
    {
      questionText: "Solidity是什么？",
      options: [
        "以太坊智能合约编程语言",
        "一种加密货币",
        "一种共识算法",
        "一种哈希函数"
      ],
      correctAnswer: 0,
      difficulty: 2
    },
    {
      questionText: "以下哪个是ERC-20代币标准的特点？",
      options: [
        "可互换性",
        "可分割性",
        "标准化接口",
        "以上都是"
      ],
      correctAnswer: 3,
      difficulty: 2
    },
    {
      questionText: "智能合约的代码是否可以被修改？",
      options: [
        "可以随时修改",
        "部署后不可修改",
        "只有管理员可以修改",
        "取决于合约设计"
      ],
      correctAnswer: 3,
      difficulty: 2
    }
  ];

  console.log("Adding sample questions...");
  for (const question of sampleQuestions) {
    const tx = await answerGameContract.addQuestion(
      question.questionText,
      question.options,
      question.correctAnswer,
      question.difficulty
    );
    await tx.wait();
    console.log(`Added question: ${question.questionText}`);
  }

  console.log("Deployment completed successfully!");
  console.log("Contract addresses:");
  console.log(`- AnswerToken: ${answerToken.address}`);
  console.log(`- AnswerGame: ${answerGame.address}`);
  console.log(`- Leaderboard: ${leaderboard.address}`);
};

export default func;
func.id = "deploy_answer_game";
func.tags = ["AnswerGame", "AnswerToken", "Leaderboard"];

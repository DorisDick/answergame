import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsDir = path.join(__dirname, "../../contracts");
const frontendDir = path.join(__dirname, "..");
const abiDir = path.join(frontendDir, "abi");

// 确保abi目录存在
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

// 合约配置
const contracts = [
  {
    name: "AnswerToken",
    artifactPath: path.join(contractsDir, "artifacts/contracts/AnswerToken.sol/AnswerToken.json"),
    outputPath: path.join(abiDir, "AnswerTokenABI.ts"),
  },
  {
    name: "AnswerGame",
    artifactPath: path.join(contractsDir, "artifacts/contracts/AnswerGame.sol/AnswerGame.json"),
    outputPath: path.join(abiDir, "AnswerGameABI.ts"),
  },
  {
    name: "Leaderboard",
    artifactPath: path.join(contractsDir, "artifacts/contracts/Leaderboard.sol/Leaderboard.json"),
    outputPath: path.join(abiDir, "LeaderboardABI.ts"),
  },
];

// 生成ABI文件
contracts.forEach(({ name, artifactPath, outputPath }) => {
  try {
    if (!fs.existsSync(artifactPath)) {
      console.log(`⚠️  Artifact not found: ${artifactPath}`);
      return;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;

    const content = `// Auto-generated file - do not edit
export const ${name}ABI = ${JSON.stringify(abi, null, 2)};
export const ${name}Bytecode = "${bytecode}";
`;

    fs.writeFileSync(outputPath, content);
    console.log(`✅ Generated ABI for ${name}`);
  } catch (error) {
    console.error(`❌ Failed to generate ABI for ${name}:`, error.message);
  }
});

// 生成合约地址文件（支持多网络：31337 与 11155111）
const deploymentsDir = path.join(contractsDir, "deployments");
const addressesOutputPath = path.join(abiDir, "ContractAddresses.ts");

// 支持的网络目录与元信息
const networkConfigs = [
  { dir: "localhost", chainId: 31337, chainName: "Hardhat" },
  { dir: "sepolia", chainId: 11155111, chainName: "Sepolia" },
  // 兼容某些环境下以链ID为目录名的情况
  { dir: "11155111", chainId: 11155111, chainName: "Sepolia" },
];

/**
 * addressesByChain 结构：
 * {
 *   31337: { AnswerGame: { address, chainId, chainName }, ... },
 *   11155111: { AnswerGame: { address, chainId, chainName }, ... }
 * }
 */
const addressesByChain = {};

for (const net of networkConfigs) {
  const netDir = path.join(deploymentsDir, net.dir);
  if (!fs.existsSync(netDir)) continue;

  const files = fs.readdirSync(netDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const contractName = file.replace(".json", "");
    const deploymentPath = path.join(netDir, file);
    try {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
      if (!addressesByChain[net.chainId]) addressesByChain[net.chainId] = {};
      addressesByChain[net.chainId][contractName] = {
        address: deployment.address,
        chainId: net.chainId,
        chainName: net.chainName,
      };
    } catch (error) {
      console.error(`Failed to read deployment for ${contractName} on ${net.dir}:`, error.message);
    }
  }
}

// 兼容旧用法：保留扁平结构（默认优先 31337，本地开发体验更好；否则取第一个可用网络）
const defaultChainId = addressesByChain[31337]
  ? 31337
  : Number(Object.keys(addressesByChain)[0] || 0);
const flatAddresses = defaultChainId ? (addressesByChain[defaultChainId] || {}) : {};

// 生成地址文件：同时导出多网络与兼容旧结构
const addressesContent = `// Auto-generated file - do not edit
export const ContractAddressesByChain = ${JSON.stringify(addressesByChain, null, 2)} as const;
export const ContractAddresses = ${JSON.stringify(flatAddresses, null, 2)} as const;
`;

fs.writeFileSync(addressesOutputPath, addressesContent);
console.log("✅ Generated contract addresses for networks:", Object.keys(addressesByChain).join(", ") || "(none)");

console.log("🎉 ABI generation completed!");

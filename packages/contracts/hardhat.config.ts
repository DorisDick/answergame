import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import "solidity-coverage";

// Run 'npx hardhat vars setup' to see the list of variables that need to be set
const DEFAULT_MNEMONIC = "test test test test test test test test test test test junk";
function sanitizeMnemonic(m: string | undefined): string {
  const candidate = (m ?? "").trim();
  const words = candidate.split(/\s+/).filter(Boolean);
  if (words.length === 12 || words.length === 24) {
    return candidate;
  }
  console.warn("[hardhat.config] Invalid MNEMONIC detected, falling back to default test mnemonic.");
  return DEFAULT_MNEMONIC;
}
// Prefer process.env overrides for better DX in shells; then fall back to hardhat vars
const ENV_MNEMONIC = (process.env.MNEMONIC ?? "").trim();
const ENV_INFURA_API_KEY = (process.env.INFURA_API_KEY ?? "").trim();
const ENV_SEPOLIA_RPC_URL = (process.env.SEPOLIA_RPC_URL ?? "").trim();

const MNEMONIC: string = sanitizeMnemonic(ENV_MNEMONIC || vars.get("MNEMONIC", DEFAULT_MNEMONIC));
const INFURA_API_KEY: string = (ENV_INFURA_API_KEY || vars.get("INFURA_API_KEY", "")).trim();
const SEPOLIA_RPC_URL: string = (ENV_SEPOLIA_RPC_URL || vars.get("SEPOLIA_RPC_URL", "")).trim();

// Prefer explicit RPC URL if provided; otherwise fall back to Infura (if set); else use public RPC
const PUBLIC_SEPOLIA_RPC_URLS: string[] = [
  "https://rpc.sepolia.org",
  "https://1rpc.io/sepolia",
  "https://ethereum-sepolia.publicnode.com",
  "https://eth-sepolia.public.blastapi.io",
  "https://sepolia.gateway.tenderly.co",
  "https://endpoints.omniatech.io/v1/eth/sepolia/public",
];
function resolveSepoliaUrl(): string {
  if (SEPOLIA_RPC_URL) return SEPOLIA_RPC_URL;
  if (INFURA_API_KEY) {
    return `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
  }
  return PUBLIC_SEPOLIA_RPC_URLS[0];
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
    admin: 1,
  },
  etherscan: {
    apiKey: {
      sepolia: vars.get("ETHERSCAN_API_KEY", ""),
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: 31337,
    },
    anvil: {
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
        count: 10,
      },
      chainId: 31337,
      url: "http://localhost:8545",
    },
    sepolia: {
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0/",
        count: 10,
      },
      chainId: 11155111,
      url: resolveSepoliaUrl(),
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.27",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800,
      },
      evmVersion: "cancun",
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;

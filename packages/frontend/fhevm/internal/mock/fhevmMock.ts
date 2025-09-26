import type { FhevmInstance } from "../../fhevmTypes";

export type FhevmMockInstanceConfig = {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
};

export async function fhevmMockCreateInstance(
  config: FhevmMockInstanceConfig
): Promise<FhevmInstance> {
  // Mock implementation for local development
  // In a real implementation, this would create a mock FHEVM instance
  // that can work with the local Hardhat node
  
  function randomHex(bytes: number): `0x${string}` {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return (
      "0x" + Array.from(arr)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    ) as `0x${string}`;
  }

  const mockInstance: FhevmInstance = {
    getPublicKey: () => ({ publicKeyId: "mock-public-key-id", publicKey: new Uint8Array([1,2,3]) }),
    getPublicParams: (size: number) => ({ publicParams: new Uint8Array([4,5,6]), publicParamsId: `mock-public-params-${size}` }),
    createEncryptedInput: (contractAddress: string, userAddress: string) => ({
      add32: (value: number) => {
        console.log(`Mock: Adding encrypted value ${value}`);
        return (mockInstance as any).createEncryptedInput(contractAddress, userAddress);
      },
      encrypt: async () => ({
        handles: [new Uint8Array(32)],
        inputProof: new Uint8Array(64),
      }),
    } as any),
    publicDecrypt: async (handles: (string | Uint8Array)[]) => {
      const result: Record<string, bigint> = {};
      handles.forEach((h, i) => {
        const key = typeof h === "string" ? h : `u8-${i}`;
        result[key] = BigInt(i + 1);
      });
      return result as any;
    },
    userDecrypt: async (handles: any[], privateKey: string, publicKey: string, signature: string, contractAddresses: string[], userAddress: string, startTimestamp: number, durationDays: number) => {
      console.log("Mock: Decrypting handles", handles);
      const result: Record<string, bigint> = {};
      handles.forEach((handle, index) => {
        const key = typeof handle === "string" ? handle : handle.handle;
        result[key] = BigInt(index + 1);
      });
      return result as any;
    },
    createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: string | number, durationDays: string | number) => ({
      domain: { chainId: 31337, name: "mock", verifyingContract: contractAddresses[0] ?? "0x0000000000000000000000000000000000000000", version: "1" },
      message: {},
      primaryType: "Mock",
      types: {},
    }),
    generateKeypair: () => ({ publicKey: "0x01", privateKey: "0x02" }),
  } as any;

  // 标记为 Mock，供前端分支逻辑识别
  (mockInstance as unknown as { __isMock: boolean }).__isMock = true;

  return mockInstance;
}

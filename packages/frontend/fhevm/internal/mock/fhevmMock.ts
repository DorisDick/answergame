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
    getPublicKey: () => "mock-public-key",
    getPublicParams: (size: number) => `mock-public-params-${size}`,
    createEncryptedInput: (contractAddress: string, userAddress: string) => ({
      add32: (value: number) => {
        console.log(`Mock: Adding encrypted value ${value}`);
      },
      encrypt: async () => ({
        // 返回符合 BytesLike 的 32 字节句柄与 64 字节证明
        handles: [randomHex(32)],
        inputProof: randomHex(64),
      }),
    }),
    userDecrypt: async (handles: any[], privateKey: string, publicKey: string, signature: string, contractAddresses: string[], userAddress: string, startTimestamp: number, durationDays: number) => {
      console.log("Mock: Decrypting handles", handles);
      // Return mock decrypted values
      const result: Record<string, bigint> = {};
      handles.forEach((handle, index) => {
        result[handle.handle] = BigInt(index + 1); // Mock decrypted value
      });
      return result;
    },
  };

  // 标记为 Mock，供前端分支逻辑识别
  (mockInstance as unknown as { __isMock: boolean }).__isMock = true;

  return mockInstance;
}

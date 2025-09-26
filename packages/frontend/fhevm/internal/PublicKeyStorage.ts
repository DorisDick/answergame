export type PublicKeyStorageType = {
  publicKey: string;
  publicParams: string;
};

const STORAGE_KEY_PREFIX = "fhevm_public_key_";

export async function publicKeyStorageGet(
  aclAddress: `0x${string}`
): Promise<PublicKeyStorageType> {
  const key = STORAGE_KEY_PREFIX + aclAddress.toLowerCase();
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    throw new Error(`No public key found for ACL address: ${aclAddress}`);
  }
  
  try {
    const parsed = JSON.parse(stored);
    return {
      publicKey: parsed.publicKey,
      publicParams: parsed.publicParams,
    };
  } catch (e) {
    throw new Error(`Invalid public key storage format for ACL address: ${aclAddress}`);
  }
}

export async function publicKeyStorageSet(
  aclAddress: `0x${string}`,
  publicKey: string,
  publicParams: string
): Promise<void> {
  const key = STORAGE_KEY_PREFIX + aclAddress.toLowerCase();
  const data = {
    publicKey,
    publicParams,
  };
  
  localStorage.setItem(key, JSON.stringify(data));
}

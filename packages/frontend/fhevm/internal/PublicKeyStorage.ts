import type { PublicParams } from "@zama-fhe/relayer-sdk/web";

export type PublicKeyStorageType = {
  publicKey: { data: Uint8Array | null; id: string | null } | null;
  publicParams: PublicParams<Uint8Array> | null;
};

type StoredFormat = {
  publicKey: { data: string | null; id: string | null } | null;
  publicParams: { [bits: string]: { publicParams: string; publicParamsId: string } } | null;
};

const STORAGE_KEY_PREFIX = "fhevm_public_key_";

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(u8: Uint8Array): string {
  let binary = "";
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary);
}

export async function publicKeyStorageGet(
  aclAddress: `0x${string}`
): Promise<PublicKeyStorageType> {
  const key = STORAGE_KEY_PREFIX + aclAddress.toLowerCase();
  const stored = localStorage.getItem(key);

  if (!stored) {
    throw new Error(`No public key found for ACL address: ${aclAddress}`);
  }

  try {
    const parsed = JSON.parse(stored) as StoredFormat;

    const pk = parsed.publicKey
      ? {
          data: parsed.publicKey.data ? base64ToUint8Array(parsed.publicKey.data) : null,
          id: parsed.publicKey.id ?? null,
        }
      : null;

    const ppEntries = parsed.publicParams ? Object.entries(parsed.publicParams) : [];
    const pp: PublicParams<Uint8Array> | null = ppEntries.length
      ? ppEntries.reduce((acc, [k, v]) => {
          const bits = Number(k) as keyof PublicParams;
          (acc as any)[bits] = {
            publicParams: base64ToUint8Array(v.publicParams),
            publicParamsId: v.publicParamsId,
          };
          return acc;
        }, {} as PublicParams<Uint8Array>)
      : null;

    return { publicKey: pk, publicParams: pp };
  } catch (e) {
    throw new Error(`Invalid public key storage format for ACL address: ${aclAddress}`);
  }
}

export async function publicKeyStorageSet(
  aclAddress: `0x${string}`,
  publicKey: { publicKeyId: string; publicKey: Uint8Array } | null,
  publicParams: { publicParams: Uint8Array; publicParamsId: string } | null
): Promise<void> {
  const key = STORAGE_KEY_PREFIX + aclAddress.toLowerCase();

  const data: StoredFormat = {
    publicKey: publicKey
      ? {
          data: publicKey.publicKey ? uint8ArrayToBase64(publicKey.publicKey) : null,
          id: publicKey.publicKeyId ?? null,
        }
      : null,
    publicParams: publicParams
      ? {
          // We currently cache the 2048 bits params only
          "2048": {
            publicParams: uint8ArrayToBase64(publicParams.publicParams),
            publicParamsId: publicParams.publicParamsId,
          },
        }
      : null,
  };

  localStorage.setItem(key, JSON.stringify(data));
}

"use client";

import { useMemo } from "react";
import { createInMemoryStringStorage, GenericStringStorage } from "@/fhevm/GenericStringStorage";

export function useInMemoryStorage(): { storage: GenericStringStorage } {
  const storage = useMemo(() => createInMemoryStringStorage().storage, []);
  return { storage };
}



export type GenericStringStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem?: (key: string) => Promise<void>;
};

export function createInMemoryStringStorage(): { storage: GenericStringStorage } {
  const map = new Map<string, string>();
  return {
    storage: {
      async getItem(key: string) {
        return map.has(key) ? map.get(key)! : null;
      },
      async setItem(key: string, value: string) {
        map.set(key, value);
      },
      async removeItem(key: string) {
        map.delete(key);
      },
    },
  };
}



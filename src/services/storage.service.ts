// Simple Storage shim for Web
export const Storage = {
  setItem: async (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  getItem: async (key: string) => {
    return localStorage.getItem(key);
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key);
  },
  multiRemove: async (keys: string[]) => {
    keys.forEach(key => localStorage.removeItem(key));
  },
  clear: async () => {
    localStorage.clear();
  }
};

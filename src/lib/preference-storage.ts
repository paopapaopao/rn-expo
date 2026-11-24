import Storage from 'expo-sqlite/kv-store';

// Small synchronous key-value storage for user preferences (SQLite-backed on iOS and Android)
export const preferenceStorage = {
  get: (key: string): string | null => Storage.getItemSync(key),
  set: (key: string, value: string) => Storage.setItemSync(key, value),
};

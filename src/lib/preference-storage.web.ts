// Web version: the browser's localStorage (unavailable during static rendering, hence the guards)
export const preferenceStorage = {
  get: (key: string): string | null =>
    typeof localStorage === 'undefined' ? null : localStorage.getItem(key),
  set: (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  },
};

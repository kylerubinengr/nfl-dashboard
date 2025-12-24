const cache = new Map<string, any>();

export const weatherCache = {
  get: (key: string) => {
    return cache.get(key) || null;
  },
  set: (key: string, data: any) => {
    cache.set(key, data);
  },
};

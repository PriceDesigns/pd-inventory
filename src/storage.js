// Temporary storage layer — browser-local for now, matching the same
// get/set interface the app already uses. This gets swapped for a real
// shared Supabase-backed version once that's set up, same as the
// production tracker.

export const storage = {
  async get(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return { key, value: raw, shared: false };
  },

  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value, shared: false };
  },

  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true, shared: false };
  },
};

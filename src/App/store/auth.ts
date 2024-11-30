import { Auth, User } from "@types";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@constants";

export interface AuthSlice {
  auth: Auth | null;
  logout: () => void;
  login: (payload: Auth) => void;
  setAvatar: (photoURL: string) => void;
}

const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  auth: null,
  logout: () => set((state) => ({ ...state, auth: null })),
  login: (auth) => set((state) => ({ ...state, auth })),
  setAvatar: (photoURL) =>
    set((state) => ({
      ...state,
      auth: {
        ...(state?.auth as Auth),
        user: { ...state?.auth?.user, photoURL } as User,
      },
    })),
});

export default persist(createAuthSlice, {
  name: AUTH_STORAGE_KEY,
  onRehydrateStorage: () => (state) => {
    if (!state?.auth?.token) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },
});

import { Auth } from "@types";
import { StateCreator } from "zustand";

export interface AuthSlice {
  auth: Auth | null;
  logout: () => void;
  login: (payload: Auth) => void;
}

const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  auth: null,
  logout: () => set((state) => ({ ...state, auth: null })),
  login: (auth) => set((state) => ({ ...state, auth })),
});

export default createAuthSlice;

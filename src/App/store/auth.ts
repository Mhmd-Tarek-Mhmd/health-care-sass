import { Auth } from "@types";
import { StateCreator } from "zustand";

export interface AuthSlice {
  auth: Auth | null;
  logout: () => void;
  login: (payload: {}) => void;
}

const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  auth: null,
  logout: () => set((state) => ({ ...state, auth: null })),
  login: (payload) => set((state) => ({ ...state, auth: payload as Auth })),
});

export default createAuthSlice;

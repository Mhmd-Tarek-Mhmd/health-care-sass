import { StateCreator } from "zustand";

export interface AuthSlice {
  auth: {};
  login: (payload: {}) => void;
}

const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  auth: {},
  login: (payload) => set(() => ({ auth: payload })),
});

export default createAuthSlice;

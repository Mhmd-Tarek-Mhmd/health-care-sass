import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@constants";

import createAuthSlice, { AuthSlice } from "./auth";

type Store = AuthSlice;

export const useAppStore = create<Store>()((...a) => ({
  ...persist(createAuthSlice, { name: AUTH_STORAGE_KEY })(...a),
}));

const Store = useAppStore.getState();
export default Store;

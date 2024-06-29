import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@constants";

import createAuthSlice, { AuthSlice } from "./auth";

type Store = AuthSlice;

const useAppStore = create<Store>()((...a) => ({
  ...persist(createAuthSlice, { name: AUTH_STORAGE_KEY })(...a),
}));

export default useAppStore;

import { create } from "zustand";

import createAuthSlice, { AuthSlice } from "./auth";

type Store = AuthSlice;

export const useAppStore = create<Store>()((...a) => ({
  ...createAuthSlice(...a),
}));

const Store = useAppStore.getState();
export default Store;

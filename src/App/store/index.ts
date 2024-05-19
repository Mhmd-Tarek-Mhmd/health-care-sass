import { create } from "zustand";

type Store = {};

const useAppStore = create<Store>()(() => ({}));

export default useAppStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserResponse } from "../types/api";

type UserState = {
  userData: UserResponse | null;
  setUserData: (data: UserResponse) => void;
  clearUserData: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userData: null,
      setUserData: (data) => set({ userData: data }),
      clearUserData: () => set({ userData: null }),
    }),
    { name: "user-store" }
  )
);

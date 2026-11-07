import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "aws-amplify/auth";
import { queryPersister } from "../api/queryClient";
import { useLanguageStore } from "../stores/languageStore";
import { useUserStore } from "../stores/userStore";

export function useSignOut() {
  const queryClient = useQueryClient();
  const clearUserData = useUserStore((state) => state.clearUserData);
  const resetLanguages = useLanguageStore((state) => state.reset);

  return () => {
    clearUserData();
    resetLanguages();
    queryClient.clear();
    void queryPersister.removeClient();
    void signOut();
  };
}

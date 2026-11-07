import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: "rq-cache",
  throttleTime: 1000,
});

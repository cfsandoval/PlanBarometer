import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Simple query function that works with standard fetch
const defaultQueryFn = async ({ queryKey }: { queryKey: any }) => {
  const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
  
  console.log('Making fetch request to:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: "include",
  });

  console.log('Response status:', response.status);

  if (response.status === 401) {
    throw new Error("401: Unauthorized");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

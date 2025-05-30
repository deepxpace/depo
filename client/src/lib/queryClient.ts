import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = "/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  path: string,
  config: RequestInit = {}
): Promise<Response> {
  // Remove leading /api from path if it exists to avoid double prefix
  const cleanPath = path.startsWith('/api') ? path.substring(4) : path;
  const url = `${API_BASE_URL}${cleanPath}`;

  if (method === "POST" || method === "PUT") {
    config = {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };
  }

  const response = await fetch(url, { method, ...config });
  await throwIfResNotOk(response);
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
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
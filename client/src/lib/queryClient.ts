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

  const response = await fetch(url, { 
    method, 
    credentials: "include", // Always include cookies for session
    ...config 
  });
  await throwIfResNotOk(response);
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`API error: ${res.status}`, errorText);
        
        if (res.status === 401) {
          // For unauthorized errors, handle based on configuration
          if (unauthorizedBehavior === "throw") {
            throw new Error(`Unauthorized: ${errorText}`);
          } else {
            return null;
          }
        }
        
        throw new Error(`${res.status}: ${errorText || res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
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
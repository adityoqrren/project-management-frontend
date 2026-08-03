import { ApiError, ApiErrorData } from "./errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

// 🔥 Flag to indicate refresh process is running
let isRefreshing = false;

// Prevent multiple redirects
let isRedirecting = false;

// 🔥 Queue for requests waiting for token refresh
let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

type ApiFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

// 🔥 Process all queued requests
function processQueue(error: unknown | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });

  failedQueue = [];
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const doFetch = async (): Promise<Response> => {
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include", // 🔥 send cookies
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  };

  let res = await doFetch();

  // 🔥 HANDLE 401 (token expired)
  if (res.status === 401 && !options.skipAuthRefresh) {
    console.log(`token expired? ${JSON.stringify(res.body)}`)
    // If refresh already in progress → queue this request
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async () => {
            try {
              const retryRes = await doFetch();
              const retryData = await handleResponse<T>(retryRes);
              resolve(retryData);
            } catch (err) {
              reject(err);
            }
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // 🔥 Call refresh token endpoint
      const refreshRes = await fetch(`${BASE_URL}/api/auth/token`, {
        method: "PUT",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw new ApiError(
          "Session expired",
          401
        );
      }

      // Wake up queued requests
      processQueue(null);

      // Retry original request
      res = await doFetch();
    } catch {
      const authError = new ApiError(
        "Session expired",
        401
      );

      // Reject all queued requests
      processQueue(authError);

      // Redirect only once
      if (
        typeof window !== "undefined" &&
        !isRedirecting
      ) {
        isRedirecting = true;

        window.location.replace("/auth/login");
      }

      throw authError;
    }
    finally {
      isRefreshing = false;
    }
  }

  return handleResponse<T>(res);
}

// 🔥 Extract response handling (biar reusable)
async function handleResponse<T>(res: Response): Promise<T> {
  let data: unknown;

  try {
    data = await res.json();
  } catch {
    throw new ApiError("Invalid server response", res.status);
  }

  if (typeof data !== "object" || data === null) {
    throw new ApiError("Unexpected response format", res.status);
  }

  const typedData = data as ApiErrorData;

  if (!res.ok) {
    throw new ApiError(
      typedData.message ?? "Request failed",
      res.status,
      typedData
    );
  }

  if (typedData.status && typedData.status !== "success") {
    throw new ApiError(
      typedData.message ?? "Operation failed",
      res.status,
      typedData
    );
  }

  return data as T;
}
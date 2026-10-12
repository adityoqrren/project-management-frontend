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
  skipAuthRedirect?: boolean;
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

const apiFetchInstanceId =
  Math.random().toString(36).slice(2, 8);

console.log(
  "[apiFetch module loaded]",
  apiFetchInstanceId
);

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  console.log(
    "[401]",
    apiFetchInstanceId,
    endpoint,
    {
      isRefreshing,
    }
  );

  const doFetch = async (): Promise<Response> => {
    const isFormData = options.body instanceof FormData;

    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(isFormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });
  };

  let res = await doFetch();

  // 🔥 HANDLE 401 (token expired)
  if (res.status === 401 && !options.skipAuthRefresh) {
    console.log(`token expired? ${JSON.stringify(res.body)}`)
    // If refresh already in progress → queue this request

    console.log("[401]", endpoint, {
      isRefreshing,
      skipAuthRefresh: options.skipAuthRefresh,
    });

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
      const refreshId = Math.random().toString(36).slice(2, 8);

      console.log(
        `[REFRESH ${refreshId}] START`,
        new Date().toISOString()
      );

      // get new access token with refreshToken
      const refreshRes = await fetch(`${BASE_URL}/api/auth/token`, {
        method: "PUT",
        credentials: "include",
      });

      console.log(
        `[REFRESH ${refreshId}] END`,
        refreshRes.status,
        new Date().toISOString()
      );

      if (!refreshRes.ok) {

        if (refreshRes.status === 401) {
          throw new ApiError("Session expired", 401);
        }

        throw new ApiError(
          "Failed to refresh session",
          refreshRes.status
        );
      }

      // Wake up queued requests
      processQueue(null);

      // Retry original request
      res = await doFetch();
    } catch (error) {

      console.log(`error : ${error}`);

      // Reject all queued requests
      processQueue(error);

      // Redirect only when refresh token is invalid or expired
      if (
        error instanceof ApiError &&
        error.statusCode === 401 &&
        !options.skipAuthRedirect
      ) {
        if (
          typeof window !== "undefined" &&
          !isRedirecting
        ) {
          isRedirecting = true;

          window.location.replace("/auth/login");
        }
      }

      throw error;
    } finally {
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
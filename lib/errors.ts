// Type untuk data error dari backend
export interface ApiErrorData {
  status?: string;
  message?: string;
  errors?: Record<string, string>;
}

// Custom error class
export class ApiError extends Error {
  statusCode: number;
  data?: ApiErrorData;

  constructor(message: string, statusCode: number, data?: ApiErrorData) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

// ✅ Type guard (yang kamu tanyakan)
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function appendQueryParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined
) {
  if (value !== undefined && value !== "") {
    searchParams.set(key, String(value));
  }
}

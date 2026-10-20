export function getInitials(fullName?: string | null): string {
  if (!fullName?.trim()) {
    return "?";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
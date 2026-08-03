export function toUtc(localDateTime: string): string {
  if (!localDateTime) return ""

  return new Date(localDateTime).toISOString()
}

export function toLocalInput(utcDateTime: string): string {
  if (!utcDateTime) return ""

  const date = new Date(utcDateTime)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// from ISO string datetime to relative time in local date
export function formatRelativeTime(
  date: string
) {
  const now = new Date();

  const target =
    new Date(date);

  const diff =
    now.getTime() -
    target.getTime();

  const seconds =
    Math.floor(diff / 1000);

  const minutes =
    Math.floor(seconds / 60);

  const hours =
    Math.floor(minutes / 60);

  const days =
    Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return target.toLocaleDateString();
}
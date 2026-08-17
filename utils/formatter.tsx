// Format date to dd/mm/yyyy
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

//to english format date eg : 02 Feb 2025
export function formatDateLocal(dateString: string) {
  return new Date(dateString).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
}

//to english format time eg : 18:00
export function formatTimeLocal(isoString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoString));
}

export function formatDateTimeLocal(
  isoString: string
): {
  date: string;
  time: string;
} {
  return {
    date: formatDateLocal(isoString),
    time: formatTimeLocal(isoString),
  };
}

// format datetime string local
export function formatDateTimeStringLocal(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

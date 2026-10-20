const avatarColors = [
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-800",
  "bg-indigo-100 text-indigo-700",
  "bg-red-100 text-red-700",
  "bg-cyan-100 text-cyan-700",
  "bg-lime-100 text-lime-800",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

export function getAvatarColor(id: string): string {
  let hash = 0;

  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return avatarColors[hash % avatarColors.length];
}

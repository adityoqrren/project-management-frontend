interface NotificationSkeletonProps {
  rows?: number;
}

export default function NotificationSkeleton({
  rows = 4,
}: NotificationSkeletonProps) {
  return (
    <div>

      {Array.from({
        length: rows,
      }).map((_, index) => (

        <div
          key={index}
          className="border-b px-4 py-3"
        >

          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

          <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-100" />

          <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-gray-100" />

        </div>

      ))}

    </div>
  );
}
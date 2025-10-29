export default function SkeletonList({ count = 6, height = 96 }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border animate-pulse bg-gray-50"
          style={{ height }}
        />
      ))}
    </div>
  );
}

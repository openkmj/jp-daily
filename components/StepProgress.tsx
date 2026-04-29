export function StepProgress({
  total,
  filled,
}: {
  total: number;
  filled: number;
}) {
  return (
    <div className="flex flex-1 gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        >
          <div
            className="h-full bg-zinc-900 transition-all dark:bg-zinc-100"
            style={{ width: i < filled ? "100%" : "0%" }}
          />
        </div>
      ))}
    </div>
  );
}

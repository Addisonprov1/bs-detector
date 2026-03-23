export function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-[3px] w-full rounded bg-[var(--color-border)]">
      <div
        className="h-full rounded transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

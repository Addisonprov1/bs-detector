export function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      className="h-[4px] w-full"
      style={{
        border: '1px solid',
        borderColor: '#808080 #dfdfdf #dfdfdf #808080',
        background: '#ffffff',
      }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

interface Props {
  value: number; // 0–100
  label?: string;
  showValue?: boolean;
  height?: string;
}

const colorAt = (v: number) =>
  v >= 75 ? "#10b981" : v >= 60 ? "#34d399" : v >= 45 ? "#f59e0b" : "#6b7280";

export default function ConfidenceMeter({ value, label, showValue = true, height = "h-2" }: Props) {
  const color = colorAt(value);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-muted">{label}</span>}
          {showValue && (
            <span className="text-xs font-bold" style={{ color }}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div className={`stat-bar-track ${height}`}>
        <div
          className={`stat-bar-fill ${height}`}
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

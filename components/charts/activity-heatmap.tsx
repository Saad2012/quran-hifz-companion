import { HeatmapPoint } from "@/types";
import { cn } from "@/utils/cn";

const INTENSITY_CLASSES = [
  "bg-[var(--surface-soft)]",
  "bg-[rgba(188,116,74,0.18)]",
  "bg-[rgba(188,116,74,0.28)]",
  "bg-[rgba(188,116,74,0.42)]",
  "bg-[rgba(188,116,74,0.56)]",
  "bg-[rgba(188,116,74,0.72)]",
];

export function ActivityHeatmap({ data }: { data: HeatmapPoint[] }) {
  return (
    <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(18,minmax(0,1fr))]">
      {data.map((point) => (
        <div
          key={point.date}
          title={`${point.date} | حفظ ${point.memorizationPages} | مراجعة ${point.reviewPages}`}
          className={cn(
            "aspect-square rounded-lg border border-white/30",
            INTENSITY_CLASSES[point.intensity] ?? INTENSITY_CLASSES[0],
          )}
        />
      ))}
    </div>
  );
}

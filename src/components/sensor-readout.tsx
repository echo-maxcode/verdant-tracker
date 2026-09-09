import { useEffect, useState } from "react";
import { Radio, Thermometer, Waves } from "lucide-react";
import {
  generateReading,
  hasSensor,
  moistureLabel,
  type SensorReading,
} from "@/lib/sensors";

/** Polls the local sensor signal so readings visibly tick along. */
export function useLiveSensor(plantId: string, intervalMs = 4000) {
  const connected = hasSensor(plantId);
  const [reading, setReading] = useState<SensorReading | null>(null);

  useEffect(() => {
    if (!connected) return;
    const tick = () => setReading(generateReading(plantId, new Date()));
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [plantId, connected, intervalMs]);

  return { connected, reading };
}

export function LiveSensorDot({ label = "Live Sensor Feed" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-2.5 py-1 text-xs font-semibold text-leaf">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      {label}
    </span>
  );
}

function MoistureRing({ value }: { value: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <span className="relative flex h-12 w-12 items-center justify-center">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--secondary)" strokeWidth="5" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-display text-xs font-bold text-foreground">
        {Math.round(value)}%
      </span>
    </span>
  );
}

export function SensorReadout({ plantId }: { plantId: string }) {
  const { connected, reading } = useLiveSensor(plantId);
  if (!connected || !reading) return null;
  const { label } = moistureLabel(reading.moisture);

  return (
    <div className="mt-3 rounded-xl border border-border bg-sage/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <LiveSensorDot />
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Radio className="h-3 w-3" /> updating
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <MoistureRing value={reading.moisture} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">
            Soil moisture · {label}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5" /> {reading.temperature.toFixed(1)}°C
            </span>
            <span className="inline-flex items-center gap-1">
              <Waves className="h-3.5 w-3.5" /> {Math.round(reading.humidity)}% RH
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

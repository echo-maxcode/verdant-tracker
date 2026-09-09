import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Flame, Radio, Sprout, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { Line, LineChart } from "recharts";
import { PageHeader } from "@/components/app-shell";
import { LiveSensorDot } from "@/components/sensor-readout";
import { SENSOR_PLANT_IDS, type SensorReading } from "@/lib/sensors";
import {
  longestStreak,
  usePlantStore,
  waterSavedThisMonth,
  wateringsPerDay,
  weeklyWaterUse,
} from "@/lib/plants";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Plant Care & Water-Saving Log" },
      {
        name: "description",
        content:
          "Watering trends over 30 days and water saved versus a fixed baseline schedule.",
      },
      { property: "og:title", content: "Analytics — Plant Care & Water-Saving Log" },
      {
        property: "og:description",
        content:
          "Watering trends over 30 days and water saved versus a fixed baseline schedule.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const log = usePlantStore((s) => s.log);
  const plants = usePlantStore((s) => s.plants);

  const daily = useMemo(() => wateringsPerDay(log, 30), [log]);
  const weekly = useMemo(
    () => weeklyWaterUse(log, plants.length),
    [log, plants.length],
  );
  const streak = useMemo(() => longestStreak(log), [log]);
  const saved = useMemo(
    () => waterSavedThisMonth(log, plants.length),
    [log, plants.length],
  );

  return (
    <div className="pb-4">
      <PageHeader
        title="Analytics"
        subtitle="Water-saving insights at a glance."
      />

      <div className="grid grid-cols-1 gap-4 px-5 sm:grid-cols-3 sm:px-8">
        <StatCard
          icon={Flame}
          label="Longest streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          hint="Consecutive days with a watering"
          delay={0}
        />
        <StatCard
          icon={Sprout}
          label="Total waterings"
          value={`${log.length}`}
          hint="All entries in the log"
          delay={80}
        />
        <StatCard
          icon={Droplets}
          label="Water saved this month"
          value={`${saved.toFixed(1)} L`}
          hint="vs. a fixed every-2-days schedule"
          delay={160}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 px-5 sm:px-8 lg:grid-cols-2">
        <ChartCard
          title="Watering events"
          subtitle="Past 30 days"
          icon={TrendingUp}
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={daily} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="fillWaterings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={6}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ stroke: "var(--primary)", strokeOpacity: 0.25 }}
                content={<SoftTooltip unit=" waterings" />}
              />
              <Area
                type="monotone"
                dataKey="waterings"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#fillWaterings)"
                dot={false}
                activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
                animationDuration={1400}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Water saved per week"
          subtitle="Actual use vs. fixed baseline schedule"
          icon={Droplets}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekly} margin={{ top: 10, right: 8, left: -22, bottom: 0 }} barGap={6}>
              <defs>
                <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--secondary)", opacity: 0.5 }}
                content={<SoftTooltip unit=" L" />}
              />
              <Bar
                dataKey="baseline"
                name="Baseline"
                fill="var(--sage)"
                radius={[8, 8, 0, 0]}
                animationDuration={1100}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="actual"
                name="Actual used"
                radius={[8, 8, 0, 0]}
                animationDuration={1300}
                animationBegin={180}
                animationEasing="ease-out"
              >
                {weekly.map((w) => (
                  <Cell key={w.week} fill="url(#fillActual)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <Legend color="var(--sage)" label="Baseline schedule" />
            <Legend color="var(--primary)" label="Your actual use" />
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 px-5 sm:px-8">
        <SoilMoistureCard plants={plants} />
      </div>
    </div>
  );
}

function SoilMoistureCard({ plants }: { plants: Array<{ id: string; name: string }> }) {
  const sensorPlants = plants.filter((p) => SENSOR_PLANT_IDS.includes(p.id));
  const [plantId, setPlantId] = useState(sensorPlants[0]?.id ?? SENSOR_PLANT_IDS[0]!);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/sensor-readings/history/${plantId}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = (await res.json()) as { readings: SensorReading[] };
        if (!cancelled) {
          setReadings(json.readings ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Sensor feed unavailable");
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [plantId]);

  const data = readings.map((r) => ({
    label: new Date(r.t).toLocaleTimeString("en-US", { hour: "numeric" }),
    moisture: r.moisture,
    temperature: r.temperature,
  }));
  const latest = readings.at(-1);

  return (
    <div className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-lift">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-leaf">
          <Radio className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-base font-semibold text-foreground">
            Soil moisture — past 24 hours
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            Hardware sensor readings
            {latest ? ` · now ${latest.moisture.toFixed(1)}% at ${latest.temperature.toFixed(1)}°C` : ""}
          </p>
        </div>
        <LiveSensorDot />
        {sensorPlants.length > 1 && (
          <select
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {sensorPlants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={7}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: "var(--primary)", strokeOpacity: 0.25 }}
              content={<SoftTooltip unit="%" />}
            />
            <Line
              type="monotone"
              dataKey="moisture"
              name="Soil moisture"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function SoftTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lift">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mt-0.5 text-xs text-muted-foreground">
          {p.name}: <span className="font-semibold text-foreground">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  delay: number;
}) {
  return (
    <div
      className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage text-leaf">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-display text-3xl font-semibold text-foreground">
        {value}
      </p>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-lift">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-leaf">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-base font-semibold text-foreground">
            {title}
          </h2>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

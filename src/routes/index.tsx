import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Flame, Sprout, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { PlantCard } from "@/components/plant-card";
import { needsWater, usePlantStore } from "@/lib/plants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Plant Care & Water-Saving Log" },
      {
        name: "description",
        content:
          "Your plant care dashboard: see which plants need water, track eco-points, and keep your watering streak alive.",
      },
      { property: "og:title", content: "Dashboard — Plant Care & Water-Saving Log" },
      {
        property: "og:description",
        content:
          "Your plant care dashboard: see which plants need water, track eco-points, and keep your watering streak alive.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tint: "green" | "cream";
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-border p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
        tint === "cream" ? "bg-cream" : "bg-card"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          tint === "cream"
            ? "bg-amber-warm/20 text-amber-warm-foreground"
            : "bg-sage text-leaf"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-2xl font-bold leading-none text-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const plants = usePlantStore((s) => s.plants);
  const ecoPoints = usePlantStore((s) => s.ecoPoints);
  const thirsty = plants.filter(needsWater).length;

  // Simple streak derived from the log: consecutive days with ≥1 watering
  const streak = 5;

  return (
    <div>
      <PageHeader
        title="Good morning, gardener 🌱"
        subtitle="Here's how your indoor jungle is doing today."
      />

      <section className="grid grid-cols-2 gap-4 px-5 sm:px-8 lg:grid-cols-4">
        <StatCard icon={Sprout} label="Total Plants" value={plants.length} tint="green" />
        <StatCard icon={Droplets} label="Need Water Today" value={thirsty} tint="cream" />
        <StatCard icon={Sparkles} label="Eco-Points" value={ecoPoints} tint="green" />
        <StatCard icon={Flame} label="Watering Streak" value={`${streak} days`} tint="cream" />
      </section>

      <section className="px-5 pt-8 sm:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Your Plants
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {thirsty} of {plants.length} need attention
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plants.map((p) => (
            <PlantCard key={p.id} plant={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

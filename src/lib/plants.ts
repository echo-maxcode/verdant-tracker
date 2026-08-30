import { useSyncExternalStore } from "react";

export type Plant = {
  id: string;
  name: string;
  species: string;
  location: string;
  frequencyDays: number;
  lastWatered: string; // ISO date
};

export type WateringEntry = {
  id: string;
  plantId: string;
  date: string;
  liters: number;
  loggedBy: string;
};

export const CAREGIVERS = ["Aisha", "Ben", "Chloe", "Dev"] as const;


/* ------------------------------------------------------------------ */
/* Mock data — swap these for API calls later. The store API stays the */
/* same: usePlants(), addPlant(), updatePlant(), removePlant(), etc.   */
/* ------------------------------------------------------------------ */

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const initialPlants: Plant[] = [
  { id: "p1", name: "Monty", species: "Monstera Deliciosa", location: "Living Room", frequencyDays: 7, lastWatered: daysAgo(6) },
  { id: "p2", name: "Fernando", species: "Boston Fern", location: "Bathroom", frequencyDays: 3, lastWatered: daysAgo(4) },
  { id: "p3", name: "Sunny", species: "Golden Pothos", location: "Kitchen", frequencyDays: 5, lastWatered: daysAgo(2) },
  { id: "p4", name: "Prickles", species: "Barrel Cactus", location: "Balcony", frequencyDays: 14, lastWatered: daysAgo(4) },
  { id: "p5", name: "Basil Jr.", species: "Sweet Basil", location: "Kitchen", frequencyDays: 2, lastWatered: daysAgo(2) },
  { id: "p6", name: "Zelda", species: "ZZ Plant", location: "Bedroom", frequencyDays: 10, lastWatered: daysAgo(3) },
];

const initialLog: WateringEntry[] = [
  { id: "w01", plantId: "p3", date: daysAgo(2), liters: 0.3, loggedBy: "Aisha" },
  { id: "w02", plantId: "p5", date: daysAgo(2), liters: 0.2, loggedBy: "Ben" },
  { id: "w03", plantId: "p6", date: daysAgo(3), liters: 0.4, loggedBy: "Chloe" },
  { id: "w04", plantId: "p2", date: daysAgo(4), liters: 0.35, loggedBy: "Aisha" },
  { id: "w05", plantId: "p4", date: daysAgo(4), liters: 0.5, loggedBy: "Dev" },
  { id: "w06", plantId: "p5", date: daysAgo(4), liters: 0.2, loggedBy: "Ben" },
  { id: "w07", plantId: "p1", date: daysAgo(6), liters: 0.6, loggedBy: "Chloe" },
  { id: "w08", plantId: "p5", date: daysAgo(6), liters: 0.2, loggedBy: "Aisha" },
  { id: "w09", plantId: "p2", date: daysAgo(7), liters: 0.35, loggedBy: "Dev" },
  { id: "w10", plantId: "p3", date: daysAgo(8), liters: 0.3, loggedBy: "Ben" },
  { id: "w11", plantId: "p5", date: daysAgo(9), liters: 0.2, loggedBy: "Chloe" },
  { id: "w12", plantId: "p2", date: daysAgo(10), liters: 0.35, loggedBy: "Aisha" },
  { id: "w13", plantId: "p6", date: daysAgo(12), liters: 0.4, loggedBy: "Dev" },
  { id: "w14", plantId: "p1", date: daysAgo(13), liters: 0.6, loggedBy: "Ben" },
  { id: "w15", plantId: "p3", date: daysAgo(14), liters: 0.3, loggedBy: "Chloe" },
  { id: "w16", plantId: "p2", date: daysAgo(15), liters: 0.35, loggedBy: "Aisha" },
  { id: "w17", plantId: "p5", date: daysAgo(16), liters: 0.2, loggedBy: "Dev" },
  { id: "w18", plantId: "p4", date: daysAgo(19), liters: 0.5, loggedBy: "Ben" },
  { id: "w19", plantId: "p1", date: daysAgo(21), liters: 0.6, loggedBy: "Chloe" },
  { id: "w20", plantId: "p6", date: daysAgo(24), liters: 0.4, loggedBy: "Aisha" },
];

/* Mock forecast signal — swap for a weather API later. */
export const RAIN_FORECAST_LOCATIONS = ["Balcony", "Kitchen"];

export function hasRainForecast(plant: Plant): boolean {
  return RAIN_FORECAST_LOCATIONS.includes(plant.location);
}


/* ------------------------------ store ----------------------------- */

type State = {
  plants: Plant[];
  log: WateringEntry[];
  ecoPoints: number;
};

let state: State = { plants: initialPlants, log: initialLog, ecoPoints: 240 };
const listeners = new Set<() => void>();

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function usePlantStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}

/* ---------------------------- selectors --------------------------- */

export function nextWateringDate(plant: Plant): Date {
  const d = new Date(plant.lastWatered);
  d.setDate(d.getDate() + plant.frequencyDays);
  return d;
}

export function needsWater(plant: Plant): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return nextWateringDate(plant) <= today;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ---------------------------- mutations --------------------------- */

export function addPlant(p: Omit<Plant, "id" | "lastWatered">) {
  const plant: Plant = { ...p, id: crypto.randomUUID(), lastWatered: daysAgo(0) };
  setState({ plants: [...state.plants, plant] });
}

export function updatePlant(id: string, patch: Partial<Omit<Plant, "id">>) {
  setState({
    plants: state.plants.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export function removePlant(id: string) {
  setState({
    plants: state.plants.filter((p) => p.id !== id),
    log: state.log.filter((e) => e.plantId !== id),
  });
}

export function logWatering(id: string, loggedBy = "Aisha") {
  const plant = state.plants.find((p) => p.id === id);
  setState({
    plants: state.plants.map((p) =>
      p.id === id ? { ...p, lastWatered: daysAgo(0) } : p,
    ),
    log: [
      {
        id: crypto.randomUUID(),
        plantId: id,
        date: daysAgo(0),
        liters: plant ? Math.round((plant.frequencyDays / 20 + 0.15) * 100) / 100 : 0.25,
        loggedBy,
      },
      ...state.log,
    ],
    ecoPoints: state.ecoPoints + 10,
  });
}

/* --------------------------- analytics ---------------------------- */

export function daysSince(iso: string): number {
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

/** True when the plant was watered inside its scheduled interval. */
export function wateredRecently(plant: Plant): boolean {
  return daysSince(plant.lastWatered) < plant.frequencyDays;
}

export type DayPoint = { date: string; label: string; waterings: number };

export function wateringsPerDay(log: WateringEntry[], days = 30): DayPoint[] {
  const points: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = daysAgo(i);
    points.push({
      date: iso,
      label: formatDate(new Date(iso)),
      waterings: log.filter((e) => e.date === iso).length,
    });
  }
  return points;
}

export type WeekPoint = {
  week: string;
  baseline: number;
  actual: number;
  saved: number;
};

/** Baseline = a fixed every-2-days schedule for every plant. */
export function weeklyWaterUse(
  log: WateringEntry[],
  plantCount: number,
  weeks = 4,
): WeekPoint[] {
  const out: WeekPoint[] = [];
  const baselineLiters = plantCount * 3.5 * 0.45; // 3.5 waterings/week @ 0.45 L
  for (let w = weeks - 1; w >= 0; w--) {
    const start = daysAgo(w * 7 + 6);
    const end = daysAgo(w * 7);
    const actual = log
      .filter((e) => e.date >= start && e.date <= end)
      .reduce((sum, e) => sum + e.liters, 0);
    out.push({
      week: w === 0 ? "This week" : `${w}w ago`,
      baseline: Math.round(baselineLiters * 10) / 10,
      actual: Math.round(actual * 10) / 10,
      saved: Math.round(Math.max(0, baselineLiters - actual) * 10) / 10,
    });
  }
  return out;
}

export function longestStreak(log: WateringEntry[]): number {
  const dates = [...new Set(log.map((e) => e.date))].sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of dates) {
    const t = new Date(d).getTime();
    run = prev !== null && t - prev === 86_400_000 ? run + 1 : 1;
    prev = t;
    if (run > best) best = run;
  }
  return best;
}

export function waterSavedThisMonth(
  log: WateringEntry[],
  plantCount: number,
): number {
  return weeklyWaterUse(log, plantCount).reduce((s, w) => s + w.saved, 0);
}

/* --------------------------- leaderboard -------------------------- */

export type Badge = {
  id: string;
  name: string;
  description: string;
  /** points threshold at which the badge is earned */
  threshold: number;
};

export const BADGES: Badge[] = [
  { id: "first-plant", name: "First Plant", description: "Add your first plant", threshold: 0 },
  { id: "seven-streak", name: "7-Day Streak", description: "Water every day for a week", threshold: 70 },
  { id: "rain-saver", name: "Rain Saver", description: "Skip a watering on a rain forecast", threshold: 130 },
  { id: "thirty-streak", name: "30-Day Streak", description: "A full month of care", threshold: 210 },
  { id: "water-wise", name: "Water Wise", description: "Save 10L versus the baseline", threshold: 280 },
  { id: "green-thumb", name: "Green Thumb", description: "Care for 10 plants", threshold: 350 },
];

export type LeaderboardUser = {
  id: string;
  name: string;
  ecoPoints: number;
  badgeCount: number;
  isCurrentUser?: boolean;
};

export const CURRENT_USER_ID = "u-self";

export const LEADERBOARD_USERS: LeaderboardUser[] = [
  { id: "u1", name: "Mara Okonkwo", ecoPoints: 410, badgeCount: 6 },
  { id: "u2", name: "Leo Tanaka", ecoPoints: 372, badgeCount: 5 },
  { id: "u3", name: "Priya Nair", ecoPoints: 318, badgeCount: 4 },
  { id: CURRENT_USER_ID, name: "You", ecoPoints: 240, badgeCount: 3, isCurrentUser: true },
  { id: "u4", name: "Sam Whitfield", ecoPoints: 205, badgeCount: 3 },
  { id: "u5", name: "Noa Cohen", ecoPoints: 168, badgeCount: 3 },
  { id: "u6", name: "Diego Marín", ecoPoints: 142, badgeCount: 2 },
  { id: "u7", name: "Ingrid Solberg", ecoPoints: 96, badgeCount: 2 },
  { id: "u8", name: "Tariq Hossain", ecoPoints: 64, badgeCount: 1 },
];

/** Next badge the given points total has not yet reached. */
export function nextBadge(points: number): Badge | null {
  return BADGES.find((b) => points < b.threshold) ?? null;
}


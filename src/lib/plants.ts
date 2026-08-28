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

export function logWatering(id: string) {
  setState({
    plants: state.plants.map((p) =>
      p.id === id ? { ...p, lastWatered: daysAgo(0) } : p,
    ),
    log: [{ id: crypto.randomUUID(), plantId: id, date: daysAgo(0), liters: 0.25 }, ...state.log],
    ecoPoints: state.ecoPoints + 10,
  });
}

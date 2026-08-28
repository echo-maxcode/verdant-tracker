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
  { id: "w1", plantId: "p3", date: daysAgo(2), liters: 0.3 },
  { id: "w2", plantId: "p5", date: daysAgo(2), liters: 0.2 },
  { id: "w3", plantId: "p6", date: daysAgo(3), liters: 0.4 },
];

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

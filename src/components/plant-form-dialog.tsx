import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { addPlant, updatePlant, type Plant } from "@/lib/plants";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";

export function PlantFormDialog({
  open,
  onClose,
  plant,
}: {
  open: boolean;
  onClose: () => void;
  plant?: Plant | null;
}) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState(7);

  useEffect(() => {
    if (open) {
      setName(plant?.name ?? "");
      setSpecies(plant?.species ?? "");
      setLocation(plant?.location ?? "");
      setFrequency(plant?.frequencyDays ?? 7);
    }
  }, [open, plant]);

  if (!open) return null;

  const valid = name.trim() && species.trim() && location.trim() && frequency > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const data = {
      name: name.trim(),
      species: species.trim(),
      location: location.trim(),
      frequencyDays: frequency,
    };
    if (plant) {
      updatePlant(plant.id, data);
      toast.success(`${data.name} updated`);
    } else {
      addPlant(data);
      toast.success(`${data.name} added to your garden 🌿`);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {plant ? "Edit Plant" : "Add a Plant"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Name
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monty"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Species
            <input
              className={inputClass}
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Monstera Deliciosa"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Location
            <input
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Living Room"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Watering frequency (days)
            <input
              type="number"
              min={1}
              max={60}
              className={inputClass}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </label>
          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!valid}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {plant ? "Save Changes" : "Add Plant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ConfirmDeleteDialog({
  plant,
  onCancel,
  onConfirm,
}: {
  plant: Plant | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!plant) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-semibold text-foreground">
          Remove {plant.name}?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This will permanently remove the plant and its watering history. This
          action can't be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Keep Plant
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:brightness-110 active:scale-[0.98]"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

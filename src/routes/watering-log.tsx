import { createFileRoute } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/watering-log")({
  head: () => ({
    meta: [
      { title: "Watering Log — Plant Care & Water-Saving Log" },
      { name: "description", content: "A history of every watering event and water saved." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      title="Watering Log"
      subtitle="Every drop, recorded."
      icon={Droplets}
    />
  ),
});

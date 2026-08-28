import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Plant Care & Water-Saving Log" },
      { name: "description", content: "Water usage trends and plant health analytics." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      title="Analytics"
      subtitle="Water-saving insights at a glance."
      icon={BarChart3}
    />
  ),
});

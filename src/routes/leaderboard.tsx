import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Plant Care & Water-Saving Log" },
      { name: "description", content: "See how your water-saving ranks against other plant lovers." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      title="Leaderboard"
      subtitle="Top water savers in your community."
      icon={Trophy}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Plant Care & Water-Saving Log" },
      { name: "description", content: "Your gardener profile and preferences." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      title="Profile"
      subtitle="Your gardener identity."
      icon={User}
    />
  ),
});

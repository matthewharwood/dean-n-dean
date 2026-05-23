import { createFileRoute } from "@tanstack/react-router";

import { AlchemistGuildBoard } from "~/components/alchemist-guild-board";
import { buildSeoLinks } from "~/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({ links: buildSeoLinks({ path: "/" }) }),
  component: Home,
});

function Home() {
  return <AlchemistGuildBoard />;
}

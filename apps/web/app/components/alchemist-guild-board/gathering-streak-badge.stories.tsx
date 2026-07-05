import type { Meta, StoryObj } from "@storybook/react-vite";

import type { GatheringStreakRarity } from "./gathering-streak";
import { GatheringStreakBadge } from "./gathering-streak-badge";

// The badge is absolutely positioned for a reward-card corner, so every story
// mounts it inside a card-sized, relatively-positioned frame to show it in situ.
function RewardCardFrame({ bonus, rarity }: { bonus: number; rarity: GatheringStreakRarity }) {
  return (
    <div className="relative h-[208px] w-[148px] overflow-hidden rounded-[4px] border-2 border-[#888888] bg-[#eeeeee] shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
      <span className="absolute inset-x-0 bottom-3 text-center text-[11px] font-black uppercase text-neutral-500">
        reward card
      </span>
      <GatheringStreakBadge bonus={bonus} rarity={rarity} />
    </div>
  );
}

const meta = {
  title: "Components/AlchemistGuildBoard/GatheringStreakBadge",
  component: GatheringStreakBadge,
  parameters: { layout: "centered" },
  render: (args) => <RewardCardFrame bonus={args.bonus} rarity={args.rarity} />,
} satisfies Meta<typeof GatheringStreakBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoBonus: Story = {
  name: "No bonus (renders nothing)",
  args: { bonus: 0, rarity: "common" },
};

export const UncommonPlusOne: Story = {
  args: { bonus: 1, rarity: "uncommon" },
};

export const RarePlusOne: Story = {
  args: { bonus: 1, rarity: "rare" },
};

export const EpicPlusTwo: Story = {
  args: { bonus: 2, rarity: "epic" },
};

export const MythicalPlusThree: Story = {
  args: { bonus: 3, rarity: "mythical" },
};

export const CelestialPlusFour: Story = {
  args: { bonus: 4, rarity: "celestial" },
};

export const DivinePlusFive: Story = {
  args: { bonus: 5, rarity: "divine" },
};

const TIER_GALLERY: ReadonlyArray<{ bonus: number; rarity: GatheringStreakRarity }> = [
  { bonus: 1, rarity: "uncommon" },
  { bonus: 1, rarity: "rare" },
  { bonus: 2, rarity: "epic" },
  { bonus: 2, rarity: "legendary" },
  { bonus: 3, rarity: "mythical" },
  { bonus: 4, rarity: "celestial" },
  { bonus: 5, rarity: "divine" },
];

export const TierGallery: Story = {
  name: "All tiers",
  args: { bonus: 1, rarity: "uncommon" },
  render: () => (
    <div className="flex flex-wrap gap-4">
      {TIER_GALLERY.map((entry) => (
        <RewardCardFrame key={entry.rarity} bonus={entry.bonus} rarity={entry.rarity} />
      ))}
    </div>
  ),
};

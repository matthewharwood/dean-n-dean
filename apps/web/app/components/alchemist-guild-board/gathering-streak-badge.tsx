import { AlchemistGuildEmergentRecipeRaritySchema } from "@dean-stack/schemas";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";
import { gatheringStreakRarityStyle } from "./gathering-streak-style";

// The "+N" streak-bonus badge that rides the top-left corner of a reward card,
// showing how many extra of that element the current streak will grant on claim.
// Rarity-tinted to match the meter + chest. Sits at left-1/top-1 so it never
// collides with the selected-state checkmark (top-right). Decorative — the grant
// it advertises is the real reward (see claimGatheringRewardForBoard).
const GatheringStreakBadgePropsSchema = z.object({
  bonus: z.int(),
  // Accepts the six shared rarities plus the streak-only "celestial" top tier.
  rarity: AlchemistGuildEmergentRecipeRaritySchema.or(z.literal("celestial")),
});

export const GatheringStreakBadge = defineComponent(
  GatheringStreakBadgePropsSchema,
  ({ bonus, rarity }) => {
    if (bonus <= 0) return null;
    const style = gatheringStreakRarityStyle(rarity);

    return (
      <span
        aria-hidden="true"
        data-board-section="gathering-streak-badge"
        data-gathering-streak-bonus={bonus}
        data-gathering-streak-rarity={rarity}
        className={`pointer-events-none absolute left-1 top-1 z-20 inline-flex min-h-6 items-center rounded-full px-2 text-sm font-black leading-none tabular-nums ring-2 ${style.badgeBg} ${style.badgeText} ${style.badgeRing}`}
      >
        +{bonus}
      </span>
    );
  },
);

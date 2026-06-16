import { describe, expect, test } from "bun:test";

import {
  formatGatheringDamageFloaterLabel,
  GatheringDamageFloaterTierSchema,
  resolveGatheringDamageFloaterTier,
} from "./gathering-damage-floater";

describe("resolveGatheringDamageFloaterTier", () => {
  test("small chip of the bar is a normal hit", () => {
    // 2 / 10 = 0.2 ratio, below the 0.3 big gate.
    expect(resolveGatheringDamageFloaterTier(2, 10)).toBe("normal");
    expect(resolveGatheringDamageFloaterTier(1, 10)).toBe("normal");
  });

  test("a chunky fraction of the bar is a big hit", () => {
    // 0.3 ratio is the big gate; 0.45 stays big (under the crit gate) and both
    // amounts sit below the 12-damage absolute crit floor.
    expect(resolveGatheringDamageFloaterTier(3, 10)).toBe("big");
    expect(resolveGatheringDamageFloaterTier(9, 20)).toBe("big");
  });

  test("half the bar (or more) is a crit", () => {
    expect(resolveGatheringDamageFloaterTier(5, 10)).toBe("crit");
    expect(resolveGatheringDamageFloaterTier(30, 60)).toBe("crit");
  });

  test("a big absolute hit crits even when it is a small fraction of a tanky bar", () => {
    // 12 / 60 = 0.2 ratio — below every ratio gate, but the absolute floor wins.
    expect(resolveGatheringDamageFloaterTier(12, 60)).toBe("crit");
    // 11 on the same bar is still below both the absolute and ratio gates.
    expect(resolveGatheringDamageFloaterTier(11, 60)).toBe("normal");
  });

  test("the killing blow always crits, however small the number", () => {
    expect(resolveGatheringDamageFloaterTier(1, 10, true)).toBe("crit");
    expect(resolveGatheringDamageFloaterTier(2, 44, true)).toBe("crit");
  });

  test("a zero or unknown max HP never divides by zero", () => {
    expect(resolveGatheringDamageFloaterTier(3, 0)).toBe("normal");
    expect(resolveGatheringDamageFloaterTier(12, 0)).toBe("crit");
  });

  test("every tier is a member of the schema", () => {
    for (const tier of [
      resolveGatheringDamageFloaterTier(1, 10),
      resolveGatheringDamageFloaterTier(3, 10),
      resolveGatheringDamageFloaterTier(5, 10),
    ]) {
      expect(GatheringDamageFloaterTierSchema.parse(tier)).toBe(tier);
    }
  });
});

describe("formatGatheringDamageFloaterLabel", () => {
  test("normal and big hits read as a plain -N", () => {
    expect(formatGatheringDamageFloaterLabel(7, "normal")).toBe("-7");
    expect(formatGatheringDamageFloaterLabel(9, "big")).toBe("-9");
  });

  test("only crits earn the celebratory trailing !", () => {
    expect(formatGatheringDamageFloaterLabel(13, "crit")).toBe("-13!");
  });
});

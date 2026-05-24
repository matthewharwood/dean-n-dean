// fallow-ignore-file unused-file
import { describe, expect, test } from "bun:test";

import {
  FIRST_FIVE_MINUTE_ISSUES,
  FIRST_FIVE_MINUTE_LINEAR_DRAFTS,
  getFirstFiveMinuteIssueById,
  renderFirstFiveMinuteIssueMarkdown,
  validateFirstFiveMinuteIssueSpecs,
} from ".";

describe("first five minute Symphony issue specs", () => {
  test("validates the complete issue graph and data anchors", () => {
    expect(validateFirstFiveMinuteIssueSpecs()).toHaveLength(FIRST_FIVE_MINUTE_ISSUES.length);
    expect(FIRST_FIVE_MINUTE_ISSUES.length).toBeGreaterThanOrEqual(30);
  });

  test("anchors the backlog to the Water tutorial", () => {
    const firstIssue = getFirstFiveMinuteIssueById("F5M-001");
    const discoveryIssue = getFirstFiveMinuteIssueById("F5M-017");

    expect(firstIssue?.dataAnchors.quests).toContain("quest:first-water");
    expect(firstIssue?.dataAnchors.recipes).toContain("alchemy:water");
    expect(firstIssue?.dataAnchors.elements).toContain("element:h");
    expect(discoveryIssue?.title).toContain("Discovery Draft");
  });

  test("renders Linear-ready issue bodies", () => {
    const issue = getFirstFiveMinuteIssueById("F5M-014");

    if (!issue) {
      throw new Error("Expected F5M-014 to exist");
    }

    const markdown = renderFirstFiveMinuteIssueMarkdown(issue);

    expect(markdown).toContain("# F5M-014");
    expect(markdown).toContain("## Acceptance Criteria");
    expect(markdown).toContain("quest:first-water");
    expect(FIRST_FIVE_MINUTE_LINEAR_DRAFTS).toHaveLength(FIRST_FIVE_MINUTE_ISSUES.length);
  });
});

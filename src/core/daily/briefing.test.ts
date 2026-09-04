import assert from "node:assert/strict";
import { test } from "node:test";

import { buildDailyBriefing } from "./briefing";

test("empty briefing does not invent work", () => {
  const text = buildDailyBriefing({
    timezone: "Africa/Lagos",
    civilDate: "2026-08-30",
    todayEventCount: 0,
    upcomingEventCount: 0,
    openTaskCount: 0,
    overdueTaskCount: 0,
    openGoalCount: 0,
    doneGoalCount: 0,
    noteCount: 0,
  });
  assert.match(text, /Nothing scheduled/);
});

test("briefing lists stored counts only", () => {
  const text = buildDailyBriefing({
    timezone: "UTC",
    civilDate: "2026-08-30",
    todayEventCount: 1,
    upcomingEventCount: 2,
    openTaskCount: 3,
    overdueTaskCount: 1,
    openGoalCount: 2,
    doneGoalCount: 1,
    noteCount: 4,
  });
  assert.match(text, /1 calendar event today/);
  assert.match(text, /1 overdue task/);
  assert.match(text, /3 open tasks/);
  assert.match(text, /1 goal already marked done/);
});

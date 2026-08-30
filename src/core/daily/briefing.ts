export type DailyBriefingInput = {
  timezone: string;
  civilDate: string;
  todayEventCount: number;
  upcomingEventCount: number;
  openTaskCount: number;
  overdueTaskCount: number;
  openGoalCount: number;
  doneGoalCount: number;
  noteCount: number;
};

export function buildDailyBriefing(input: DailyBriefingInput): string {
  const parts: string[] = [];

  if (input.todayEventCount > 0) {
    parts.push(
      `${input.todayEventCount} calendar event${input.todayEventCount === 1 ? "" : "s"} today`,
    );
  }

  if (input.overdueTaskCount > 0) {
    parts.push(
      `${input.overdueTaskCount} overdue task${input.overdueTaskCount === 1 ? "" : "s"}`,
    );
  }

  if (input.openTaskCount > 0) {
    parts.push(`${input.openTaskCount} open task${input.openTaskCount === 1 ? "" : "s"}`);
  }

  if (input.openGoalCount > 0) {
    parts.push(`${input.openGoalCount} open goal${input.openGoalCount === 1 ? "" : "s"}`);
  }

  if (input.upcomingEventCount > 0 && input.todayEventCount === 0) {
    parts.push(
      `${input.upcomingEventCount} upcoming event${input.upcomingEventCount === 1 ? "" : "s"}`,
    );
  }

  if (parts.length === 0) {
    return `Nothing scheduled on your account for ${input.civilDate} (${input.timezone}). Add a note, a goal, or a task to start the day.`;
  }

  const progress =
    input.doneGoalCount > 0
      ? ` ${input.doneGoalCount} goal${input.doneGoalCount === 1 ? "" : "s"} already marked done.`
      : "";

  return `${parts.join(", ")}.${progress}`;
}

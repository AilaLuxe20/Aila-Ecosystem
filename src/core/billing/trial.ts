export function trialDaysRemaining(trialEndsAt: Date | null | undefined, now = new Date()): number | null {
  if (!trialEndsAt) {
    return null;
  }

  const ms = trialEndsAt.getTime() - now.getTime();
  if (ms <= 0) {
    return 0;
  }

  return Math.ceil(ms / 86_400_000);
}

export function trialEndFromUnix(value: number | null | undefined): Date | null {
  if (typeof value !== "number") {
    return null;
  }

  return new Date(value * 1000);
}

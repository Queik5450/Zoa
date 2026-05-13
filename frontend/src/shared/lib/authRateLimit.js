const AUTH_RATE_LIMIT_UNTIL_KEY = 'zoa.authRateLimitUntil';
const DEFAULT_AUTH_COOLDOWN_MS = 120000;

export function getAuthCooldownRemainingMs() {
  try {
    const untilValue = Number(window.localStorage.getItem(AUTH_RATE_LIMIT_UNTIL_KEY) || 0);
    if (!untilValue) return 0;

    const remaining = untilValue - Date.now();
    if (remaining <= 0) {
      window.localStorage.removeItem(AUTH_RATE_LIMIT_UNTIL_KEY);
      return 0;
    }

    return remaining;
  } catch {
    return 0;
  }
}

export function startAuthRateLimit(cooldownMs = DEFAULT_AUTH_COOLDOWN_MS) {
  const untilValue = Date.now() + cooldownMs;
  try {
    window.localStorage.setItem(AUTH_RATE_LIMIT_UNTIL_KEY, String(untilValue));
  } catch {
    // ignore localStorage errors and keep runtime behavior
  }

  return untilValue;
}

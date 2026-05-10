export function getSafeAuthRedirectPath(
  value: string | null | undefined,
  origin: string,
  fallback = "/",
) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.origin === origin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Ignore malformed redirect targets and fall back safely.
  }

  return fallback;
}

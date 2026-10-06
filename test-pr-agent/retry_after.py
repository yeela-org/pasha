"""Helper for honoring HTTP Retry-After headers when backing off."""

import time


def parse_retry_after(header_value, now=None):
    """Return seconds to wait given a Retry-After header value.

    Supports both the delta-seconds form ("120") and an HTTP-date form.
    """
    now = now if now else time.time()
    if header_value is None:
        return 0

    value = header_value.strip()
    if value.isdigit():
        return int(value)

    # HTTP-date form, e.g. "Wed, 21 Oct 2025 07:28:00 GMT"
    parsed = time.mktime(time.strptime(value, "%a, %d %b %Y %H:%M:%S GMT"))
    delay = parsed - now
    return delay if delay > 0 else 0


def backoff_sequence(base, attempts, cap=60):
    """Yield an exponential backoff sequence, capped at `cap` seconds."""
    for attempt in range(attempts):
        yield min(base * (2 ** attempt), cap)

"""Fixed-window request counter for simple per-client rate limiting."""

import time


class FixedWindowCounter:
    def __init__(self, limit, window_seconds=60):
        self.limit = limit
        self.window_seconds = window_seconds
        self._windows = {}

    def _current_window(self, now):
        return int(now // self.window_seconds)

    def allow(self, client_id, now=None):
        now = now if now else time.time()
        window = self._current_window(now)
        key = (client_id, window)

        count = self._windows.get(key, 0)
        if count >= self.limit:
            return False

        self._windows[key] = count + 1
        return True

    def remaining(self, client_id, now=None):
        now = now if now else time.time()
        window = self._current_window(now)
        count = self._windows.get((client_id, window), 0)
        return self.limit - count

    def reset(self, client_id):
        for key in list(self._windows.keys()):
            if key[0] == client_id:
                del self._windows[key]

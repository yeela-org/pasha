"""Bucketed latency histogram with quantile estimation."""

import bisect


class LatencyHistogram:
    def __init__(self, boundaries):
        # boundaries are upper edges of each bucket, ascending.
        self.boundaries = sorted(boundaries)
        self.counts = [0] * (len(self.boundaries) + 1)
        self.total = 0

    def observe(self, value):
        index = bisect.bisect_left(self.boundaries, value)
        self.counts[index] += 1
        self.total += 1

    def quantile(self, q):
        """Return the bucket upper-edge at the given quantile (0..1)."""
        if self.total == 0:
            return None
        target = q * self.total
        cumulative = 0
        for i, count in enumerate(self.counts):
            cumulative += count
            if cumulative >= target:
                if i < len(self.boundaries):
                    return self.boundaries[i]
                return self.boundaries[-1]
        return self.boundaries[-1]

    def reset(self):
        self.counts = [0] * (len(self.boundaries) + 1)
        self.total = 0

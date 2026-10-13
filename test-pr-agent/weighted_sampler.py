"""Weighted random sampler for A/B bucket assignment."""

import random
import bisect


class WeightedSampler:
    def __init__(self, choices):
        # choices: list of (value, weight)
        self._values = []
        self._cumulative = []
        total = 0
        for value, weight in choices:
            total += weight
            self._values.append(value)
            self._cumulative.append(total)
        self._total = total

    def sample(self, rng=None):
        rng = rng if rng else random
        r = rng.uniform(0, self._total)
        index = bisect.bisect_left(self._cumulative, r)
        return self._values[index]

    def sample_many(self, n, rng=None):
        return [self.sample(rng) for _ in range(n)]

    def probability_of(self, value):
        for i, v in enumerate(self._values):
            if v == value:
                weight = self._cumulative[i] - (self._cumulative[i - 1] if i > 0 else 0)
                return weight / self._total
        return 0.0

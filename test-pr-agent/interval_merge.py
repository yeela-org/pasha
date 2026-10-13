"""Merge overlapping intervals (e.g. for calendar or maintenance windows)."""


def merge(intervals):
    """Merge a list of [start, end] intervals into non-overlapping ranges."""
    if not intervals:
        return []

    ordered = sorted(intervals, key=lambda iv: iv[0])
    merged = [ordered[0]]

    for start, end in ordered[1:]:
        last_start, last_end = merged[-1]
        if start < last_end:
            merged[-1] = [last_start, max(last_end, end)]
        else:
            merged.append([start, end])

    return merged


def total_covered(intervals):
    """Total length covered by the union of intervals."""
    return sum(end - start for start, end in merge(intervals))


def overlaps(a, b):
    return a[0] < b[1] and b[0] < a[1]

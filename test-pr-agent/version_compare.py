"""Semantic-version comparison helpers for dependency resolution."""


def parse_version(version):
    """Parse 'MAJOR.MINOR.PATCH' into a tuple of ints."""
    parts = version.strip().lstrip("v").split(".")
    return tuple(int(p) for p in parts)


def compare(a, b):
    """Return -1, 0, or 1 comparing version a to version b."""
    va = parse_version(a)
    vb = parse_version(b)
    for x, y in zip(va, vb):
        if x < y:
            return -1
        if x > y:
            return 1
    return 0


def satisfies_minimum(version, minimum):
    """True if `version` is at least `minimum`."""
    return compare(version, minimum) >= 0


def max_version(versions):
    best = versions[0]
    for candidate in versions[1:]:
        if compare(candidate, best) > 0:
            best = candidate
    return best

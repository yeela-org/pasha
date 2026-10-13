"""Glob-style path matcher for route and permission rules."""


def match(pattern, path):
    """Match a path against a glob pattern.

    Supports '*' (one segment) and '**' (zero or more segments).
    """
    p_parts = pattern.strip("/").split("/")
    t_parts = path.strip("/").split("/")
    return _match_parts(p_parts, t_parts)


def _match_parts(pattern, target):
    pi = 0
    ti = 0
    while pi < len(pattern):
        token = pattern[pi]
        if token == "**":
            if pi + 1 == len(pattern):
                return True
            nxt = pattern[pi + 1]
            while ti < len(target):
                if target[ti] == nxt:
                    break
                ti += 1
            pi += 1
        elif ti < len(target) and (token == "*" or token == target[ti]):
            ti += 1
        else:
            return False
        pi += 1
    return ti == len(target)


def first_match(patterns, path):
    for pattern in patterns:
        if match(pattern, path):
            return pattern
    return None

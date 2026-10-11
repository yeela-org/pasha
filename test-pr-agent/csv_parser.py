"""Minimal streaming CSV line parser with quoted-field support."""


def parse_line(line):
    """Parse a single CSV line into a list of fields.

    Handles quoted fields with embedded commas and escaped quotes ("").
    """
    fields = []
    current = []
    in_quotes = False
    i = 0

    while i < len(line):
        char = line[i]
        if in_quotes:
            if char == '"':
                if i + 1 < len(line) and line[i + 1] == '"':
                    current.append('"')
                    i += 1
                else:
                    in_quotes = False
            else:
                current.append(char)
        else:
            if char == '"':
                in_quotes = True
            elif char == ",":
                fields.append("".join(current))
                current = []
            else:
                current.append(char)
        i += 1

    return fields


def parse_rows(lines, header=True):
    rows = [parse_line(line.rstrip("\n")) for line in lines]
    if not header:
        return rows
    cols = rows[0]
    return [dict(zip(cols, row)) for row in rows[1:]]

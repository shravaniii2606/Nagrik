import re

# Basic reusable validation helpers. Extend as needed per-feature,
# but keep validation logic here instead of scattering regex across routes.

_SAFE_STRING_RE = re.compile(r"^[\w\s\-.,!?'\"()]{1,500}$")


def is_safe_text(value: str) -> bool:
    """Reject obviously malicious or malformed free-text input."""
    if not isinstance(value, str):
        return False
    return bool(_SAFE_STRING_RE.match(value))


def sanitize_text(value: str) -> str:
    """Strip whitespace and cap length as a last line of defense."""
    return value.strip()[:500]

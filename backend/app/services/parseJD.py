# jd_sections.py
import re
from typing import Dict, List, Tuple

HEADERS = {
    "requirements": [
        r"requirements", r"qualifications", r"basic qualifications",
        r"minimum qualifications", r"must[-\s]?have", r"what you bring", r"required qualifications",
    ],
    "responsibilities": [
        r"responsibilities", r"duties", r"what you'?ll do", r"role",
        r"your impact", r"day[-\s]?to[-\s]?day", r"key responsibilities", r"job responsibilities",
    ],
    "preferred": [
        r"preferred", r"preferred qualifications", r"nice to have",
        r"bonus", r"bonus points", r"good to have",
    ],
    "skills": [
        r"skills", r"technical skills", r"tech(?:nologies| stack)?", r"tools",
    ],
}

BULLET_PREFIX = re.compile(r"^\s*(?:[-*•\u2022]|\d+\.)\s+")
WS = re.compile(r"\s+")

def _is_heading(line: str) -> Tuple[str | None, str | None]:
    """Return (canonical_key, original_heading_text) if the line is a known header."""
    raw = line.strip().lower().strip(": -–—")
    for key, variants in HEADERS.items():
        for v in variants:
            if re.fullmatch(v, raw, flags=re.IGNORECASE):
                return key, line.strip()
    return None, None

def _split_bullets(block: str) -> List[str]:
    """Turn a block into bullets. Supports wrapped lines; falls back to one paragraph bullet."""
    lines = [l for l in block.split("\n")]
    bullets: List[str] = []
    cur = None
    for ln in lines:
        if not ln.strip():
            continue
        if BULLET_PREFIX.match(ln):
            if cur:
                bullets.append(WS.sub(" ", cur).strip())
            cur = BULLET_PREFIX.sub("", ln).strip()
        else:
            if cur:
                cur += " " + ln.strip()
            else:
                cur = ln.strip()
    if cur:
        bullets.append(WS.sub(" ", cur).strip())
    # If it's a comma-separated skills line, split it (only for skills later)
    return bullets

def parse_jd_sections(text: str) -> Dict[str, List[str]]:
    """
    Extract only: requirements, responsibilities, preferred, skills.
    Returns dict with those keys; missing ones return empty lists.
    """
    sections: Dict[str, List[str]] = {k: [] for k in HEADERS.keys()}
    if not text or not text.strip():
        return sections

    lines = text.split("\n")
    cur_key = None
    buf: List[str] = []

    def flush():
        nonlocal buf, cur_key
        if not buf or cur_key is None:
            buf.clear()
            return
        block = "\n".join(buf).strip()
        bullets = _split_bullets(block)
        # Extra parsing for skills: allow comma-separated tokens
        if cur_key == "skills" and len(bullets) == 1 and ("," in bullets[0] or " | " in bullets[0]):
            raw = re.split(r",|\|", bullets[0])
            bullets = [WS.sub(" ", t).strip() for t in raw if t.strip()]
        sections[cur_key].extend(bullets)
        buf.clear()

    # Walk lines; start a new section when a known header appears
    for ln in lines:
        key, _ = _is_heading(ln)
        if key is not None:
            flush()
            cur_key = key
            continue
        # only capture content if we're inside a wanted section
        if cur_key is not None:
            buf.append(ln)
    flush()

    # Fallback: if nothing found at all, treat whole JD as "requirements"
    if all(len(v) == 0 for v in sections.values()):
        sections["requirements"] = _split_bullets(text) or [WS.sub(" ", text).strip()]

    # Dedup + clean
    for k in sections:
        seen = set()
        cleaned = []
        for b in sections[k]:
            t = WS.sub(" ", b).strip(" -•\u2022")
            if t and t.lower() not in seen:
                seen.add(t.lower())
                cleaned.append(t)
        sections[k] = cleaned

    return sections

# Weights for scoring different sections
SECTION_WEIGHTS = {
    "requirements": 1.0,
    "responsibilities": 0.9,
    "preferred": 0.75,
    "skills": 0.85,
}

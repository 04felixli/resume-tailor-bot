import io
import re
import uuid
import hashlib
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple

try:
    import fitz  # PyMuPDF
except ImportError as e:
    raise SystemExit("Please install PyMuPDF: pip install pymupdf")

# ----------------------------
# Helpers & regex patterns
# ----------------------------
MONTHS = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}

BULLET_PREFIX = re.compile(r"^\s*([•·\-\u2013\u2014\u2212\*]|\d+\.|[a-z]\))\s+")
DATE_TOKEN = re.compile(
    r"(?P<mon>(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*)\s+"  # month
    r"(?P<yr>\d{4})",
    re.IGNORECASE,
)
DATE_RANGE = re.compile(
    r"(?P<start>(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*(?:[-\u2013\u2014]|to)\s*"
    r"(?P<end>(?:Present|Current|Now|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4}))",
    re.IGNORECASE,
)
YEAR_RANGE = re.compile(r"\b(\d{4})\s*(?:[-\u2013\u2014]|to)\s*(\d{4}|Present|Current|Now)\b", re.IGNORECASE)

SECTION_HEADERS = {
    "experience": ["experience", "work experience", "professional experience"],
    "projects": ["projects", "personal projects", "selected projects"],
    "education": ["education"],
    "skills": ["skills", "technical skills"],
}

# ----------------------------
# Data models
# ----------------------------
@dataclass
class Bullet:
    bullet_id: str
    text: str
    order_index: int

@dataclass
class Item:
    item_id: str
    item_type: str  # "experience" | "project"
    company: Optional[str]
    role: Optional[str]
    name: Optional[str]
    start: Optional[str]
    end: Optional[str]
    order_index: int
    bullets: List[Bullet]

# ----------------------------
# Core parsing
# ----------------------------

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _normalize_date_token(tok: str) -> Optional[Tuple[int, int]]:
    tok = tok.strip()
    if not tok:
        return None
    if tok.lower() in {"present", "current", "now"}:
        return None
    m = DATE_TOKEN.search(tok)
    if m:
        mon = MONTHS.get(m.group("mon").lower()[:3], None)
        yr = int(m.group("yr"))
        if mon:
            return (yr, mon)
    # bare year
    if re.fullmatch(r"\d{4}", tok):
        return (int(tok), 1)
    return None


def _normalize_date_range(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Return (start, end) as YYYY-MM or None."""
    m = DATE_RANGE.search(text) or YEAR_RANGE.search(text)
    if not m:
        return (None, None)
    if hasattr(m, "groupdict") and "start" in m.groupdict():
        start_tok, end_tok = m.group("start"), m.group("end")
    else:
        start_tok, end_tok = m.group(1), m.group(2)
    s = _normalize_date_token(start_tok)
    e = _normalize_date_token(end_tok)
    s_out = f"{s[0]:04d}-{s[1]:02d}" if s else None
    if e is None and end_tok.strip().lower() in {"present", "current", "now"}:
        e_out = "Present"
    else:
        e_out = f"{e[0]:04d}-{e[1]:02d}" if e else None
    return (s_out, e_out)


def _is_section_header(text: str) -> Optional[str]:
    t = text.strip().lower()
    for key, heads in SECTION_HEADERS.items():
        for h in heads:
            if t == h:
                return key
    return None


def _clean_text(s: str) -> str:
    # Fix hyphenation at line breaks: "word-\nnext" -> "wordnext"
    s = re.sub(r"(\w)-\n(\w)", r"\1\2", s)
    # Collapse whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _extract_lines_with_fonts(pdf_bytes: bytes) -> List[Dict[str, Any]]:
    """Return list of lines with text, font size, y-coordinate for heading heuristics."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    lines: List[Dict[str, Any]] = []
    for page in doc:
        d = page.get_text("dict")
        for b in d.get("blocks", []):
            for l in b.get("lines", []):
                spans = l.get("spans", [])
                if not spans:
                    continue
                # join spans text and average size
                text = "".join(s.get("text", "") for s in spans)
                if not text.strip():
                    continue
                sizes = [s.get("size", 0) for s in spans if s.get("size")]
                size = sum(sizes) / len(sizes) if sizes else 0
                y = spans[0].get("origin", [0, 0])[1]
                lines.append({"text": text, "size": size, "y": y})
    return lines


def parse_resume_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """Parse a (text-based) resume PDF into a canonical JSON structure.

    Returns a dict with keys: resume_id, resume_hash, items (experiences & projects), skills
    """
    if not pdf_bytes:
        raise ValueError("Empty PDF bytes")

    resume_hash = sha256(pdf_bytes)

    lines = _extract_lines_with_fonts(pdf_bytes)
    if len("".join(l["text"] for l in lines).strip()) < 20:
        raise ValueError("This PDF looks like a scanned image. Run OCR first (e.g., Tesseract).")

    # Heuristic: determine heading size threshold (top 20% font sizes)
    sizes = sorted({round(l["size"], 1) for l in lines if l["size"]})
    big_sizes = set(s for s in sizes[int(0.8 * len(sizes)):] ) if sizes else set()

    # Pass 1: segment into sections by explicit headers or big font cues
    sections: List[Tuple[str, List[str]]] = []  # (section_key or "body", lines)
    current_key = "body"
    buf: List[str] = []

    for l in lines:
        raw = l["text"].strip()
        if not raw:
            continue
        key = _is_section_header(raw)
        if key or (l["size"] in big_sizes and _is_section_header(raw) is not None):
            # flush
            if buf:
                sections.append((current_key, buf))
                buf = []
            current_key = key or _is_section_header(raw) or "body"
            continue
        buf.append(raw)

    if buf:
        sections.append((current_key, buf))

    # Collect items & skills
    items: List[Item] = []
    skills: List[str] = []

    def flush_item(cur_lines: List[str], item_type: str, order_idx: int):
        if not cur_lines:
            return
        header = cur_lines[0]
        rest = cur_lines[1:]
        start, end = _normalize_date_range(header)
        # Guess company/role/name from header (very heuristic)
        company = role = name = None
        # Common delimiters between company and role
        parts = re.split(r"\s+[\u2013\u2014\-|]\s+|\s+\u2022\s+|\s*—\s*|\s*\|\s*|\s*[,]\s*", header)
        if item_type == "experience":
            # Try to assign company (first) and role (second)
            if parts:
                company = parts[0].strip()
            if len(parts) > 1:
                role = parts[1].strip()
        else:  # project
            name = parts[0].strip() if parts else header

        # Extract bullets: lines that start with bullet prefixes; merge wrapped lines
        bullets: List[Bullet] = []
        cur_b: Optional[str] = None
        for line in rest:
            if BULLET_PREFIX.match(line):
                # start new bullet
                if cur_b:
                    text = _clean_text(cur_b)
                    if text:
                        bullets.append(Bullet(bullet_id=str(uuid.uuid4()), text=text, order_index=len(bullets)))
                # remove prefix
                cur_b = BULLET_PREFIX.sub("", line).strip()
            else:
                # continuation of current bullet or part of header tail; append
                if cur_b is not None:
                    cur_b += " " + line.strip()
                else:
                    # treat as paragraph bullet when no explicit bullets present
                    if line.strip():
                        if bullets:
                            bullets[-1].text += " " + line.strip()
                        else:
                            # start implicit bullet
                            cur_b = line.strip()
        if cur_b:
            text = _clean_text(cur_b)
            if text:
                bullets.append(Bullet(bullet_id=str(uuid.uuid4()), text=text, order_index=len(bullets)))

        # If still no bullets, treat entire body as one bullet
        if not bullets and rest:
            text = _clean_text(" ".join(rest))
            bullets.append(Bullet(bullet_id=str(uuid.uuid4()), text=text, order_index=0))

        items.append(
            Item(
                item_id=str(uuid.uuid4()),
                item_type=item_type,
                company=company,
                role=role,
                name=name,
                start=start,
                end=end,
                order_index=order_idx,
                bullets=bullets,
            )
        )

    order_counter = 0
    for sec_key, sec_lines in sections:
        key = sec_key or "body"
        t = key.lower()
        if t in ("experience", "projects"):
            # Split items by blank lines or header-like lines with dates
            buf_item: List[str] = []
            for line in sec_lines:
                # New item start if line likely contains date range
                if DATE_RANGE.search(line) or YEAR_RANGE.search(line):
                    if buf_item:
                        flush_item(buf_item, "experience" if t == "experience" else "project", order_counter)
                        order_counter += 1
                        buf_item = []
                buf_item.append(line)
            if buf_item:
                flush_item(buf_item, "experience" if t == "experience" else "project", order_counter)
                order_counter += 1
        elif t == "skills":
            # Extract comma/pipe-separated skills from the section
            joined = " ".join(sec_lines)
            raw = re.split(r"[,\|\u2022\n]", joined)
            for s in raw:
                s = s.strip()
                if not s:
                    continue
                # drop very long tokens
                if len(s) > 40:
                    continue
                skills.append(s)
        else:
            # ignore other sections (education can be added similarly if needed)
            pass

    # Build JSON
    out_items: List[Dict[str, Any]] = []
    for it in items:
        out_items.append({
            "id": it.item_id,
            "item_type": it.item_type,
            "company": it.company,
            "role": it.role,
            "name": it.name,
            "start": it.start,
            "end": it.end,
            "order_index": it.order_index,
            "bullets": [asdict(b) for b in it.bullets],
        })

    return {
        "resume_id": str(uuid.uuid4()),
        "resume_hash": resume_hash,
        "items": out_items,
        "skills": skills,
    }


if __name__ == "__main__":
    # Quick manual test: python resume_parser.py path/to/resume.pdf
    import sys, json
    if len(sys.argv) < 2:
        print("Usage: python resume_parser.py <resume.pdf>")
        raise SystemExit(1)
    path = sys.argv[1]
    with open(path, "rb") as f:
        pdfb = f.read()
    data = parse_resume_pdf(pdfb)
    print(json.dumps(data, indent=2, ensure_ascii=False))

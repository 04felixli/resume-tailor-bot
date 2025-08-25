# app/models/resume.py
from pydantic import BaseModel
from typing import List, Optional

class BulletOut(BaseModel):
    bullet_id: str
    text: str
    order_index: int

class ItemOut(BaseModel):
    id: str
    item_type: str                 # "experience" | "project"
    company: Optional[str] = None  # experience
    role: Optional[str] = None     # experience
    name: Optional[str] = None     # project
    start: Optional[str] = None    # "YYYY-MM"
    end: Optional[str] = None      # "YYYY-MM" or "Present"
    order_index: int
    bullets: List[BulletOut]

class ResumeOut(BaseModel):
    resume_id: str
    resume_hash: str
    items: List[ItemOut]
    skills: List[str]

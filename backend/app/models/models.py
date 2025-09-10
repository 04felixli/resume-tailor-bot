# app/models/resume.py
from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    id: str
    type: str | None
    company: str | None
    role: str | None
    name: str | None
    start: str | None
    end: str | None
    bullets: List[str]

class InputModel(BaseModel):
    rewrite: bool
    job_description: str
    top_x: int
    skills: List[str]
    items: List[Item]

class OutputModel(BaseModel):
    rewrittenBullets: List[Item] 
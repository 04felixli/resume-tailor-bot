import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.models.models import OutputModel, InputModel
from backend.app.services import retrieval as resume_svc
from app.services.parseJD import parse_jd_sections
from app.services.retrieval import score_bullets_vs_jd_sections, pick_top_items_from_scores

router = APIRouter(prefix="/api", tags=["tailor"])

@router.post("/tailor", response_model=OutputModel)
async def tailor(input: InputModel):
    if not input.items:
        raise HTTPException(status_code=400, detail="No items found.")

    parsed_JD = parse_jd_sections(input.job_description)
    bullets = []
    bullet_to_id = []
    items_by_id = {} # id : Item
    
    for item in input.items: 
        items_by_id[item.id] = item
        for b in item.bullets: 
            bullets.append(b)
            bullet_to_id.apppend(item.id)
    
    _, bullet_scores, _ = score_bullets_vs_jd_sections(bullets, parsed_JD, None)
    top_items = pick_top_items_from_scores(bullet_scores, bullet_to_id, items_by_id, input.top_x, 200, 3)

    # 1. Call function to split job description into sections
    # 2. embed job description and items 
    # 3. retrieve most relevant items
    # 4. rewrite bullet points
    # 5. return the final output

    return OutputModel.model_validate(top_items)

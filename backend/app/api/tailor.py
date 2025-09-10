import asyncio
from collections import defaultdict
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.models import OutputModel, InputModel
from app.services import retrieval as resume_svc
from app.services.parseJD import parse_jd_sections
from app.services.retrieval import score_bullets_vs_jd_sections, pick_top_items_from_scores
from app.services.rewrite import rewrite_bullets

router = APIRouter(prefix="/api", tags=["tailor"])

@router.post("/tailor", response_model=OutputModel)
async def tailor(input: InputModel):
    if not input.items:
        print("No items found in input.")
        raise HTTPException(status_code=400, detail="No items found.")

    parsed_JD = { 
        'requirements': input.job_description.split('\n'),
        'responsibilities' : [],
        'preferred' : [],
        'skills' : [],
    }

    print("Parsed JD sections:", parsed_JD)


    bullets = []
    bullet_to_id = []
    items_by_id = {} # id : Item

    for item in input.items:
        items_by_id[item.id] = item
        for b in item.bullets:
            bullets.append(b)
            bullet_to_id.append(item.id)

    _, bullet_scores, _ = score_bullets_vs_jd_sections(bullets, parsed_JD, None)
    print("Bullet scores:", bullet_scores)
    top_items = pick_top_items_from_scores(bullet_scores, bullet_to_id, items_by_id, input.top_x, 10)

    # 1. Call function to split job description into sections
    # 2. embed job description and items 
    # 3. retrieve most relevant items
    # 4. rewrite bullet points
    # 5. return the final output

    if input.rewrite:
        top_items = rewrite_bullets(parsed_JD, top_items)

    return OutputModel(rewrittenBullets=top_items)

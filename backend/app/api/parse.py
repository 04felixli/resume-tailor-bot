import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.resume import ResumeOut
from app.services import resume as resume_svc

router = APIRouter(prefix="/api", tags=["parse"])

@router.post("/parse", response_model=ResumeOut)
async def parse_resume(resume_pdf: UploadFile = File(...)):
    if resume_pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF file.")

    pdf_bytes = await resume_pdf.read()

    try:
        data = await asyncio.to_thread(resume_svc.parse_resume_pdf, pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return ResumeOut.model_validate(data)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import routers
from app.api.tailor import router as tailor_router

app = FastAPI(title="Resume Tailor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount feature routers
app.include_router(tailor_router)

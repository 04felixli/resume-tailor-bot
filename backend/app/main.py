from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import routers
from app.api.parse import router as parse_router

app = FastAPI(title="Resume Tailor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount feature routers
app.include_router(parse_router)

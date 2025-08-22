from fastapi import FastAPI

app = FastAPI(title="Resume Tailor API")

@app.get("/ping")
def ping():
    return {"ok": True}

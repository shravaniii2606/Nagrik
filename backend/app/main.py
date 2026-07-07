from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import example_route

app = FastAPI(title="Hackathon Backend")

# CORS scoped to the actual frontend origin - never "*" outside quick local debugging.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(example_route.router)


@app.get("/api/health")
def health_check():
    """Used by the frontend starter to confirm connectivity."""
    return {"message": "backend is up", "environment": settings.environment}

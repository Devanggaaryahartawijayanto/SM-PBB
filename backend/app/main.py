from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.core.utils import simple_generate_unique_route_id

from app.auth.router import router as auth_router
from app.sppt.router import router as sppt_router
from app.routes.profile import router as profile_router
from app.routes.dashboard import router as dashboard_router
from app.core.config import settings

app = FastAPI(
    openapi_url=settings.OPENAPI_URL,
    generate_unique_id_function=simple_generate_unique_route_id,
    root_path="/api",
)

# Middleware for CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(sppt_router, prefix="/op")
app.include_router(profile_router, prefix="/profile")
app.include_router(dashboard_router)  # Dashboard router already has prefix

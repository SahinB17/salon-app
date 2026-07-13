from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routers import auth, users, salons, services, appointments, staff, upload, notifications, reviews, favorites

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1",
    "http://132.226.206.18",
    "https://132.226.206.18",
    "https://salon.shinetech.app",
    "http://salon.shinetech.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (for image uploads)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(salons.router, prefix=settings.API_V1_STR)
app.include_router(services.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router, prefix=settings.API_V1_STR)
app.include_router(staff.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR, tags=["reviews"])
app.include_router(favorites.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"status": "success", "message": "Salon App API is running!"}

import os
import shutil
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["Uploads"])

# Ensure the upload directory exists
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "salon_admin":
        raise HTTPException(status_code=403, detail="Yalnız salon adminləri şəkil yükləyə bilər")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Yalnız şəkil faylları qəbul edilir")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1]
    filename = f"{uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"/static/uploads/{filename}"}

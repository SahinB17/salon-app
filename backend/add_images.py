import asyncio
from app.db.database import AsyncSessionLocal
from sqlalchemy.future import select
from app.models.salon import Salon
from app.models.salon_image import SalonImage

async def run():
    db = AsyncSessionLocal()
    result = await db.execute(select(Salon).limit(1))
    salon = result.scalar_one_or_none()
    if salon:
        print(f"Adding images to Salon ID {salon.id}")
        urls = [
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600948836101-f9ff09c1f016?q=80&w=600&auto=format&fit=crop"
        ]
        for url in urls:
            db_img = SalonImage(salon_id=salon.id, image_url=url)
            db.add(db_img)
        await db.commit()
        print("Done!")
    else:
        print("No salons found!")
    await db.close()

if __name__ == "__main__":
    asyncio.run(run())

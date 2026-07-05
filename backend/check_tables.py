import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test():
    engine = create_async_engine('postgresql+asyncpg://postgres:sahinmb123@localhost:5432/salon_db')
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        print([row[0] for row in result])
    await engine.dispose()

asyncio.run(test())

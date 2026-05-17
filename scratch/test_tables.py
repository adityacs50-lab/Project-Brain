import asyncio
import sys
sys.path.append('STATELOCK')
from sqlalchemy.ext.asyncio import create_async_engine
from backend.models import Base

async def test():
    try:
        engine = create_async_engine('postgresql+asyncpg://postgres.fqxtynflemlrehcrcwsz:GsFW70JV2nOt1mJJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres')
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print('TABLES OK')
    except Exception as e:
        print(f'TABLES FAIL: {e}')

if __name__ == "__main__":
    asyncio.run(test())

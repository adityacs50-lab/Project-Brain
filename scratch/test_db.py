import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test():
    try:
        engine = create_async_engine('postgresql+asyncpg://postgres.fqxtynflemlrehcrcwsz:GsFW70JV2nOt1mJJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres')
        async with engine.connect() as conn:
            await conn.execute(text('SELECT 1'))
            print('DB OK')
    except Exception as e:
        print(f'DB FAIL: {e}')

if __name__ == "__main__":
    asyncio.run(test())

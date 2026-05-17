import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test():
    try:
        engine = create_async_engine('postgresql+asyncpg://postgres.fqxtynflemlrehcrcwsz:GsFW70JV2nOt1mJJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres')
        async with engine.begin() as conn:
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
            print('VECTOR EXTENSION OK')
    except Exception as e:
        print(f'VECTOR EXTENSION FAIL: {e}')

if __name__ == "__main__":
    asyncio.run(test())

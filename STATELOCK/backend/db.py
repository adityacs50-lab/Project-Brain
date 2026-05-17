import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Handle potential postgres:// vs postgresql:// and ensure asyncpg driver is used
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = None
AsyncSessionLocal = None

if DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
else:
    print("WARNING: DATABASE_URL is not set!")

Base = declarative_base()

async def get_db():
    if AsyncSessionLocal is None:
        raise Exception("Database session local not configured. Set DATABASE_URL.")
    async with AsyncSessionLocal() as session:
        yield session


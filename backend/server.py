from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.concurrency import run_in_threadpool
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
import os
import logging
from pathlib import Path
from typing import Annotated, Optional
from datetime import datetime, timezone

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from brand_assets import router as brand_router, init_storage

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude={"id"})
        if self.id:
            data["_id"] = ObjectId(self.id)
        return data

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)


class WaitlistEntry(BaseDocument):
    name: str
    email: str
    role: Optional[str] = None
    created_at: str


class WaitlistIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    role: Optional[str] = Field(default=None, max_length=60)


class WaitlistOut(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str]
    position: int
    already_joined: bool


@api_router.get("/")
async def root():
    return {"message": "ConTech OS API"}


@api_router.post("/waitlist", response_model=WaitlistOut)
async def join_waitlist(payload: WaitlistIn):
    email = payload.email.lower().strip()
    entry = WaitlistEntry(
        name=payload.name.strip(),
        email=email,
        role=payload.role,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    already = False
    try:
        res = await db.waitlist.insert_one(entry.to_mongo())
        entry.id = str(res.inserted_id)
    except DuplicateKeyError:
        already = True
        entry = WaitlistEntry.from_mongo(await db.waitlist.find_one({"email": email}))
    position = await db.waitlist.count_documents({"created_at": {"$lte": entry.created_at}})
    return WaitlistOut(
        id=entry.id, name=entry.name, email=entry.email, role=entry.role,
        position=position, already_joined=already,
    )


@api_router.get("/waitlist/count")
async def waitlist_count():
    return {"count": await db.waitlist.count_documents({})}


app.include_router(api_router)
app.include_router(brand_router)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.waitlist.create_index("email", unique=True)
    try:
        await run_in_threadpool(init_storage)
    except Exception:
        logger.exception("Brand storage initialization deferred until next asset request")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

from fastapi import APIRouter

router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"ok": True}


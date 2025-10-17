from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import session_scope
from ..models import Blogger, Counterparty


router = APIRouter(prefix="/api/bloggers", tags=["bloggers"])


def get_session() -> Session:
    with session_scope() as s:
        yield s


class BloggerIn(BaseModel):
    name: str
    url: str
    network: Optional[str] = None
    subscribers: Optional[int] = None
    avg_reach: Optional[int] = None


@router.get("")
def list_bloggers(session: Session = Depends(get_session)):
    return [
        {
            "id": b.id,
            "name": b.name,
            "url": b.url,
            "network": b.network,
            "subscribers": b.subscribers,
            "avg_reach": b.avg_reach,
        }
        for b in session.query(Blogger).order_by(Blogger.id.desc()).all()
    ]


@router.post("")
def create_blogger(data: BloggerIn, session: Session = Depends(get_session)):
    # Uniqueness by URL enforced at DB level too
    exists = session.query(Blogger).filter(Blogger.url == data.url).first()
    if exists:
        return {"error": "duplicate url"}
    b = Blogger(
        name=data.name,
        url=data.url,
        network=data.network,
        subscribers=data.subscribers,
        avg_reach=data.avg_reach,
    )
    session.add(b)
    session.flush()
    return {"id": b.id}


class BloggerCounterpartiesIn(BaseModel):
    counterparty_ids: list[int]


@router.patch("/{bid}/counterparties")
def set_blogger_counterparties(bid: int, data: BloggerCounterpartiesIn, session: Session = Depends(get_session)):
    b = session.get(Blogger, bid)
    if not b:
        raise HTTPException(404, "blogger not found")
    cps = session.query(Counterparty).filter(Counterparty.id.in_(data.counterparty_ids)).all()
    # Replace links with provided set
    b.counterparties = cps
    session.flush()
    return {"id": b.id, "counterparty_ids": [c.id for c in b.counterparties]}

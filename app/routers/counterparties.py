from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import session_scope
from ..models import Counterparty


router = APIRouter(prefix="/api/counterparties", tags=["counterparties"])


def get_session() -> Session:
    with session_scope() as s:
        yield s


class CounterpartyIn(BaseModel):
    name: str
    type: Optional[str] = None
    inn: Optional[str] = None
    relationship_type: Optional[str] = None


@router.get("")
def list_counterparties(session: Session = Depends(get_session)):
    return [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "inn": c.inn,
            "relationship_type": c.relationship_type,
        }
        for c in session.query(Counterparty).order_by(Counterparty.id.desc()).all()
    ]


@router.post("")
def create_counterparty(data: CounterpartyIn, session: Session = Depends(get_session)):
    c = Counterparty(
        name=data.name,
        type=data.type,
        inn=data.inn,
        relationship_type=data.relationship_type,
    )
    session.add(c)
    session.flush()
    return {"id": c.id}


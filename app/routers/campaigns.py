from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import session_scope
from ..models import Campaign, Placement
from ..services import update_overdue_status


router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


def get_session() -> Session:
    with session_scope() as s:
        yield s


class CampaignIn(BaseModel):
    name: str
    product: Optional[str] = None
    goal_type: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = None
    start_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="YYYY-MM-DD")


@router.get("")
def list_campaigns(session: Session = Depends(get_session)):
    return [
        {
            "id": c.id,
            "name": c.name,
            "product": c.product,
            "goal_type": c.goal_type,
            "budget": c.budget,
            "status": c.status,
            "start_date": str(c.start_date) if c.start_date else None,
            "end_date": str(c.end_date) if c.end_date else None,
        }
        for c in session.query(Campaign).order_by(Campaign.id.desc()).all()
    ]


@router.post("")
def create_campaign(data: CampaignIn, session: Session = Depends(get_session)):
    c = Campaign(
        name=data.name,
        product=data.product,
        goal_type=data.goal_type,
        budget=data.budget,
        status=data.status or "PLANNED",
        start_date=data.start_date,
        end_date=data.end_date,
    )
    session.add(c)
    session.flush()
    return {"id": c.id}


@router.get("/{cid}")
def get_campaign(cid: int, session: Session = Depends(get_session)):
    # keep overdue flags up to date
    update_overdue_status(session)
    c = session.get(Campaign, cid)
    if not c:
        raise HTTPException(404, "campaign not found")
    placements = (
        session.query(Placement)
        .filter(Placement.campaign_id == c.id)
        .order_by(Placement.id.desc())
        .all()
    )
    return {
        "id": c.id,
        "name": c.name,
        "product": c.product,
        "goal_type": c.goal_type,
        "budget": c.budget,
        "status": c.status,
        "start_date": str(c.start_date) if c.start_date else None,
        "end_date": str(c.end_date) if c.end_date else None,
        "placements": [
            {
                "id": p.id,
                "blogger_id": p.blogger_id,
                "counterparty_id": p.counterparty_id,
                "placement_date": str(p.placement_date) if p.placement_date else None,
                "fee": p.fee,
                "status": p.status,
            }
            for p in placements
        ],
    }

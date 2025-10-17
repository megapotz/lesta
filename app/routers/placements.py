from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from io import BytesIO
from openpyxl import Workbook
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import session_scope
from ..models import Placement
from ..enums import PlacementStatus
from ..services import update_overdue_status


router = APIRouter(prefix="/api/placements", tags=["placements"])


def get_session() -> Session:
    with session_scope() as s:
        yield s


class PlacementIn(BaseModel):
    campaign_id: int
    blogger_id: int
    counterparty_id: Optional[int] = None
    placement_date: Optional[str] = None
    fee: Optional[float] = None
    status: Optional[str] = None


@router.get("")
def list_placements(status: Optional[str] = None, session: Session = Depends(get_session)):
    update_overdue_status(session)
    q = session.query(Placement)
    if status:
        q = q.filter(Placement.status == status)
    rows = []
    for p in q.order_by(Placement.id.desc()).all():
        rows.append(
            {
                "id": p.id,
                "campaign_id": p.campaign_id,
                "blogger_id": p.blogger_id,
                "counterparty_id": p.counterparty_id,
                "placement_date": str(p.placement_date) if p.placement_date else None,
                "fee": p.fee,
                "status": p.status,
            }
        )
    return rows


@router.post("")
def create_placement(data: PlacementIn, session: Session = Depends(get_session)):
    status = data.status or PlacementStatus.PLANNING.value
    p = Placement(
        campaign_id=data.campaign_id,
        blogger_id=data.blogger_id,
        counterparty_id=data.counterparty_id,
        placement_date=data.placement_date,
        fee=data.fee,
        status=status,
    )
    session.add(p)
    session.flush()
    return {"id": p.id}


@router.get("/export/prepayments")
def export_prepayments(session: Session = Depends(get_session)):
    # Filter placements waiting for payment
    rows = (
        session.query(Placement)
        .filter(Placement.status == PlacementStatus.WAITING_PAYMENT.value)
        .order_by(Placement.id.asc())
        .all()
    )

    wb = Workbook()
    ws = wb.active
    ws.title = "Prepayments"
    ws.append([
        "ID",
        "Campaign ID",
        "Blogger ID",
        "Counterparty ID",
        "Placement Date",
        "Fee",
        "Status",
    ])
    for p in rows:
        ws.append([
            p.id,
            p.campaign_id,
            p.blogger_id,
            p.counterparty_id,
            str(p.placement_date) if p.placement_date else "",
            p.fee or 0.0,
            p.status,
        ])

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="prepayments.xlsx"'
        },
    )

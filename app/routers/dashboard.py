from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import session_scope
from ..models import Campaign, Placement
from ..enums import PlacementStatus
from ..services import campaign_progress


router = APIRouter(prefix="/api", tags=["dashboard"])


def get_session() -> Session:
    with session_scope() as s:
        yield s


@router.get("/dashboard")
def get_dashboard(session: Session = Depends(get_session)):
    # Publications = placements in PUBLISHED/DONE
    pub_statuses = [
        PlacementStatus.PUBLISHED.value,
        PlacementStatus.DONE.value,
    ]

    publications = (
        session.query(func.count(Placement.id))
        .filter(Placement.status.in_(pub_statuses))
        .scalar()
        or 0
    )

    # Spend = sum of fees for published/done
    spend = (
        session.query(func.coalesce(func.sum(Placement.fee), 0.0))
        .filter(Placement.status.in_(pub_statuses))
        .scalar()
        or 0.0
    )

    # Average CPV across placements with views>0
    views_sum = (
        session.query(func.coalesce(func.sum(Placement.views), 0))
        .filter(Placement.status.in_(pub_statuses))
        .filter(Placement.views != None)  # noqa: E711
        .scalar()
        or 0
    )
    cpv = float(spend) / views_sum if views_sum else 0.0

    # Average ER from available rows
    er_rows = (
        session.query(Placement.er)
        .filter(Placement.status.in_(pub_statuses))
        .filter(Placement.er != None)  # noqa: E711
        .all()
    )
    er_values = [row[0] for row in er_rows if row[0] is not None]
    er_avg = sum(er_values) / len(er_values) if er_values else 0.0

    # Active campaigns progress
    campaigns = (
        session.query(Campaign).filter(Campaign.status == "ACTIVE").all()
    )
    progress = []
    for c in campaigns:
        # campaign spend = sum of fees for its placements (published/done)
        c_spend = (
            session.query(func.coalesce(func.sum(Placement.fee), 0.0))
            .filter(Placement.campaign_id == c.id)
            .filter(Placement.status.in_(pub_statuses))
            .scalar()
            or 0.0
        )
        progress.append(
            {
                "id": c.id,
                "name": c.name,
                **campaign_progress(c, c_spend),
            }
        )

    return {
        "spend": float(spend),
        "publications": int(publications),
        "cpv": cpv,
        "er": er_avg,
        "active_campaigns": progress,
    }


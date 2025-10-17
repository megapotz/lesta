from __future__ import annotations

from datetime import date
from typing import Iterable

from sqlalchemy.orm import Session

from .models import Placement, Campaign
from .enums import PlacementStatus


def update_overdue_status(session: Session) -> int:
    today = date.today()
    q = (
        session.query(Placement)
        .filter(Placement.placement_date != None)  # noqa: E711
        .filter(Placement.placement_date < today)
        .filter(Placement.status != PlacementStatus.PUBLISHED.value)
        .filter(Placement.status != PlacementStatus.DONE.value)
    )
    changed = 0
    for p in q.all():
        if p.status != PlacementStatus.OVERDUE.value:
            p.status = PlacementStatus.OVERDUE.value
            changed += 1
    return changed


def campaign_progress(c: Campaign, spent: float) -> dict:
    # Compute time and budget progress for dashboard
    time_pct = 0.0
    if c.start_date and c.end_date and c.end_date > c.start_date:
        total = (c.end_date - c.start_date).days
        elapsed = max(0, (date.today() - c.start_date).days)
        time_pct = max(0.0, min(1.0, elapsed / total))
    budget_pct = 0.0
    if c.budget and c.budget > 0:
        budget_pct = max(0.0, min(1.0, (spent or 0.0) / c.budget))
    color = "yellow" if time_pct > budget_pct else "green"
    return {"time_pct": time_pct, "budget_pct": budget_pct, "color": color}


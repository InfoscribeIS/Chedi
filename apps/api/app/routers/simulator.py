from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db
from ..schemas import SimRequest, SimResult
from ..services.market_data import get_market_data
from ..services.simulator import simulate
from .portfolio import get_user_settings

router = APIRouter(prefix="/simulator", tags=["simulator"])


@router.post("", response_model=SimResult)
def run_simulation(payload: SimRequest, db: Session = Depends(get_db)):
    market = get_market_data()
    user = get_user_settings(db)
    positions = db.query(models.Position).all()
    try:
        return simulate(payload, positions, user, market)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Actif inconnu : {payload.symbol}")

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas import CopilotIn, CopilotOut, CopilotStatus
from ..services import copilot
from ..services.market_data import get_market_data

router = APIRouter(prefix="/copilot", tags=["copilot"])


@router.get("/status", response_model=CopilotStatus)
def copilot_status():
    return copilot.status()


@router.post("", response_model=CopilotOut)
def ask(payload: CopilotIn, db: Session = Depends(get_db)):
    state = copilot.status()
    if not state.available:
        raise HTTPException(status_code=503, detail=state.reason)
    if not copilot.get_limiter().allow():
        raise HTTPException(
            status_code=429,
            detail="Trop de questions d'un coup — attends une minute (protection du budget API).",
        )
    try:
        return copilot.ask(payload.message, payload.history, get_market_data(), db)
    except Exception as exc:  # typed anthropic errors all degrade to a clean 502
        raise HTTPException(status_code=502, detail=f"Le copilote n'a pas pu répondre : {type(exc).__name__}")

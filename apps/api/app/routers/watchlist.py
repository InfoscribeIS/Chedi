from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db
from ..schemas import WatchlistIn, WatchlistItemOut
from ..services.market import to_quote_out
from ..services.market_data import get_market_data

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=list[WatchlistItemOut])
def watchlist(db: Session = Depends(get_db)):
    market = get_market_data()
    items = db.query(models.WatchlistItem).order_by(models.WatchlistItem.added_at.desc()).all()
    quotes = market.get_quotes([i.symbol for i in items]) if items else {}
    out = []
    for item in items:
        asset = market.asset(item.symbol)
        quote = quotes.get(asset.symbol) if asset else None
        out.append(WatchlistItemOut(
            id=item.id,
            symbol=item.symbol,
            reason=item.reason,
            added_at=item.added_at,
            quote=to_quote_out(asset, quote) if asset and quote else None,
        ))
    return out


@router.post("", status_code=201)
def add(payload: WatchlistIn, db: Session = Depends(get_db)):
    market = get_market_data()
    asset = market.asset(payload.symbol)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Actif inconnu : {payload.symbol}")
    existing = db.query(models.WatchlistItem).filter_by(symbol=asset.symbol).first()
    if existing:
        existing.reason = payload.reason or existing.reason
        db.commit()
        return {"id": existing.id, "updated": True}
    item = models.WatchlistItem(symbol=asset.symbol, reason=payload.reason)
    db.add(item)
    db.commit()
    return {"id": item.id, "updated": False}


@router.delete("/{item_id}", status_code=204)
def remove(item_id: int, db: Session = Depends(get_db)):
    item = db.get(models.WatchlistItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Élément introuvable")
    db.delete(item)
    db.commit()

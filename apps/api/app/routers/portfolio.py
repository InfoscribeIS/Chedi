from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db
from ..schemas import (
    DISCLAIMER,
    PortfolioOut,
    PositionIn,
    PositionOut,
    SettingsIn,
    SettingsOut,
)
from ..services.market_data import get_market_data
from ..services.risk import (
    allocation,
    build_risk_cards,
    build_rule_checks,
    value_positions,
)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


def get_user_settings(db: Session) -> models.UserSettings:
    user = db.get(models.UserSettings, 1)
    if user is None:
        user = models.UserSettings(id=1)
        db.add(user)
        db.commit()
    return user


@router.get("", response_model=PortfolioOut)
def portfolio(db: Session = Depends(get_db)):
    market = get_market_data()
    user = get_user_settings(db)
    positions = db.query(models.Position).all()
    views = value_positions(positions, market)

    total = sum(v.value_eur for v in views) + user.cash_eur
    invested = sum(v.invested_eur for v in views)
    pnl = sum(v.value_eur - v.invested_eur for v in views)

    return PortfolioOut(
        positions=[
            PositionOut(
                id=v.id, symbol=v.symbol, name=v.name, asset_class=v.asset_class,
                quantity=v.quantity, buy_price=v.buy_price, buy_currency=v.buy_currency,
                buy_date=v.buy_date, note=v.note, current_price=v.current_price,
                price_currency=v.price_currency, value_eur=v.value_eur,
                invested_eur=v.invested_eur,
                pnl_eur=round(v.value_eur - v.invested_eur, 2),
                pnl_pct=round((v.value_eur / v.invested_eur - 1) * 100, 2) if v.invested_eur else None,
                source=v.source, as_of=v.as_of,
            )
            for v in views
        ],
        cash_eur=round(user.cash_eur, 2),
        total_value_eur=round(total, 2),
        invested_eur=round(invested, 2),
        pnl_eur=round(pnl, 2),
        pnl_pct=round(pnl / invested * 100, 2) if invested else None,
        allocation=allocation(views, user.cash_eur),
        risk_cards=build_risk_cards(views, user.cash_eur, user),
        rule_checks=build_rule_checks(views, user.cash_eur, user),
        fx_eur_usd=round(market.fx_usd_per_eur(), 4),
        as_of=datetime.now(timezone.utc),
    )


@router.post("/positions", status_code=201)
def add_position(payload: PositionIn, db: Session = Depends(get_db)):
    market = get_market_data()
    asset = market.asset(payload.symbol)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Actif inconnu : {payload.symbol}")
    if payload.buy_currency.upper() not in ("EUR", "USD"):
        raise HTTPException(status_code=422, detail="Devise d'achat supportée : EUR ou USD")
    position = models.Position(
        symbol=asset.symbol,
        quantity=payload.quantity,
        buy_price=payload.buy_price,
        buy_currency=payload.buy_currency.upper(),
        buy_date=payload.buy_date,
        note=payload.note,
    )
    db.add(position)
    db.commit()
    return {"id": position.id, "disclaimer": DISCLAIMER}


@router.delete("/positions/{position_id}", status_code=204)
def delete_position(position_id: int, db: Session = Depends(get_db)):
    position = db.get(models.Position, position_id)
    if position is None:
        raise HTTPException(status_code=404, detail="Position introuvable")
    db.delete(position)
    db.commit()


@router.get("/settings", response_model=SettingsOut)
def read_settings(db: Session = Depends(get_db)):
    user = get_user_settings(db)
    return SettingsOut(
        cash_eur=user.cash_eur,
        rule_max_crypto_pct=user.rule_max_crypto_pct,
        rule_max_position_pct=user.rule_max_position_pct,
        rule_reserve_eur=user.rule_reserve_eur,
    )


@router.put("/settings", response_model=SettingsOut)
def update_settings(payload: SettingsIn, db: Session = Depends(get_db)):
    user = get_user_settings(db)
    for field in ("cash_eur", "rule_max_crypto_pct", "rule_max_position_pct", "rule_reserve_eur"):
        value = getattr(payload, field)
        if value is not None:
            setattr(user, field, value)
    db.commit()
    return read_settings(db)

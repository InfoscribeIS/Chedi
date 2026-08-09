from fastapi import APIRouter

from ..schemas import AssetRef, OverviewOut
from ..services.market import build_overview
from ..services.market_data import get_market_data

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/overview", response_model=OverviewOut)
def overview():
    return build_overview(get_market_data())


@router.get("/assets", response_model=list[AssetRef])
def assets(q: str = ""):
    market = get_market_data()
    return [
        AssetRef(symbol=a.symbol, name=a.name, asset_class=a.asset_class, currency=a.currency)
        for a in market.search(q)
    ]

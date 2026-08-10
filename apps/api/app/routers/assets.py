from fastapi import APIRouter, HTTPException

from ..schemas import AssetDetailOut
from ..services.assets import build_detail
from ..services.market_data import get_market_data

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/{symbol}", response_model=AssetDetailOut)
def asset_detail(symbol: str):
    try:
        return build_detail(get_market_data(), symbol)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Actif inconnu : {symbol}")
    except Exception:
        # Filet de sécurité : une source de données capricieuse ne doit jamais
        # produire un 500 nu côté interface.
        raise HTTPException(
            status_code=502,
            detail="Les sources de données sont momentanément en difficulté pour cet actif. Réessaie dans une minute.",
        )

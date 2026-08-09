import os
import sys
from pathlib import Path

# Tests always run offline, against demo data and a throwaway database.
os.environ["DATA_MODE"] = "demo"
os.environ["DATABASE_URL"] = "sqlite:///./test_investcopilot.db"

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest

from app.services.market_data import reset_market_data


@pytest.fixture(autouse=True)
def demo_market():
    yield reset_market_data(mode="demo")


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.db import Base, engine
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c

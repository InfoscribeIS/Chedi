"""End-to-end smoke tests in demo mode (no network, no API key)."""


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_overview_shape(client):
    r = client.get("/api/market/overview")
    assert r.status_code == 200
    data = r.json()
    assert data["pulse"]["score"] >= 0
    assert data["summary"]["text"]
    assert data["summary"]["is_ai"] is False  # no key in tests
    symbols = [q["symbol"] for g in data["groups"] for q in g["quotes"]]
    assert "^GSPC" in symbols and "BTC" in symbols
    for group in data["groups"]:
        for q in group["quotes"]:
            assert q["source"]  # traceability is mandatory
            assert q["light"]["reason"]


def test_asset_detail_and_404(client):
    r = client.get("/api/assets/BTC")
    assert r.status_code == 200
    data = r.json()
    assert len(data["candles"]) > 200
    assert data["why"]["facts"]
    assert client.get("/api/assets/NOPE").status_code == 404


def test_portfolio_flow(client):
    # settings
    r = client.put("/api/portfolio/settings", json={"cash_eur": 1000, "rule_max_crypto_pct": 30})
    assert r.status_code == 200

    # add position
    r = client.post("/api/portfolio/positions", json={"symbol": "ETH", "quantity": 0.1, "buy_price": 3000})
    assert r.status_code == 201

    r = client.get("/api/portfolio")
    data = r.json()
    assert data["cash_eur"] == 1000
    assert len(data["positions"]) == 1
    assert data["total_value_eur"] > 1000
    assert {c["key"] for c in data["risk_cards"]} == {"concentration", "crypto", "volatility", "scenario"}

    # delete
    pid = data["positions"][0]["id"]
    assert client.delete(f"/api/portfolio/positions/{pid}").status_code == 204


def test_watchlist_flow(client):
    r = client.post("/api/watchlist", json={"symbol": "NVDA", "reason": "Leader IA"})
    assert r.status_code == 201
    items = client.get("/api/watchlist").json()
    assert items[0]["symbol"] == "NVDA"
    assert items[0]["reason"] == "Leader IA"
    assert items[0]["quote"]["price"] is not None
    assert client.delete(f"/api/watchlist/{items[0]['id']}").status_code == 204


def test_simulator_endpoint(client):
    client.put("/api/portfolio/settings", json={"cash_eur": 1000})
    r = client.post("/api/simulator", json={"symbol": "BTC", "amount_eur": 200})
    assert r.status_code == 200
    data = r.json()
    assert data["after"]["crypto_pct"] == 20.0
    assert len(data["scenarios"]) == 3


def test_copilot_unavailable_without_key(client):
    assert client.get("/api/copilot/status").json()["available"] is False
    assert client.post("/api/copilot", json={"message": "Pourquoi Bitcoin baisse ?"}).status_code == 503

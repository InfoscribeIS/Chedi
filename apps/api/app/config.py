"""Application settings, loaded from environment / .env file.

All secrets (API keys) live here, server-side only — they are never sent
to the frontend.
"""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # "auto": try live providers, fall back to demo data on failure.
    # "demo": never touch the network (useful offline, in CI and for tests).
    # "live": live providers only, errors surface instead of falling back.
    data_mode: Literal["auto", "demo", "live"] = "auto"

    database_url: str = "sqlite:///./investcopilot.db"

    # Comma-separated list of allowed frontend origins.
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Optional — the app works without it (rule-based summaries, copilot disabled).
    anthropic_api_key: str = ""
    # Cheap/fast model for daily summaries, more capable model for the copilot
    # chat — both overridable (e.g. claude-opus-5 for maximum quality).
    anthropic_summary_model: str = "claude-haiku-4-5"
    anthropic_copilot_model: str = "claude-sonnet-5"
    copilot_max_tokens: int = 900

    quote_cache_ttl: int = 120      # seconds
    history_cache_ttl: int = 3600   # seconds

    # Tiny in-process rate limit for the copilot endpoint (requests per minute).
    copilot_rate_limit_per_min: int = 10

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

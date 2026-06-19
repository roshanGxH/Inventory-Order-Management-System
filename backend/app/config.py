import os
import json
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/inventory_db"
    )

    @property
    def cors_origins(self) -> List[str]:
        defaults = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
        raw = os.getenv("CORS_ORIGINS", "")
        if not raw:
            return defaults
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return defaults + parsed
        except Exception:
            pass
        return defaults + [x.strip() for x in raw.split(",") if x.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

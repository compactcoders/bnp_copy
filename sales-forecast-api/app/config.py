from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    frontend_origin: str = Field(default="http://localhost:5173", alias="FRONTEND_ORIGIN")
    default_data_path: str | None = Field(default=None, alias="DEFAULT_DATA_PATH")

    class Config:
        env_file = ".env"

settings = Settings()

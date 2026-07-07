from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Central place for all env-driven config. Never read os.environ
    directly elsewhere in the app - import `settings` from here instead.
    """

    supabase_url: str = ""
    supabase_service_key: str = ""
    frontend_origin: str = "http://localhost:5173"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()

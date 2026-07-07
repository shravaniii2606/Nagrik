from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_key: str = ""
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    frontend_origin: str = "http://localhost:5173"
    environment: str = "development"
    complaint_image_bucket: str = "complaint-images"
    document_upload_bucket: str = "document-uploads"
    max_upload_bytes: int = 5 * 1024 * 1024

    class Config:
        env_file = ".env"


settings = Settings()

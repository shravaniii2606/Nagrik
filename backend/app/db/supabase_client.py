from supabase import create_client, Client
from app.core.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    """
    Lazily create a single shared Supabase client.
    Uses the service key - this file must NEVER be imported into
    any frontend-facing or client-exposed code.
    """
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_service_key:
            raise RuntimeError(
                "Supabase env vars missing. Set SUPABASE_URL and "
                "SUPABASE_SERVICE_KEY in backend/.env"
            )
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client

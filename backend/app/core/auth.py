from dataclasses import dataclass
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.db.supabase_client import get_supabase


@dataclass(frozen=True)
class CurrentUser:
    id: str
    email: str | None = None


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Use a Bearer access token.",
        )
    return token.strip()


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> CurrentUser:
    token = _extract_bearer_token(authorization)
    try:
        auth_response = get_supabase().auth.get_user(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is invalid or expired.",
        ) from exc

    user = getattr(auth_response, "user", None)
    user_id = getattr(user, "id", None)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is invalid or expired.",
        )

    return CurrentUser(id=str(user_id), email=getattr(user, "email", None))

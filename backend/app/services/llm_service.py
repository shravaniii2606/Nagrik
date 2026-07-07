import json
from typing import Any

import httpx

from app.core.config import settings
from app.models.chat import ChatResponse
from app.models.complaints import ComplaintCategory
from app.services.civic_services import DOCUMENT_CHECKLISTS, SERVICE_NAMES

CHAT_INTENTS = {"document_checklist", "simple_qna", "service_recommendation"}
COMPLAINT_CATEGORIES = {"pothole", "garbage", "water", "electricity", "other"}


def _fallback_checklist(service_context: str | None) -> list[dict[str, str | None]]:
    service_name = service_context if service_context in DOCUMENT_CHECKLISTS else "Aadhaar Card"
    return [
        {"label": item, "note": "Upload a clear JPG or PNG copy when available."}
        for item in DOCUMENT_CHECKLISTS[service_name]
    ]


def _fallback_chat_response(
    message: str,
    service_context: str | None,
    language_pref: str,
) -> ChatResponse:
    lower_message = message.lower()
    if service_context or "document" in lower_message or "papers" in lower_message:
        checklist = _fallback_checklist(service_context)
        service_name = service_context or "the selected service"
        return ChatResponse(
            intent="document_checklist",
            answer=(
                f"For {service_name}, start with this document checklist. "
                f"I will keep the response simple and can continue in {language_pref}."
            ),
            checklist=checklist,
            recommended_services=[service_name] if service_context else [],
        )

    if any(word in lower_message for word in ["which", "eligible", "scheme", "need"]):
        return ChatResponse(
            intent="service_recommendation",
            answer=(
                "Based on your situation, Aadhaar Card, Ration Card, or Income Certificate "
                "are often the right starting points. Share your exact need and location "
                "for a narrower recommendation."
            ),
            recommended_services=["Aadhaar Card", "Ration Card", "Income Certificate"],
        )

    return ChatResponse(
        intent="simple_qna",
        answer=(
            "I can help explain the civic process in plain language, list documents, "
            "or recommend the right government service for your situation."
        ),
    )


def _extract_json(content: str) -> dict[str, Any]:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")
        if start == -1 or end == -1 or start >= end:
            raise
        return json.loads(content[start : end + 1])


def _normalize_chat_payload(payload: dict[str, Any]) -> ChatResponse:
    intent = payload.get("intent")
    if intent not in CHAT_INTENTS:
        intent = "simple_qna"

    checklist = payload.get("checklist") if isinstance(payload.get("checklist"), list) else []
    recommended_services = payload.get("recommended_services")
    if not isinstance(recommended_services, list):
        recommended_services = []

    return ChatResponse(
        intent=intent,
        answer=str(payload.get("answer") or "I could not generate a complete answer."),
        checklist=checklist[:8],
        recommended_services=[str(item) for item in recommended_services[:5]],
    )


def _chat_system_prompt(service_context: str | None, language_pref: str) -> str:
    service_instruction = (
        f"The citizen selected {service_context}. Proactively return a document_checklist "
        "with required documents before asking follow-up questions."
        if service_context
        else "Classify whether the citizen needs a checklist, a simple answer, or a service recommendation."
    )
    service_list = ", ".join(SERVICE_NAMES)
    return (
        "You are Smart Bharat, an AI civic companion for Indian government services. "
        "Use plain, practical language and avoid legal certainty. "
        f"Respond in {language_pref} when possible. "
        f"{service_instruction} "
        f"Known services: {service_list}. "
        "Return only JSON with keys: intent, answer, checklist, recommended_services. "
        "intent must be document_checklist, simple_qna, or service_recommendation. "
        "checklist must be an array of objects with label and note."
    )


async def generate_chat_response(
    message: str,
    service_context: str | None,
    language_pref: str,
) -> ChatResponse:
    if not settings.openrouter_api_key:
        return _fallback_chat_response(message, service_context, language_pref)

    request_payload = {
        "model": settings.openrouter_model,
        "messages": [
            {"role": "system", "content": _chat_system_prompt(service_context, language_pref)},
            {"role": "user", "content": message},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
        "max_tokens": 900,
    }

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.frontend_origin,
        "X-Title": "Smart Bharat Civic Companion",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=request_payload,
        )
        response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]
    return _normalize_chat_payload(_extract_json(content))


async def classify_complaint_category(description: str) -> ComplaintCategory:
    if not settings.openrouter_api_key:
        lower_description = description.lower()
        if any(word in lower_description for word in ["pothole", "road", "street"]):
            return "pothole"
        if any(word in lower_description for word in ["garbage", "trash", "waste"]):
            return "garbage"
        if any(word in lower_description for word in ["water", "leak", "drain"]):
            return "water"
        if any(word in lower_description for word in ["electric", "light", "power"]):
            return "electricity"
        return "other"

    request_payload = {
        "model": settings.openrouter_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Classify the civic complaint into exactly one category: "
                    "pothole, garbage, water, electricity, or other. Return only JSON "
                    'like {"category":"water"}.'
                ),
            },
            {"role": "user", "content": description},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0,
        "max_tokens": 60,
    }

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.frontend_origin,
        "X-Title": "Smart Bharat Civic Companion",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=request_payload,
        )
        response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]
    category = str(_extract_json(content).get("category", "other")).lower()
    return category if category in COMPLAINT_CATEGORIES else "other"

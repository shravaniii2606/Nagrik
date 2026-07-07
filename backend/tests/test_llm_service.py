import asyncio

from app.services import llm_service


class FakeLLMResponse:
    def raise_for_status(self):
        return None

    def json(self):
        return {
            "choices": [
                {
                    "message": {
                        "content": (
                            '{"intent":"document_checklist",'
                            '"answer":"Bring these documents before applying.",'
                            '"checklist":[{"label":"Mock document","note":"Mock note"}],'
                            '"recommended_services":["Aadhaar Card"]}'
                        )
                    }
                }
            ]
        }


def test_document_checklist_intent_returns_expected_structure(mocker):
    client = mocker.MagicMock()
    client.__aenter__ = mocker.AsyncMock(return_value=client)
    client.__aexit__ = mocker.AsyncMock(return_value=None)
    client.post = mocker.AsyncMock(return_value=FakeLLMResponse())

    mocker.patch.object(llm_service.settings, "openrouter_api_key", "test-key")
    mocker.patch("app.services.llm_service.httpx.AsyncClient", return_value=client)

    response = asyncio.run(
        llm_service.generate_chat_response(
            "Which documents do I need?",
            "Aadhaar Card",
            "English",
        )
    )

    payload = response.model_dump()
    assert set(payload) == {
        "intent",
        "answer",
        "checklist",
        "application_form_url",
        "recommended_services",
    }
    assert payload["intent"] == "document_checklist"
    assert payload["answer"] == "Bring these documents before applying."
    assert payload["application_form_url"] == "https://myaadhaar.uidai.gov.in/"
    assert payload["recommended_services"] == ["Aadhaar Card"]
    assert payload["checklist"][0] == {
        "label": "Proof of identity",
        "note": "Upload a clear JPG or PNG copy when available.",
    }
    client.post.assert_awaited_once()

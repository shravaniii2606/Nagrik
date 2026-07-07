def test_health_endpoint_returns_expected_shape(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Smart Bharat API is up",
        "environment": "development",
    }


def test_report_issue_rejects_empty_description(authenticated_client, mocker):
    create_complaint = mocker.patch("app.routes.complaints.create_complaint")

    response = authenticated_client.post(
        "/api/complaints",
        data={"description": "          "},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "description is required"
    create_complaint.assert_not_called()


def test_authenticated_complaints_route_rejects_invalid_session(client, mocker):
    supabase = mocker.MagicMock()
    supabase.auth.get_user.side_effect = Exception("invalid token")
    mocker.patch("app.core.auth.get_supabase", return_value=supabase)

    response = client.get(
        "/api/complaints",
        headers={"Authorization": "Bearer expired-token"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Session is invalid or expired."}
    supabase.auth.get_user.assert_called_once_with("expired-token")

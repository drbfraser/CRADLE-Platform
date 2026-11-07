import logging
from functools import partial

import pytest
from flask import Flask, Response, g, request
from werkzeug.test import Client

from api.authorization_check import enforce_authorization_check


def _test_response() -> Response:
    return Response(
        b"example response",
        status=request.args.get("status", default=200, type=int),
        headers={"X-Example": "preserved", "Location": "/next"},
    )


@pytest.fixture
def client():
    app = Flask(__name__)
    app.after_request(
        partial(
            enforce_authorization_check,
            is_public_endpoint=lambda current_request: (
                current_request.endpoint == "public"
            ),
        )
    )

    @app.get("/guarded", endpoint="guarded")
    def guarded() -> Response:
        g.authorization_checked = True
        return _test_response()

    app.add_url_rule(
        "/unguarded",
        endpoint="unguarded",
        view_func=_test_response,
        methods=["GET", "POST", "OPTIONS"],
    )
    app.add_url_rule("/public", endpoint="public", view_func=_test_response)
    for endpoint, method in (
        ("api.forms.submit_form", "POST"),
        ("api.forms.get_form", "GET"),
        ("api.forms.update_form", "PUT"),
        ("api.forms_v2.get_form", "GET"),
        ("api.form_classifications.get_form_classification_summary", "GET"),
        ("api.form_classifications_v2.get_form_classification_summary", "GET"),
    ):
        app.add_url_rule(
            f"/{endpoint}",
            endpoint=endpoint,
            view_func=_test_response,
            methods=[method],
        )
    return Client(app, Response)


@pytest.mark.parametrize(
    "endpoint, method, status_code, blocked",
    [
        ("guarded", "GET", 200, False),
        ("unguarded", "GET", 200, True),
        ("unguarded", "POST", 201, True),
        ("unguarded", "GET", 204, True),
        ("unguarded", "GET", 302, True),
        ("public", "GET", 200, False),
        ("unguarded", "OPTIONS", 200, False),
        ("unguarded", "GET", 400, False),
        ("unguarded", "GET", 500, False),
        ("api.forms.submit_form", "POST", 201, False),
        ("api.forms.get_form", "GET", 200, False),
        ("api.forms.update_form", "PUT", 201, False),
        ("api.forms_v2.get_form", "GET", 200, True),
        ("api.form_classifications.get_form_classification_summary", "GET", 200, False),
        (
            "api.form_classifications_v2.get_form_classification_summary",
            "GET",
            200,
            True,
        ),
    ],
)
def test_blocks_unchecked_private_responses(
    client, caplog, endpoint, method, status_code, blocked
):
    with caplog.at_level(logging.WARNING, logger="api.authorization_check"):
        response = client.open(f"/{endpoint}?status={status_code}", method=method)

    expected_records = []
    if blocked:
        assert response.status_code == 500
        assert response.get_json() == {
            "code": 500,
            "name": "Internal Server Error",
            "description": "Internal Server Error",
        }
        assert "X-Example" not in response.headers
        assert "Location" not in response.headers
        expected_records = [
            (
                "api.authorization_check",
                logging.WARNING,
                f"Authorization check missing: endpoint={endpoint} "
                f"method={method} status={status_code}",
            )
        ]
    else:
        assert response.status_code == status_code
        assert response.data == (b"" if status_code == 204 else b"example response")
        assert response.headers["X-Example"] == "preserved"
        assert response.headers["Location"] == "/next"
    assert caplog.record_tuples == expected_records

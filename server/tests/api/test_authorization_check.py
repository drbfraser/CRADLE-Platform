import logging
from functools import partial

import pytest
from flask import Flask, Response, g, request
from werkzeug.test import Client

from api.authorization_check import log_missing_authorization


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
            log_missing_authorization,
            is_public_endpoint=lambda current_request: current_request.endpoint
            == "public",
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
    return Client(app, Response)


@pytest.mark.parametrize(
    "endpoint, method, status_code, reported",
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
    ],
)
def test_reports_only_unchecked_private_responses(
    client, caplog, endpoint, method, status_code, reported
):
    with caplog.at_level(logging.WARNING, logger="api.authorization_check"):
        response = client.open(f"/{endpoint}?status={status_code}", method=method)

    assert response.status_code == status_code
    assert response.data == (b"" if status_code == 204 else b"example response")
    assert response.headers["X-Example"] == "preserved"
    assert response.headers["Location"] == "/next"
    expected_records = []
    if reported:
        expected_records = [
            (
                "api.authorization_check",
                logging.WARNING,
                f"Authorization check missing: endpoint={endpoint} "
                f"method={method} status={status_code}",
            )
        ]
    assert caplog.record_tuples == expected_records

import logging
from typing import Callable

from flask import Request, Response, g, jsonify, request

logger = logging.getLogger(__name__)

LEGACY_FORM_AUTHORIZATION_EXEMPTIONS = frozenset(
    {
        "api.form_classifications.create_form_classification",
        "api.form_classifications.edit_form_classification_name",
        "api.form_classifications.get_all_form_classifications",
        "api.form_classifications.get_form_classification",
        "api.form_classifications.get_form_classification_summary",
        "api.form_classifications.get_form_classification_templates",
        "api.forms.get_form",
        "api.forms.submit_form",
        "api.forms.update_form",
    }
)


def enforce_authorization_check(
    response: Response,
    *,
    is_public_endpoint: Callable[[Request], bool],
) -> Response:
    if (
        request.method == "OPTIONS"
        or response.status_code >= 400
        or is_public_endpoint(request)
        or request.endpoint in LEGACY_FORM_AUTHORIZATION_EXEMPTIONS
        or getattr(g, "authorization_checked", False)
    ):
        return response

    logger.warning(
        "Authorization check missing: endpoint=%s method=%s status=%s",
        request.endpoint,
        request.method,
        response.status_code,
    )
    response.close()
    error_response = jsonify(
        code=500, name="Internal Server Error", description="Internal Server Error"
    )
    error_response.status_code = 500
    return error_response

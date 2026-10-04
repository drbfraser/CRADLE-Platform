import logging
from typing import Callable

from flask import Request, Response, g, request

logger = logging.getLogger(__name__)


def log_missing_authorization(
    response: Response,
    *,
    is_public_endpoint: Callable[[Request], bool],
) -> Response:
    if (
        request.method == "OPTIONS"
        or response.status_code >= 400
        or is_public_endpoint(request)
        or getattr(g, "authorization_checked", False)
    ):
        return response

    logger.warning(
        "Authorization check missing: endpoint=%s method=%s status=%s",
        request.endpoint,
        request.method,
        response.status_code,
    )
    return response

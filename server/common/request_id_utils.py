import logging
import uuid
import flask


def generate_request_id(original_id=""):
    new_id = uuid.uuid4()
    if original_id:
        new_id = f"{original_id},{new_id}"
    return new_id


def request_id():
    if getattr(flask.g, "request_id", None):
        return flask.g.request_id
    headers = flask.request.headers
    original_request_id = headers.get("X-Request-Id")
    new_uuid = generate_request_id(original_request_id)
    flask.g.request_id = new_uuid
    return new_uuid


class RequestIdFilter(logging.Filter):
    # This is a logging filter that makes the request ID available for use in
    # the logging format. Note that we're checking if we're in a request
    # context, as we may want to log things before Flask is fully loaded.
    def filter(self, record):
        record.request_id = request_id() if flask.has_request_context() else ""
        return True
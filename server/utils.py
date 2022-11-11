import json
import time
import uuid
import logging
import flask


def pprint(to_print):
    print(json.dumps(to_print, sort_keys=True, indent=2))


# returns formatted current time in utc timezone
def get_current_time():
    return int(time.time())


def get_uuid():
    return str(uuid.uuid4())

def generate_request_id(original_id=''):
    new_id = uuid.uuid4()

    if original_id:
        new_id = "{},{}".format(original_id, new_id)

    return new_id

def request_id():
    if getattr(flask.g, 'request_id', None):
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
        record.request_id = request_id() if flask.has_request_context() else ''
        return True



# use this to replace json.dumps if you want the different
# language words in json string still to be visible in
# database rather than unicode format
def dumps(obj):
    return json.dumps(obj, ensure_ascii=False)

import json
from flask import request

def _get_request_body():
    raw_req_body = request.get_json(force=True)
    print('Request body: ' + json.dumps(raw_req_body, indent=2, sort_keys=True))
    return raw_req_body

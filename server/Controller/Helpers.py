import json


def _get_request_body(requests):
    raw_req_body = requests.get_json(force=True)
    print('Request body: ' + json.dumps(raw_req_body, indent=2, sort_keys=True))
    return raw_req_body

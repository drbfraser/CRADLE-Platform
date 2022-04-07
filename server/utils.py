import json
import time
import uuid


def pprint(to_print):
    print(json.dumps(to_print, sort_keys=True, indent=2))


# returns formatted current time in utc timezone
def get_current_time():
    return int(time.time())


def get_uuid():
    return str(uuid.uuid4())


def dumps(obj):
    # compatible with different languages
    return json.dumps(obj, ensure_ascii=False)

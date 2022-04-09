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

# use this to replace json.dumps if you want the different
# language words in json string still to be visible rather
# than unicode format
def dumps(obj):
    return json.dumps(obj, ensure_ascii=False)

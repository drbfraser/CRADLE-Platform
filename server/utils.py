import json
import datetime

def pprint(to_print):
    print(json.dumps(to_print, sort_keys=True, indent=2))

# returns formatted current time in utc timezone
def get_current_time():
    return str(datetime.datetime.utcnow())
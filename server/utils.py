import json

def pprint(to_print):
    print(json.dumps(to_print, sort_keys=True, indent=2))
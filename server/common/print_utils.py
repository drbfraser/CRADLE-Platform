import json


def pretty_print(obj):
    if isinstance(obj, str):
        print(obj)
    else:
        formatted_string = json.dumps(obj, indent=4, sort_keys=False)
        print(formatted_string)

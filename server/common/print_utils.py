import json


def pretty_print(obj):
    """Print a string directly or a non-string object as formatted JSON."""
    if isinstance(obj, str):
        print(obj)
    else:
        formatted_string = json.dumps(obj, indent=4, sort_keys=False)
        print(formatted_string)

from typing import Any, List, Optional


def required_keys_present(
    request_body: dict, required_keys: List[str]
) -> Optional[str]:
    """
    Returns an error message if the required keys are not
    present. Else, returns None.

    :param request_body: The request body as a dict object
    :param required_keys: The list of required key names
    :return: An error message if required keys are not present. None otherwise. 
    """
    for key in required_keys:
        if key not in request_body:
            return "The request body key {" + key + "} is required."
        if request_body.get(key) == "" or request_body.get(key) is None:
            return "The request body value for the key {" + key + "} is required."
    return None


def values_correct_type(
    request_body: dict, key_names: List[str], type
) -> Optional[str]:
    """
    Returns an error message if the values of some keys are not
    the correct specified type. Else, returns None.

    :param request_body: The request body as a dict object
    :param key_names: The list of keys to have their values checked.
    :param type: The type that the values need to be.
    :return: An error message if the values are not the correct type. None otherwise. 
    """
    for key in key_names:
        if key in request_body and request_body.get(key) is not None:
            if type == int:
                if not is_int(request_body.get(key)):
                    return "The value for key {" + key + "} is not the correct type."
            else:
                if not isinstance((request_body.get(key)), type):
                    return "The value for key {" + key + "} is not the correct type."
    return None


def is_int(s: Any) -> bool:
    """
    Checks if a value is an integer.

    :param s: The value to check 
    :return: Returns True if the passed in value is an integer, False otherwise
    """
    try:
        int(s)
        return True
    except ValueError:
        return False

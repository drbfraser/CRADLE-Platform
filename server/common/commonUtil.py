def filterNestedAttributeWithValueNone(payload: dict) -> dict:
    """
    Returns dict with all the nested key-value pairs wherein the value is not None

    :param payload: The dictionary to evaluate
    """
    updated_data = {}
    for k in payload:
        v = payload[k]
        if type(v) is list:
            updated_list = []
            for item in v:
                if isinstance(item, dict):
                    updated_list_item = filterNestedAttributeWithValueNone(item)
                    if len(updated_list_item) != 0:
                        updated_list.append(updated_list_item)
                elif item is not None:
                    updated_list.append(item)

            updated_data[k] = updated_list
        elif v is not None:
            updated_data[k] = v

    return updated_data

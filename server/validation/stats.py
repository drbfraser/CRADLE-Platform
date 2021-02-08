## Stats post requests validation 
from typing import Optional
from validation.validate import required_keys_present, values_correct_type

def validate_timestamp(request_body: dict) -> Optional[str]:
    """Returns error message if timestamp body is invalid, 
    otherwise returns None
    
    :param request_body: 
        {
            "from": "1546702448" -- required
            "to": "1547212259" -- required 
        }
    
    """
    error_message = None
    required_keys = ["from", "to"]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    list_of_values = [request_body.get("from"), request_body.get("to")]

    for value in list_of_values:
        error_message = values_correct_type(request_body,value, str)
        if error_message is not None:
            return error_message

    return error_message



def validate_time_frame_readings(request_body: dict) -> Optional[str]:
    """
    Returns error message if the api/stats-timeframed-readings post request 
    is not valid, otherwise returns None.

    :param request_body: Request as a dict object
        {
            "timeframe:{                -required
                "from": "1546702448"
                "to": "1547212259" 
            }
        }
    """

    error_message = None
    # Check for required keys
    required_keys = ["timeframe"]    
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that the json is valid
    error_message = validate_timestamp(request_body.get('timeframe'))
    if error_message is not None:
        return error_message


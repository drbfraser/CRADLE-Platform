import pytest

from common import commonUtil

valid_no_none_dict = {"k": "v"}
valid_with_none_dict = {"k": "v", "k2": None}
valid_nested_no_none_dict = {"k": "v", "list": [valid_no_none_dict]}
valid_nested_none_dict = {"k": "v", "list": [valid_no_none_dict, {"k": None}]}
valid_nested_partial_none_dict = {"k": "v", "list": [{"k": "v", "k2": None}]}
valid_nested_list_with_int_dict = {"k": "v", "list": [1, 2, 3]}
valid_nested_list_with_int_none_dict = {"k": "v", "list": [1, 2, 3, None]}


@pytest.mark.parametrize(
    "json, expected",
    [
        (valid_no_none_dict, valid_no_none_dict),
        (valid_with_none_dict, valid_no_none_dict),
        (valid_nested_no_none_dict, valid_nested_no_none_dict),
        (valid_nested_none_dict, valid_nested_no_none_dict),
        (valid_nested_partial_none_dict, valid_nested_no_none_dict),
        (valid_nested_list_with_int_dict, valid_nested_list_with_int_dict),
        (valid_nested_list_with_int_none_dict, valid_nested_list_with_int_dict),
    ],
)
def test_encryptor_wrong_key(json, expected):
    assert expected == commonUtil.filterNestedAttributeWithValueNone(json)

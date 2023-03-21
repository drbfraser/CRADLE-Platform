from enum import Enum

import pytest
from validation.validate import (
    check_invalid_keys_present,
    required_keys_present,
    force_consistent_keys,
    values_correct_type,
    is_int,
)

empty_dict_empty_keys_pair = ({}, [])
empty_dict_extra_key_pair = ({}, ["test"])
extra_dict_empty_keys_pair = ({"test": "123"}, [])
same_dict_key_pair = ({"test1": "123"}, ["test1"])
some_dict_extra_key_pair = ({"test1": "123"}, ["test1", "test2"])
extra_dict_some_keys_pair = ({"test1": "123", "test2": 345}, ["test1"])


@pytest.mark.parametrize(
    "json, keys, output",
    [
        (*empty_dict_empty_keys_pair, type(None)),
        (*empty_dict_extra_key_pair, type(None)),
        (*extra_dict_empty_keys_pair, str),
        (*same_dict_key_pair, type(None)),
        (*some_dict_extra_key_pair, type(None)),
        (*extra_dict_some_keys_pair, str),
    ],
)
def test_check_invalid_keys_present(json, keys, output):
    message = check_invalid_keys_present(json, keys)
    assert type(message) == output


@pytest.mark.parametrize(
    "json, keys, output",
    [
        (*empty_dict_empty_keys_pair, type(None)),
        (*empty_dict_extra_key_pair, str),
        (*extra_dict_empty_keys_pair, type(None)),
        (*same_dict_key_pair, type(None)),
        (*some_dict_extra_key_pair, str),
        (*extra_dict_some_keys_pair, type(None)),
    ],
)
def test_required_keys_present(json, keys, output):
    message = required_keys_present(json, keys)
    assert type(message) == output


@pytest.mark.parametrize(
    "json, keys, output",
    [
        (*empty_dict_empty_keys_pair, type(None)),
        (*empty_dict_extra_key_pair, str),
        (*extra_dict_empty_keys_pair, str),
        (*same_dict_key_pair, type(None)),
        (*some_dict_extra_key_pair, str),
        (*extra_dict_some_keys_pair, str),
    ],
)
def test_force_consistent_keys(json, keys, output):
    message = force_consistent_keys(json, keys)
    assert type(message) == output


type_empty = ({}, [], type(None))


class TestEnum(Enum):
    TEST1 = "TEST1_VALUE"
    TEST2 = "TEST2_VALUE"
    TEST3 = 123


class OtherTestEnum(Enum):
    OTHER_TEST1 = "OTHER_TEST1_VALUE"


sample_dict = {
    "test_int": 123,
    "test_str": "test",
    "test_str2": "test2",
    "test_none": None,
    "test_float": 123.321,
    "test_enum": TestEnum.TEST1.value,
}
type_single_correct = (sample_dict, ["test_str"], str)
type_single_incorrect = (sample_dict, ["test_int"], str)
type_multiple_correct = (sample_dict, ["test_str", "test_str2"], str)
type_one_correct_one_incorrect = (
    sample_dict,
    ["test_int", "test_str", "test_str2"],
    int,
)
type_enum_correct = (sample_dict, ["test_enum"], TestEnum)
type_enum_incorrect = (sample_dict, ["test_enum"], OtherTestEnum)


@pytest.mark.parametrize(
    "json, keys, _type, output",
    [
        (*type_empty, type(None)),
        (*type_single_correct, type(None)),
        (*type_single_incorrect, str),
        (*type_multiple_correct, type(None)),
        (*type_one_correct_one_incorrect, str),
        (*type_enum_correct, type(None)),
        (*type_enum_incorrect, str),
    ],
)
def test_values_correct_type(json, keys, _type, output):
    message = values_correct_type(json, keys, _type)
    assert type(message) == output


@pytest.mark.parametrize(
    "value, expected_boolean_output",
    [
        (1, True),
        (0, True),
        (0.0, True),
        ("0", True),
        ("abc", False),
        ("0a", False),
    ],
)
def is_int(value, expected_boolean_output):
    return_value = is_int(value)
    assert return_value == expected_boolean_output

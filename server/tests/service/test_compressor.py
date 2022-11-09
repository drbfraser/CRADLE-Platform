import pytest

import service.compressor as compressor


@pytest.mark.parametrize("message", [("test")])
def test_compressor(message):
    message_bytes = bytes(message, "utf-8")

    data = compressor.compress(message_bytes)
    assert type(data) == bytes

    result = compressor.decompress(data)
    assert type(result) == bytes
    assert result == message_bytes

    result_string = message.decode("utf-8")
    assert result_string == message


@pytest.mark.parametrize("message", [("test")])
def test_compressor_string(message):
    data = compressor.compress_from_string(message)
    assert type(data) == bytes

    result_string = compressor.decompress_to_string(data)
    assert type(result_string) == str
    assert result_string == string

import pytest

from service import compressor


@pytest.mark.parametrize("message", [("test")])
def test_compressor(message):
    message_bytes = bytes(message, "utf-8")

    data = compressor.compress(message_bytes)
    assert isinstance(data, bytes)

    result = compressor.decompress(data)
    assert isinstance(result, bytes)
    assert result == message_bytes

    result_string = result.decode("utf-8")
    assert result_string == message


@pytest.mark.parametrize("message", [("test")])
def test_compressor_string(message):
    data = compressor.compress_from_string(message)
    assert isinstance(data, bytes)

    result_string = compressor.decompress_to_string(data)
    assert isinstance(result_string, str)
    assert result_string == message

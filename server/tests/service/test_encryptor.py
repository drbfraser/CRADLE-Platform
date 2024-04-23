import pytest
import service.encryptor as encryptor
import service.compressor as compressor


@pytest.mark.parametrize("message", ["test1", "test2", "test3"])
def test_encryptor(message):
    key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"
    iv = "0791C97495596B09202D443D81054C77"

    plain_text = message.encode("utf-8")

    encrypted_data = encryptor.encrypt(plain_text, iv, key)
    assert plain_text != encrypted_data

    decrypted_data = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data == plain_text


@pytest.mark.parametrize(
    "invalid_key",
    [
        "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1b",
        "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a10",
        "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a11",
    ],
)
def test_encryptor_wrong_key(invalid_key):
    key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"
    iv = "0791C97495596B09202D443D81054C77"

    message = "test"
    plain_text = message.encode("utf-8")
    encrypted_data = encryptor.encrypt(plain_text, iv, key)

    decrypted_data = encryptor.decrypt(encrypted_data, key)
    decrypted_data2 = encryptor.decrypt(encrypted_data, invalid_key)

    assert decrypted_data != decrypted_data2
    assert decrypted_data == plain_text


@pytest.mark.parametrize("invalid_key_type", [1, 3.14, True])
def test_encryptor_wrong_parameter_type(invalid_key_type):
    key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"
    iv = "0791C97495596B09202D443D81054C77"

    message = "test"
    plain_text = message.encode("utf-8")
    encrypted_data = encryptor.encrypt(plain_text, iv, key)

    with pytest.raises(TypeError):
        assert encryptor.decrypt(encrypted_data, invalid_key_type)

    decrypted_data2 = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data2 == plain_text


@pytest.mark.parametrize("message", ["test1", "test2", "test3"])
def test_encryptor_compressor(message):
    key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"
    iv = "0791C97495596B09202D443D81054C77"

    compressed_data = compressor.compress_from_string(message)
    encrypted_data = encryptor.encrypt(compressed_data, iv, key)
    assert compressed_data != encrypted_data

    decrypted_data = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data == compressed_data

    result_message = compressor.decompress_to_string(decrypted_data)
    assert message == result_message

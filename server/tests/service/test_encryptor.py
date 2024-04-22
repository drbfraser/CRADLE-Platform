import pytest

import service.encryptor as encryptor

import service.compressor as compressor

# TODO: fix these tests
@pytest.mark.parametrize("message", [("test")])
def test_encryptor(message):
    key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"
    plain_text = b"Hello, world!"
    iv = "0791C97495596B09202D443D81054C77"

    encrypted_data = encryptor.encrypt(plain_text, iv, key)
    assert message != encrypted_data

    decrypted_data = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data == plain_text


@pytest.mark.parametrize("message", [("test")])
def test_encryptor_wrong_key(message):
    key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"
    iv = "0791C97495596B09202D443D81054C77"
    message_bytes = bytes(message, "utf-8")
    encrypted_data = encryptor.encrypt(message_bytes, iv, key)
    invalid_key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1b"

    decrypted_data = encryptor.decrypt(encrypted_data, key)
    decrypted_data2 = encryptor.decrypt(encrypted_data, invalid_key)

    assert decrypted_data != decrypted_data2
    assert decrypted_data == message_bytes


@pytest.mark.parametrize("message", [("test")])
def test_encryptor_wrong_parameter_type(message):
    key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"
    iv = "0791C97495596B09202D443D81054C77"
    message_bytes = bytes(message, "utf-8")
    encrypted_data = encryptor.encrypt(message_bytes, iv, key)
    invalid_key_type = 5

    with pytest.raises(TypeError):
        assert encryptor.decrypt(encrypted_data, invalid_key_type)

    decrypted_data2 = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data2 == message_bytes


@pytest.mark.parametrize("message", [("test")])
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

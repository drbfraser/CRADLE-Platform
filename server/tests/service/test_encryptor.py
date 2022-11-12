import pytest

import service.encryptor as encryptor
import service.compressor as compressor
import cryptography.fernet as fernet


@pytest.mark.parametrize("message", [("test")])
def test_encryptor(message):
    key = encryptor.generate_key()

    message_bytes = bytes(message, "utf-8")

    encrypted_data = encryptor.encrypt(message_bytes, key)
    assert message_bytes != encrypted_data

    decrypted_data = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data == message_bytes
    assert decrypted_data.decode("utf-8") == message


@pytest.mark.parametrize("message", [("test")])
def test_encryptor_wrong_key(message):
    key = encryptor.generate_key()

    message_bytes = bytes(message, "utf-8")
    encrypted_data = encryptor.encrypt(message_bytes, key)
    second_key = encryptor.generate_key()

    # The very low chance that the 2 generated keys are the same
    while second_key == key:
        second_key = encryptor.generate_key()

    with pytest.raises(fernet.InvalidToken):
        decrypted_data = encryptor.decrypt(encrypted_data, second_key)
        assert decrypted_data != message_bytes
    
    decrypted_data2 = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data2 == message_bytes


@pytest.mark.parametrize("message", [("test")])
def test_encryptor_compressor(message):
    key = encryptor.generate_key()

    compressed_data = compressor.compress_from_string(message)
    encrypted_data = encryptor.encrypt(compressed_data, key)
    assert compressed_data != encrypted_data

    decrypted_data = encryptor.decrypt(encrypted_data, key)
    assert decrypted_data == compressed_data

    result_message = compressor.decompress_to_string(decrypted_data)
    assert message == result_message

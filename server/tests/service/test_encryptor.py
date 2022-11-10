import pytest

import service.encryptor as encryptor
import service.compressor as compressor


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

    try:
        decrypted_data = encryptor.decrypt(encrypted_data, second_key)
        assert decrypted_data != message_bytes
    except cryptography.fernet.InvalidToken:
        decrypted_data2 = encryptor.decrypt(encrypted_data, key)
        assert decrypted_data2 == message_bytes
    except Exception as err:
        assert false

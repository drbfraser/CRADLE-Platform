import pytest

from service.encryptor import AES_pkcs5
import service.encryptor as encryptor
import cryptography.fernet as fernet
import api.util as util


@pytest.mark.parametrize("message", [("test")])
def test_encryptor(message):
    # key = encryptor.generate_key("test@test.com")
    key = util.generate_new_key()
    # message_bytes = bytes(message, "utf-8")
    print(message)
    AES_pkcs5_obj = AES_pkcs5(key)
    iv = "0791C97495596B09202D443D81054C77"

    encrypted_data = AES_pkcs5_obj.encrypt(message, iv)
    assert message != encrypted_data

    decrypted_data = AES_pkcs5_obj.decrypt(encrypted_data, iv)
    assert decrypted_data == message
    # assert decrypted_data.decode("utf-8") == message


#
# @pytest.mark.parametrize("message", [("test")])
# def test_encryptor_wrong_key(message):
#     key = encryptor.generate_key("test@test.com")
#
#     message_bytes = bytes(message, "utf-8")
#     encrypted_data = encryptor.encrypt(message_bytes, key)
#     second_key = encryptor.generate_key("test2@test.com")
#
#     with pytest.raises(ValueError):
#         assert encryptor.decrypt(encrypted_data, second_key)
#
#     decrypted_data2 = encryptor.decrypt(encrypted_data, key)
#     assert decrypted_data2 == message_bytes
#
#
# @pytest.mark.parametrize("message", [("test")])
# def test_encryptor_compressor(message):
#     key = encryptor.generate_key("test@test.com")
#
#     compressed_data = compressor.compress_from_string(message)
#     encrypted_data = encryptor.encrypt(compressed_data, key)
#     assert compressed_data != encrypted_data
#
#     decrypted_data = encryptor.decrypt(encrypted_data, key)
#     assert decrypted_data == compressed_data
#
#     result_message = compressor.decompress_to_string(decrypted_data)
#     assert message == result_message

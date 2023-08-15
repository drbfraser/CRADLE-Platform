import hashlib
import os

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from Crypto.Cipher import AES

keySize = 32
ivSize = 16


# generate random IV(initalized vector)
def generateRandomIV():
    return os.urandom(ivSize)


# generate fixed Key(user key)
def generate_key(email):
    hashed_key = hashlib.sha256(email.encode("utf-8")).hexdigest()
    user_key = hashed_key[:keySize]
    return user_key


def encrypt(token, key):
    iv = generateRandomIV()
    key = key.encode("utf-8")
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(token) + padder.finalize()

    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    combined = iv + encrypted_data

    return combined


def decrypt(combined, key):
    iv = combined[:ivSize]
    cipher_text = combined[ivSize:]
    key = key.encode("utf-8")

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    try:
        decrypted_data = decryptor.update(cipher_text) + decryptor.finalize()

        unpadder = padding.PKCS7(128).unpadder()
        unpadded_data = unpadder.update(decrypted_data) + unpadder.finalize()
        return unpadded_data
    except:
        raise ValueError("Invalid Key")


class AES_pkcs5:
    def __init__(
        self, key: str, mode: AES.MODE_CBC = AES.MODE_CBC, block_size: int = 16
    ):
        self.key = self.hex2bytes(key)
        self.mode = mode
        self.block_size = block_size

    def hex2bytes(self, key):
        return bytes.fromhex(key)

    def bytes2hex(self, key):
        return key.hex()

    def pad(self, byte_array: bytearray):
        """
        pkcs5 padding
        """
        pad_len = self.block_size - len(byte_array) % self.block_size
        return byte_array + (bytes([pad_len]) * pad_len)

    # pkcs5 - unpadding
    def unpad(self, byte_array: bytearray):
        return byte_array[: -ord(byte_array[-1:])]

    def setKey(self, key: str):
        # convert to bytes
        key = key.encode("utf-8")
        # get the sha1 method - for hashing
        sha1 = hashlib.sha1
        # and use digest and take the last 16 bytes
        key = sha1(key).digest()[:16]
        # now zero pad - just incase
        key = key.zfill(16)
        return key

    def encrypt(self, message: str, iv) -> str:
        message = message.encode("utf-8")
        # pad the message - with pkcs5 style
        padded = self.pad(message)
        iv = self.hex2bytes(iv)

        # new instance of AES with encoded key
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        # now encrypt the padded bytes
        encrypted = cipher.encrypt(padded)
        # base64 encode and convert back to string
        return self.bytes2hex(encrypted)

    def decrypt(self, message: str, iv) -> str:
        # convert the message to bytes
        message = self.hex2bytes(message)

        iv = self.hex2bytes(iv)
        # AES instance with the - setKey()
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        # decrypt and decode
        # decrypted = cipher.decrypt(message).decode('utf-8')
        decrypted = cipher.decrypt(message)
        decrypted = self.unpad(decrypted)
        # print(decrypted.decode('utf-8'))
        # decrypted = self.bytes2hex(decrypted)
        # unpad - with pkcs5 style and return
        return decrypted

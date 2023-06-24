import hashlib
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

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

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import bcrypt
import os

ivSize = 16

# generate random IV(initalized vector)
def generateRandomIV():
    return os.urandom(ivSize)


def generate_key(email):
    email_bytes = email.encode("utf-8")
    hashed_key = bcrypt.hashpw(email_bytes, bcrypt.gensalt())
    return hashed_key


def encrypt(token, key):
    iv = generateRandomIV()
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(token.encode()) + padder.finalize()

    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    combined = iv + encrypted_data

    return combined


def decrypt(combined, key):
    iv = combined[:ivSize]
    cipher_text = combined[ivSize:]

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()

    decrypted_data = decryptor.update(cipher_text) + decryptor.finalize()

    unpadder = padding.PKCS7(128).unpadder()
    unpadded_data = unpadder.update(decrypted_data) + unpadder.finalize()

    return unpadded_data.decode()

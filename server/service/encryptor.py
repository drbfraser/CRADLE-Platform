import hashlib
import os

from Crypto.Cipher import AES

block_size = 16
iv_size = 32
mode = AES.MODE_CBC


# TODO: test
# plaintext should be a bytes
def encrypt(plaintext: bytes, iv: str, key: str) -> str:
    key = hex2bytes(key)

    # pad the message - with pkcs5 style
    padded = pad(plaintext)
    iv_bytes = hex2bytes(iv)
    # new instance of AES with encoded key
    cipher = AES.new(key, AES.MODE_CBC, iv_bytes)
    # now encrypt the padded bytes
    encrypted = cipher.encrypt(padded)
    ciphertext = bytes2hex(encrypted)
    # concatinate iv to ciphertext
    message = iv + ciphertext
    return message


# chiphertext should be a hexString
def decrypt(chiphertext: str, key: str) -> str:
    iv = chiphertext[0:iv_size]
    message = chiphertext[iv_size:]
    key = hex2bytes(key)

    # convert message and iv to bytes
    message = hex2bytes(message)
    iv = hex2bytes(iv)

    # decrypt and decode
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(message)
    decrypted = unpad(decrypted)
    return decrypted


################ Helper functions ################


def hex2bytes(key: str):
    return bytes.fromhex(key)


def bytes2hex(key: bytes):
    return key.hex()


def pad(byte_array: bytearray):
    """
    pkcs5 padding
    """
    pad_len = block_size - len(byte_array) % block_size
    return byte_array + (bytes([pad_len]) * pad_len)


# pkcs5 - unpadding
def unpad(byte_array: bytearray):
    return byte_array[: -ord(byte_array[-1:])]

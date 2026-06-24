from Crypto.Cipher import AES

block_size = 16
iv_size = 32
mode = AES.MODE_CBC


# TODO: test
def encrypt(plaintext: bytes, iv: str, key: str) -> str:
    """Encrypt plaintext bytes with AES-CBC using the given hex IV and key, returning hex IV + ciphertext."""
    key = hex2bytes(key)
    padded = pad(plaintext)
    iv_bytes = hex2bytes(iv)
    cipher = AES.new(key, AES.MODE_CBC, iv_bytes)
    encrypted = cipher.encrypt(padded)
    ciphertext = bytes2hex(encrypted)
    message = iv + ciphertext
    return message


def decrypt(chiphertext: str, key: str) -> str:
    """Decrypt a hex-encoded AES-CBC ciphertext (IV prepended) using the given hex key."""
    iv = chiphertext[0:iv_size]
    message = chiphertext[iv_size:]
    key = hex2bytes(key)
    message = hex2bytes(message)
    iv = hex2bytes(iv)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(message)
    decrypted = unpad(decrypted)
    return decrypted


################ Helper functions ################


def hex2bytes(key: str):
    """Convert a hex string to bytes."""
    return bytes.fromhex(key)


def bytes2hex(key: bytes):
    """Convert bytes to a hex string."""
    return key.hex()


def pad(byte_array: bytearray):
    """Apply PKCS5 padding to the byte array."""
    pad_len = block_size - len(byte_array) % block_size
    return byte_array + (bytes([pad_len]) * pad_len)


def unpad(byte_array: bytearray):
    """Remove PKCS5 padding from a byte array."""
    return byte_array[: -ord(byte_array[-1:])]

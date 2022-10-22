from cryptography.fernet import Fernet

# Encryptor
# - Fernet uses AES in CBC mode with 128-bit key
def generate_key():
    return Fernet.generate_key()

def encrypt(token, key):
    f = Fernet(key)
    return f.encrypt(token)

def decrypt(token, key):
    f = Fernet(key)
    return f.decrypt(token)
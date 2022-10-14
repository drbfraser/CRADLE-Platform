from cryptography.fernet import Fernet

# Encryptor
# - Fernet uses AES in CBC mode with 128-bit key
class Encryptor:
    def generate_key(self):
        return Fernet.generate_key()

    def encrypt(self, token, key):
        f = Fernet(key)
        return f.encrypt(token)

    def decrypt(self, token, key):
        f = Fernet(key)
        return f.decrypt(token)
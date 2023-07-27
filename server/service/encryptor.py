import datetime
import hashlib
import os
import secrets

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

from data import crud, marshal
from models import User, SmsSecretKey

from api.util import bytes2hex, hex2bytes, in_the_future

keySize = 32
ivSize = 16

SMS_KEY_DURATION = int(os.environ.get("SMS_KEY_DURATION")) or 40

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


def create_secret_key_for_user(userId):
    stale_date = in_the_future(day_after=SMS_KEY_DURATION - 10)
    expiry_date = in_the_future(day_after=SMS_KEY_DURATION)
    secret_Key = generate_new_key()
    new_key = {
        "userId": userId,
        "secret_Key": str(secret_Key),
        "expiry_date": str(expiry_date),
        "stale_date": str(stale_date),
    }
    sms_new_key_model = marshal.unmarshal(SmsSecretKey, new_key)
    crud.create(sms_new_key_model)
    return new_key


def update_secret_key_for_user(userId):
    stale_date = in_the_future(day_after=SMS_KEY_DURATION - 10)
    expiry_date = in_the_future(day_after=SMS_KEY_DURATION)
    secret_Key = generate_new_key()
    new_key = {
        "secret_Key": str(secret_Key),
        "expiry_date": str(expiry_date),
        "stale_date": str(stale_date),
    }
    crud.update(SmsSecretKey, new_key, userId=userId)
    return new_key


def find_secret_key_by_user(userId):
    sms_secret_key = crud.read(SmsSecretKey, userId=userId)
    if sms_secret_key:
        if sms_secret_key.secret_Key:
            sms_key = marshal.marshal(sms_secret_key, SmsSecretKey)
            return sms_key
        else:
            return None
    else:
        return None


def generate_new_key():
    return bytes2hex(secrets.randbits(256).to_bytes(32, "little"))



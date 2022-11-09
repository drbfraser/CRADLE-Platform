import gzip

# Compressor
# - Uses gzip to compress/decompress

# Compresses bytes to bytes
def compress(data):
    return gzip.compress(data)


# Decompreses bytes to bytes
def decompress(data):
    return gzip.decompress(data)


# Compresses strings to bytes
def compress_from_string(string):
    return gzip.compress(bytes(string, "utf-8"))


# Decompreses bytes to strings
def decompress_to_string(data):
    return gzip.decompress(data).decode("utf-8")

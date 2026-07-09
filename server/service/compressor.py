import gzip


def compress(data):
    """Compress bytes using gzip."""
    return gzip.compress(data)


def decompress(data):
    """Decompress gzip-compressed bytes."""
    return gzip.decompress(data)


def compress_from_string(string):
    """Compress a UTF-8 string to gzip bytes."""
    return gzip.compress(bytes(string, "utf-8"))


def decompress_to_string(data):
    """Decompress gzip bytes to a UTF-8 string."""
    return gzip.decompress(data).decode("utf-8")

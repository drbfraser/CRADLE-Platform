import gzip

def open(filename, mode):
    gzip.open(filename, mode)

def compress(data):
    return gzip.compress(data)

def decompress(data):
    return gzip.decompress(data)
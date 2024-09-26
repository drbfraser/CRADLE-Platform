# file gunicorn.conf.py
# Reference: https://github.com/benoitc/gunicorn/blob/master/examples/example_config.py
import multiprocessing
import os

host = "0.0.0.0"
port = os.environ.get("PORT")

if port is None:
    port = 5000
    print(f"PORT environment variable not found. Using default ({port}).")
else:
    print("PORT environment variable found:", port)

bind = host + ":" + port
print("Binding to " + bind)

_ROOT = "/"
_VAR = os.path.join(_ROOT, "var")

loglevel = "info"
errorlog = os.path.join(_VAR, "log/error.log")

workers = multiprocessing.cpu_count() * 2 + 1

timeout = 30  # 30 s
keepalive = 5  # 5 s

capture_output = True

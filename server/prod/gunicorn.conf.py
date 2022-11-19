# file gunicorn.conf.py
# coding=utf-8
# Reference: https://github.com/benoitc/gunicorn/blob/master/examples/example_config.py
import os
import multiprocessing

host = "0.0.0.0"
port = os.environ.get("PORT")

if port is None:
    port = 5000
    print("PORT environment variable not found. Using default ({}).".format(port))
else:
    print("PORT environment variable found:", port)

bind = host + ":" + port
print("Binding to " + bind)

_ROOT = "/"
_VAR = os.path.join(_ROOT, "var")

loglevel = "info"
errorlog = os.path.join(_VAR, "log/error.log")
accesslog = os.path.join(_VAR, "log/access.log")
applicationlog = os.path.join(_VAR, "log/application.log")

workers = multiprocessing.cpu_count() * 2 + 1

timeout = 30  # 30 s
keepalive = 5  # 5 s

capture_output = True

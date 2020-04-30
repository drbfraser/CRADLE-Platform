# file gunicorn.conf.py
# coding=utf-8
# Reference: https://github.com/benoitc/gunicorn/blob/master/examples/example_config.py
# TODO: UPDATE the log paths, timeout, and keepalive params afterwards
import os
import multiprocessing

_ROOT = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..'))
_VAR = os.path.join(_ROOT, 'logs')

loglevel = 'info'
# errorlog = os.path.join(_VAR, 'log/cradle-error.log')
# accesslog = os.path.join(_VAR, 'log/cradle-access.log')
errorlog = "-"
accesslog = "-"

# bind = 'unix:%s' % os.path.join(_VAR, 'run/gunicorn.sock')
bind = '0.0.0.0:5000'
# workers = 3
workers = multiprocessing.cpu_count() * 2 + 1

timeout = 3 * 60  # 3 minutes
keepalive = 24 * 60 * 60  # 1 day

capture_output = True
# file gunicorn.conf.py
# coding=utf-8
# Reference: https://github.com/benoitc/gunicorn/blob/master/examples/example_config.py
import os
import multiprocessing

port = os.environ.get('PORT')
if port is None:
    print('PORT environment variable not found. Using default (5000).')
else:
    print('PORT environment variable found:', port)

_ROOT = '/'
_VAR = os.path.join(_ROOT, 'var')

loglevel = 'info'
errorlog = os.path.join(_VAR, 'log/cradle-error.log')
accesslog = os.path.join(_VAR, 'log/cradle-access.log')
# errorlog = "-"
# accesslog = "-"

# bind = 'unix:%s' % os.path.join(_VAR, 'run/gunicorn.sock')
bind = '0.0.0.0:5000'
workers = 1
# TODO: when upgrading server, uncoming the line below to replace the line above
# workers = multiprocessing.cpu_count() * 2 + 1

timeout = 30  # 30 s
keepalive = 5 # 5 s

capture_output = True
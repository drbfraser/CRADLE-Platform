"""Import-time configuration for API unit tests; no services are contacted."""

import os

# Set defaults before API modules import config and authentication.
_DEFAULTS = {
    "DB_USERNAME": "user",
    "DB_PASSWORD": "password",
    "DB_HOSTNAME": "localhost",
    "DB_PORT": "3306",
    "DB_NAME": "testdb",
    "FLASK_ENV": "testing",
    "TESTING": "1",
    "AWS_REGION": "us-west-2",
    "COGNITO_USER_POOL_ID": "us-west-2_unit_tests",
    "COGNITO_APP_CLIENT_ID": "unit-test-client",
    "COGNITO_CLIENT_SECRET": "unit-test-secret",
    "COGNITO_AWS_ACCESS_KEY_ID": "unit-test-access-key",
    "COGNITO_AWS_SECRET_ACCESS_KEY": "unit-test-secret-key",
}
for _key, _value in _DEFAULTS.items():
    os.environ.setdefault(_key, _value)

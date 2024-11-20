import json
import os
import pprint
import sys
from dotenv import load_dotenv

import boto3

"""
This script programmatically creates an AWS Cognito User Pool.
Intended to be used to create a user pool for developers.

Usage: `python create_user_pool.py <name>`
Example: `python create_user_pool.py ryan` will create a user pool with 
  the name 'cradle_user_pool-ryan'
"""

load_dotenv()
COGNITO_SECRETS_FILE = ".env.cognito_secrets"
load_dotenv(COGNITO_SECRETS_FILE)


AWS_REGION = "us-west-2"

COGNITO_AWS_ACCESS_KEY_ID = os.environ["COGNITO_AWS_ACCESS_KEY_ID"]
if COGNITO_AWS_ACCESS_KEY_ID is None:
    raise Exception("COGNITO_AWS_ACCESS_KEY_ID not found!")
COGNITO_AWS_SECRET_ACCESS_KEY = os.environ["COGNITO_AWS_SECRET_ACCESS_KEY"]
if COGNITO_AWS_SECRET_ACCESS_KEY is None:
    raise Exception("COGNITO_AWS_SECRET_ACCESS_KEY not found!")

print("AWS_REGION:", AWS_REGION)
print("COGNITO_AWS_ACCESS_KEY_ID:", COGNITO_AWS_ACCESS_KEY_ID)
print("COGNITO_AWS_SECRET_ACCESS_KEY:", COGNITO_AWS_SECRET_ACCESS_KEY)

pprinter = pprint.PrettyPrinter(indent=4, sort_dicts=False, compact=False)

client = boto3.client(
    service_name="cognito-idp",  # type: ignore
    region_name=AWS_REGION,
    aws_access_key_id=COGNITO_AWS_ACCESS_KEY_ID,
    aws_secret_access_key=COGNITO_AWS_SECRET_ACCESS_KEY,
)


def create_user_pool(name: str):
    response = client.create_user_pool(
        PoolName=f"cradle_user_pool-{name}",
        AutoVerifiedAttributes=[
            "email",
        ],
        AliasAttributes=["email"],
        MfaConfiguration="OFF",
        EmailConfiguration={
            "EmailSendingAccount": "COGNITO_DEFAULT",
        },
        AdminCreateUserConfig={
            "AllowAdminCreateUserOnly": True,
        },
        UsernameConfiguration={"CaseSensitive": False},
        AccountRecoverySetting={
            "RecoveryMechanisms": [
                {"Priority": 1, "Name": "verified_email"},
            ]
        },
    )
    return response.get("UserPool")


def create_user_pool_client(user_pool_id: str):
    response = client.create_user_pool_client(
        UserPoolId=user_pool_id,
        ClientName="cradle_app_client",
        GenerateSecret=True,
        ExplicitAuthFlows=[
            "ALLOW_ADMIN_USER_PASSWORD_AUTH",
            "ALLOW_USER_SRP_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
        ],
        CallbackURLs=[
            "http://localhost:3000/",
        ],
        LogoutURLs=[
            "http://localhost:3000/",
        ],
        PreventUserExistenceErrors="ENABLED",
    )
    return response.get("UserPoolClient")


def main():
    argv = sys.argv
    argc = len(argv)
    if argc < 2:
        raise Exception("No arguments were provided.")

    name = argv[1]

    user_pool = create_user_pool(name)
    user_pool_id = user_pool.get("Id")
    if user_pool_id is None:
        raise Exception("ERROR: Could not retrieve user pool Id.")
    user_pool_client = create_user_pool_client(user_pool_id)

    print()
    pprinter.pprint(user_pool)
    print()
    pprinter.pprint(user_pool_client)

    COGNITO_USER_POOL_ID = user_pool.get("Id")
    COGNITO_APP_CLIENT_ID = user_pool_client.get("ClientId")
    COGNITO_CLIENT_SECRET = user_pool_client.get("ClientSecret")

    # Writing the secrets to a temporary file to avoid accidentally overwriting
    # an existing file. Files name should be changed after creation to remove
    # the name that was passed as a command-line argument.
    with open(f"{COGNITO_SECRETS_FILE}.{name}", "w") as output_file:
        # Write to .env file.
        output_file.write(f"COGNITO_AWS_ACCESS_KEY_ID={COGNITO_AWS_ACCESS_KEY_ID}\n")
        output_file.write(
            f"COGNITO_AWS_SECRET_ACCESS_KEY={COGNITO_AWS_SECRET_ACCESS_KEY}\n"
        )
        output_file.write(f"COGNITO_USER_POOL_ID={COGNITO_USER_POOL_ID}\n")
        output_file.write(f"COGNITO_APP_CLIENT_ID={COGNITO_APP_CLIENT_ID}\n")
        output_file.write(f"COGNITO_CLIENT_SECRET={COGNITO_CLIENT_SECRET}\n")

    with open("user_pool.json", "w") as output_file:
        output_file.write(json.dumps(user_pool, indent=4, default=str))

    with open("user_pool_client.json", "w") as output_file:
        output_file.write(json.dumps(user_pool_client, indent=4, default=str))

    print(f"User pool ({user_pool.get('Name')}) created!")


if __name__ == "__main__":
    main()

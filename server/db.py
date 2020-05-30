#!/usr/bin/env python3

# This is a standalone script (i.e., not associated with flask) for managing database
# instances running in docker or locally. Note that this script does not provide
# complete functionality. Instead will need to reference `manage.py` for commands to
# populate a database with sample data.
#
# USAGE: python3 db.py COMMAND
#
# COMMANDS:
#   rebuild            - Rebuilds the database from scratch erasing all data
#   drop-all-tables    - Drops all tables in the database
#   drop               - Drops the database itself
#   create             - Creates the database with no tables

from environs import Env
import environs
import subprocess
import sys


def rebuild(env):
    """
    Rebuilds the database from scratch.
    """
    drop_all_tables(env)
    upgrade(env)


def upgrade(env):
    """
    Attempts to upgrade the database using flask.
    """
    print("Upgrading database...")
    result = exec_sh_cmd(
        env, ["flask", "db", "upgrade"], container="cradle", stderr=None
    )
    print("done")


def drop_all_tables(env):
    """
    Drops all tables in the database defined by the DB_NAME environment variable.

    Since it is actually pretty difficult to drop all of the tables in a database, we
    instead just drop the whole database then re-create it.
    """
    drop_database(env)
    create_database(env)


def create_database(env):
    """
    Creates the database defined by the DB_NAME environment variable.
    """
    db_name = env_var(env, "DB_NAME")
    print(f"Creating {db_name}... ", end="")
    if has_database(env):
        print("already exists")
        return
    result = exec_mysql_stmt(env, f"CREATE DATABASE {db_name};")
    print("done")


def drop_database(env):
    """
    Drops the database defined by the DB_NAME environment variable.
    """
    db_name = env_var(env, "DB_NAME")
    print(f"Dropping {db_name}... ", end="")
    if not has_database(env):
        print("doesn't exist")
        return
    result = exec_mysql_stmt(env, f"DROP DATABASE {db_name};")
    print("done")


def has_database(env):
    """
    Returns True if the database defined by the DB_NAME environment variable exists.
    """
    db_name = env_var(env, "DB_NAME")
    # Might produces some false positives if the user has another database with a
    # similar name.
    result = exec_mysql_stmt(env, f"SHOW DATABASES LIKE '{db_name}';")
    return result != ""


def exec_mysql_stmt(env, stmt, database=None):
    """
    Executes a mysql statement returning the results as a string.

    If the database is running in a docker container, the statement will be executed
    within that docker environment. Note that this means that the docker container must
    be running for this to work.

    Keyword Arguments:
    env      -- environment variable context
    stmt     -- the statement to execute
    database -- the database to execute the command in, if None then the command will
                be executed in no database (default None)
    """
    db_user = env_var(env, "DB_USERNAME")
    db_pass = env_var(env, "DB_PASSWORD")
    cmd = ["mysql", "-u", db_user, f"-p{db_pass}"]
    if database is not None:
        cmd += ["-D", database]
    if not is_using_docker(env):
        db_host = env_var(env, "DB_HOSTNAME")
        cmd += ["-h", db_host]
    cmd += ["-e", stmt]
    return exec_sh_cmd(env, cmd)


def exec_sh_cmd(env, cmd, container="mysql", stderr=subprocess.DEVNULL):
    """
    Executes a shell command.

    If we are using docker, then this will be executed within the context of the
    specified container.

    Terminates the script if the command exits with a non-zero return code.
    """
    sh_cmd = []
    if is_using_docker(env):
        sh_cmd = ["docker", "exec", container] + cmd
    else:
        sh_cmd = cmd
    try:
        return subprocess.check_output(sh_cmd, stderr=stderr).decode("utf-8")
    except subprocess.CalledProcessError as err:
        fatal(f"{' '.join(sh_cmd)}\nFailed with exit code {err.returncode}")


def is_using_docker(env):
    """
    Attempts to check if the current database configuration is using docker or not.

    This is done by checking the `DB_HOSTNAME` environment variable to see if it is
    defined as localhost or something else. If it's localhost then we are not using
    docker and we can access the database directly through mysql commands. Otherwise
    we'll have to execute our commands in a `docker exec` command.
    """
    if force_local:
        return False
    db_host = env_var(env, "DB_HOSTNAME")
    non_docker_hostnames = ["localhost", "127.0.0.1"]
    return db_host not in non_docker_hostnames


def env_var(env, var):
    """
    Returns the value for an environment variable `var`.
    """
    try:
        var = env(var)
        return var
    except environs.EnvError:
        fatal(f"Unable to find environment variable {var}")


def fatal(msg):
    """
    Displays an error message and terminates the script.
    """
    print(msg)
    exit(1)


force_local = False


if __name__ == "__main__":
    env = Env()
    env.read_env()

    commands = {
        "rebuild": rebuild,
        "drop-all-tables": drop_all_tables,
        "drop": drop_database,
        "create": create_database,
    }

    if len(sys.argv) != 2:
        print("USAGE: python3 db.py COMMAND")
        print()
        print("COMMANDS")
        for cmd in commands.keys():
            print(f"  {cmd}")
        exit(1)

    if len(sys.argv) == 3 and sys.argv[2] == "--no-docker":
        force_local = True

    cmd = sys.argv[1]
    try:
        fun = commands[cmd]
        fun(env)
    except KeyError:
        print(f"Invalid command: {cmd}")
        exit(1)

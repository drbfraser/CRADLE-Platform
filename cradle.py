#!/usr/bin/env python3

# Cradle development manager script. Specifically designed for docker environments with
# limited support for manual environments.
#
# Note: this script is executable, so on unix systems you may run the script directly
# instead of through the python command (e.g., `./cradle.py up`).
#
# For how to debug frontend dependency issues, see the end of this comment.
#
# This script requires certian environment variables to be defined. They can be defined
# as regular env variabels or as apart of a `.env` file. By default, the script will
# look for `server/.env` to load environment variables. A sample `server/.env` file
# which outlines the required env variables is as follows:
#
#   DB_USERNAME=admin
#   DB_PASSWORD=password
#   EMAIL_USER=sample_user@gmail.com
#   EMAIL_PASSWORD=password
#   DB_HOSTNAME=db
#   DB_PORT=3306
#   DB_NAME=cradle
#
# Some notes on these values:
#   * DB_USERNAME may be anything except `root` which sometimes causes problems
#   * DB_PASSWORD can be anything except empty
#   * EMAIL_USER must be an email, doesn't need to be your actual email though
#   * EMAIL_PASSWORD can be anything except empty
#   * DB_HOSTNAME must be `db` if using docker or it must be `localhost` if using a
#     manual setup
#   * DB_PORT should be 3306
#   * DB_NAME can be anything except empty
#
#
# Common commands are outlined here, for more usage information run:
#
#   python cradle.py --help
#
#
# Starting containers:
#
#   python cradle.py up
#
# The `up` command is what you will be using the most to build and run the project. It
# will handle setting up a new database instance if one does not already exist so you
# don't need to worry about setting that stuff up. An optional `--build` flag can be
# passed to the command to rebuild docker images. Try adding this flag if you are
# dealing with frontend dependency issues. The `-d` flag may be used to run the program
# in the background. You probably don't want to use this during development but it is
# there if you want it.
#
#
# Stopping containers:
#
#   python cradle.py down
#
# If running containers in a detached state (i.e., in the background) this command can
# be used to stop and remove them. You only need to run this command if you started the
# containers using the `-d` flag.
#
#
# Rebuilding the database:
#
#   python cradle.py rebuild
#
# This command deletes the contents of the database and rebuilds it to a usable state.
# This involves adding the required tables and seeding the database with sample data.
# Note that this does not clean out any docker caches which may be the cause of
# frontend dependency issues. If dealing with such issues this is not the command you
# are looking for, instead try the `prune` command listed below.
#
#
# The "purge all the things and rebuild from scratch" command:
#
#   docker system prune --all --volumes
#
# This command, while not apart of the script, will reset your docker environment
# deleting all of your images and volumes. DO NOT RUN THIS COMMAND IF YOU HAVE DATA
# YOU WANT TO KEEP! After running this command, simply running `python cradle.py up`
# will handle rebuilding the containers and setting up the database to be useable. It
# will take quite a while for this to happen but it is the only command you need to
# run to get back up and running after resetting everything.
#
#
# Debugging frontend dependency issues:
#
# If adding a new dependency you will need to include the `--build` flag for the `up`
# command:
#
#   python cradle.py up --build
#
# There is no guarantee that this will actually fix your problem, though it's best to
# try this first as the alternative will take a considerable amount of time to run.
# The alternative is to prune everything and start fresh:
#
#   docker system prune --all --volumes
#   python cradle.py up
#
# This is assuming you don't have any information stored in docker volumes which you
# want to keep. If you do then it's up to you how you go about pruning your system.
# The `--build` flag is not required here as all containers will be rebuilt after a
# prune anyway.

import argparse
import os
import subprocess
import sys
import time


def compose_up(args):
    """
    Wraps docker-compose up.
    """
    if not using_docker():
        fatal("`up` subcommand is only valid in docker environments")
    volume_list = find_volume("mysql")
    database_requires_seed = False
    if not volume_list:
        verbose_log("Unable to find database volume")
        database_requires_seed = True
    restart_containers_after = database_requires_seed and not args.detach
    verbose_log("Starting containers")
    cmd = ["docker-compose"]
    if args.file is not None:
        cmd += ["-f", args.file]
    cmd += ["up"]
    if args.build:
        cmd += ["--build"]
    if args.detach or database_requires_seed:
        cmd += ["--detach"]
    if args.service is not None:
        cmd += [args.service]
    exec_sh_cmd(cmd, local=True)
    if database_requires_seed:
        verbose_log("Seeding database")
        drop_database()
        create_database()
        upgrade_database()
        seed_database(args.seed_cmd)
    if restart_containers_after:
        verbose_log("Restarting containers in non-detached mode")
        compose_down(args)
        # Need not rebuild containers again.
        dict_args = dict(vars(args), **{"build": False})
        compose_up(argparse.Namespace(**dict_args))


def compose_down(args):
    """
    Wraps docker-compose down.
    """
    if not using_docker():
        fatal("`down` subcommand is only valid in docker environments")
    verbose_log("Tearing down containers")
    cmd = ["docker-compose"]
    if args.file is not None:
        cmd += ["-f", args.file]
    cmd += ["down"]
    exec_sh_cmd(cmd, local=True)


def rebuild_database(args):
    """
    Rebuilds a database instance; creates tables and seeds them with data.
    """
    verbose_log("Tearing down and rebuilding database")
    should_stop_containers = False

    # Delete the database's volume if prompted to.
    if args.delete_volume:
        if not using_docker():
            fatal("`--delete-volume` flag is only valid in docker environments")
        volume_list = find_volume("mysql")
        if not volume_list:
            fatal("unable to find database volume")
        elif len(volume_list) > 1:
            fatal("multiple possible volumes found, please delete it manually")
        volume_name = volume_list[0]
        verbose_log("Removing containers")
        compose_down(args)
        verbose_log("Removing MySQL volume")
        exec_sh_cmd(["docker", "volume", "rm", volume_name], local=True)

    # Startup containers if they are not already running.
    if using_docker() and mysql_container(required=False) is None:
        should_stop_containers = True
        verbose_log("Database container is not running")
        dict_args = dict(
            vars(args), **{"build": False, "detach": True, "service": None}
        )
        compose_up(argparse.Namespace(**dict_args))
        verbose_log("Sleeping for a bit to let the containers warm up")
        time.sleep(5)

    # Drop the database.
    drop_database()

    # Create and seed the database.
    create_database()
    upgrade_database()
    seed_database(args.seed_cmd)
    if should_stop_containers:
        compose_down(args)


def mysql_prompt(args):
    """
    Launches a MySQL prompt.
    """
    db_username = None
    if args.username is not None:
        db_username = args.username
    else:
        db_username = env.get("DB_USERNAME")
    db_password = None
    if args.password is not None:
        db_password = args.password
    else:
        db_password = env.get("DB_PASSWORD")
    cmd = ["mysql", "-u", db_username, f"-p{db_password}"]
    if using_docker():
        container = mysql_container()
        cmd = ["docker", "exec", "-it", container] + cmd
    exec_sh_cmd(cmd, local=True)


def create_database():
    db_name = env.get("DB_NAME", required=True)
    verbose_log(f"Creating database {db_name}")
    exec_mysql_stmt(f"CREATE DATABASE `{db_name}`;")


def drop_database():
    db_name = env.get("DB_NAME", required=True)
    verbose_log(f"Dropping database {db_name}")
    exec_mysql_stmt(f"DROP DATABASE IF EXISTS `{db_name}`;")


def upgrade_database():
    """
    Upgrades the database using flask.
    """
    verbose_log("Upgrading database using flask")
    server_name = None
    if using_docker():
        server_name = server_container()
    exec_sh_cmd(["flask", "db", "upgrade"], container=server_name)


def seed_database(seed_cmd="seed"):
    """
    Seeds the database with random data.
    """
    verbose_log(f"Seeding database with management command: {seed_cmd}")
    server_name = None
    local_manage_script = "manage.py"
    if using_docker():
        server_name = server_container()
    else:
        local_manage_script = manage_script
    exec_sh_cmd(["python", local_manage_script, seed_cmd], container=server_name)


def exec_mysql_stmt(stmt, database=None):
    """
    Executes a MySQL statement.
    """
    container_name = None
    if using_docker():
        container_name = mysql_container()
    username = env.get("DB_USERNAME", required=True)
    password = env.get("DB_PASSWORD", required=True)
    sh_cmd = ["mysql", "-u", username, f"-p{password}"]
    if database is not None:
        sh_cmd += [database]
    sh_cmd += ["-e", stmt]
    exec_sh_cmd(sh_cmd, container=container_name)


def server_container(required=True):
    """
    Returns the name of the server container.
    """
    return find_container("SERVER_CONTAINER_NAME", "server", required)


def mysql_container(required=True):
    """
    Returns the name of the database container.
    """
    return find_container("DB_CONTAINER_NAME", "mysql", required)


def find_container(env_var, image_name, required):
    """
    Searches for and returns the name of a container.
    """
    container_name = env.get(env_var)
    if container_name is not None:
        return container_name
    containers = [c for c in docker_processes() if image_name in c.image]
    if len(containers) == 0:
        if required:
            fatal("unable to find required container, are the containers running?")
        else:
            return None
    if len(containers) > 1:
        fatal(
            f"many possible database containers found\n"
            + "Please define a {env_var} environment variable"
        )
    return containers[0].name


def find_volume(pattern):
    """
    Returns a list of volumes which have a name matching a given pattern.
    """
    output = subprocess.check_output(["docker", "volume", "list"]).decode("utf-8")
    lines = [l for l in output.split("\n") if l != ""]
    names = []
    for line in lines[1:]:
        columns = [x.strip() for x in line.split("  ") if x != ""]
        names.append(columns[1])
    return [n for n in names if pattern in n]


def exec_sh_cmd(cmd, local=False, container=None):
    """
    Executes a shell command without capturing output.

    If docker is configured, the command will be executed within a given container. This
    can disabled (running on the local machine) by setting `local` to `True`.
    """
    sh_cmd = cmd
    if using_docker() and not local:
        if container == None:
            fatal("programmer error: no container supplied for docker command")
        sh_cmd = ["docker", "exec", container] + cmd
    verbose_log(" ".join(sh_cmd))
    try:
        result = subprocess.run(sh_cmd)
        if fail_on_error and result.returncode != 0:
            fatal(f"'{' '.join(sh_cmd)}' failed with exit code {result.returncode}")
    except KeyboardInterrupt:
        sys.exit(0)


class Container:
    """
    Information about a docker container.
    """

    def __init__(self, id, image, name):
        self.id = id
        self.image = image
        self.name = name

    def __repr__(self):
        return f"Container(id={self.id}, image={self.image}, name={self.name})"


def docker_processes():
    """
    Returns a list of docker processes currently running.
    """
    output = subprocess.check_output(["docker", "ps"]).decode("utf-8")
    lines = [l for l in output.split("\n") if l != ""]
    containers = []
    for line in lines[1:]:
        columns = [x.strip() for x in line.split("  ") if x != ""]
        containers.append(Container(columns[0], columns[1], columns[6]))
    return containers


def using_docker():
    """
    Returns `True` if the user is using a docker development setup, `False` otherwise.
    """
    if docker_override is not None:
        return docker_override
    # If the user has the DEV_SETUP environment variable set use that to
    # determine if we should use docker or not.
    setup = env.get("DEV_SETUP")
    if setup is not None:
        return setup == "docker"
    # If not, try and infer whether we are using docker or not.
    return env.get("DB_HOSTNAME", required=True) != "localhost"


class Env:
    """
    Read-only wrapper around the operating stystem's environment variables and user-
    specified environment files.
    """

    def __init__(self, *env_file):
        self.env_map = {}
        for file in env_file:
            verbose_log(f"Sourcing env file: {file}")
            env_file_vars = parse_env_file(file)
            self.env_map = dict(self.env_map, **env_file_vars)

    def get(self, var, required=False, default=None):
        """
        Returns the value for a given environment variable, first looking in the parsed
        environment files then searching the user's environment if it cannot be found.
        """
        try:
            return self.env_map[var]
        except KeyError:
            fallback = os.getenv(var)
            if required and fallback is None and default is None:
                fatal(f"no value for required environment variable {var}")
            if fallback is None:
                return default
            return fallback


def parse_env_file(filename):
    """
    Parses an environment variable file returning a dictionary containing the key-value
    pairs listed in the file.
    """
    try:
        with (open(filename, "r")) as fh:
            return dict(
                tuple(map(lambda s: s.strip(), line.split("=")))
                for line in fh.readlines()
                if not line.strip().startswith("#")
            )
    except FileNotFoundError:
        fatal(f"unable to source env file '{filename}': file not found")


def fatal(msg):
    """
    Displays an error message and terminates the script.
    """
    print(f"Error: {msg}")
    exit(1)


def verbose_log(*msg):
    """
    Prints a message if verbose mode is enabled.
    """
    if verbose:
        print("--", *msg)


# For --[no-]-toggle flags
#   ref: https://stackoverflow.com/a/34736291
class NegateAction(argparse.Action):
    def __call__(self, parser, ns, values, option):
        setattr(ns, self.dest, option[2:4] != "no")


#
# Global State
#
env = None
manage_script = None
verbose = False
docker_override = None
fail_on_error = True

if __name__ == "__main__":
    #
    # Root Parser
    #
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-q", "--quiet", help="decrease output verbosity", action="store_true"
    )
    parser.add_argument(
        "--env-file",
        type=str,
        help="environment file to load (default: server/.env)",
        metavar="PATH",
        default="server/.env",
    )
    parser.add_argument(
        "--manage-script",
        type=str,
        help="path to manage.py script for seeding (default: server/manage.py)",
        metavar="PATH",
        default="server/manage.py",
    )
    parser.add_argument(
        "--docker",
        "--no-docker",
        dest="force_docker",
        default=None,
        help="force docker environment on or off (default: auto)",
        action=NegateAction,
        nargs=0,
    )

    subparsers = parser.add_subparsers(help="sub-commands")

    #
    # python cradle.py up
    #
    up_parser = subparsers.add_parser("up", help="start containers")
    up_parser.add_argument(
        "-f", "--file", type=str, help="docker-compose file to run", metavar="PATH"
    )
    up_parser.add_argument("--build", help="build containers", action="store_true")
    up_parser.add_argument(
        "-d",
        "--detach",
        help="run services as background processes",
        action="store_true",
    )
    up_parser.add_argument(
        "--service", type=str, help="specific service to run (default: all services)"
    )
    up_parser.add_argument(
        "--seed-cmd",
        type=str,
        default="seed",
        help="the command to seed the database with (default: seed)",
    )
    up_parser.set_defaults(func=compose_up)

    #
    # python cradle.py down
    #
    down_parser = subparsers.add_parser("down", help="stop containers")
    down_parser.add_argument(
        "-f", "--file", type=str, help="docker-compose file to run", metavar="PATH"
    )
    down_parser.set_defaults(func=compose_down)

    #
    # python cradle.py rebuild
    #
    rebuild_parser = subparsers.add_parser("rebuild", help="rebuild database")
    rebuild_parser.add_argument(
        "-f", "--file", type=str, help="docker-compose file to run", metavar="PATH"
    )
    rebuild_parser.add_argument(
        "--delete-volume", help="delete the docker volume", action="store_true"
    )
    rebuild_parser.add_argument(
        "--seed-cmd",
        type=str,
        default="seed",
        help="the command to seed the database with (default: seed)",
    )
    rebuild_parser.set_defaults(func=rebuild_database)

    #
    # python cradle.py mysql
    #
    mysql_parser = subparsers.add_parser("mysql", help="launches a MySQL prompt")
    mysql_parser.add_argument(
        "-u", "--username", type=str, help="MySQL username override"
    )
    mysql_parser.add_argument(
        "-p", "--password", type=str, help="MySQL password override"
    )
    mysql_parser.set_defaults(func=mysql_prompt)

    args = parser.parse_args()
    verbose = not args.quiet
    docker_override = args.force_docker
    manage_script = args.manage_script
    env = Env(args.env_file)
    args.func(args)

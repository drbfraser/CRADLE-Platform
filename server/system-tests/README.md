# Server System Tests

This directory contains system tests for the sever as opposed to `server/Tests` which
contains unit tests. System tests run alongside a live server instance with a database
containing predetermined test data.

System tests may utilized the server's REST API or it's database system for performing
tests. When testing the database system it is important to note that the state of the
database is **not** reset between tests. It is however reset at the start of each new
CI job meaning that state of the database is always known before any tests are run.

Tests which do not need a live instance of the server or database to run should be
placed in [`server/Tests`](../tests).

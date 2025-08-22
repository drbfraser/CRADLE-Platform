# Testing

This guide details the steps necessary to manually run the various test suites for the Cradle Platform.

## Front-end

All of our front-end tests should have custom npm scripts for aliasing their commands. Check `/client/package.json` for all of the available options.

### Front-end unit tests

For our front-end unit tests, we are using [Vitest](https://vitest.dev/), which has an API that is compatible with [Jest](https://jestjs.io/).

To run the front-end unit tests, run either

```bash
npx vitest
```

or

```bash
npm run test
```

To run a single test file, run

```bash
npm test -- <filename>.test.ts
```

## Back-end

For our back-end tests, we are using [Pytest](https://docs.pytest.org/en/stable/).

To run pytest, first make sure that the Flask server container is running. Then, open a different terminal.

For unit tests:

```bash
docker exec cradle_flask python -m pytest tests
```

For system tests:

```bash
docker exec cradle_flask python -m pytest system_tests
```

To run only a specific test file, you can pass the path to the file, e.g:

```bash
docker exec cradle_flask python -m pytest system_tests/api/test_users.py
```

To run only a specific test function, you can append `::<function_name>` to the path to the test file, e.g:

```bash
docker exec cradle_flask python -m pytest system_tests/api/test_users.py::test_get_all_users
```

To suppress deprecation warnings when running pytest, you can use the `-p no:warnings` option, e.g:

```bash
docker exec cradle_flask python -m pytest -p no:warnings system_tests
```

## End-to-End

For end-to-end testing, we are using Playwright. Before trying to run the end-to-end tests, ensure that both the Flask server container and the Vite server are running. The commands for running the end-to-end tests must be run from the `/client/` directory, not the root directory.

Playwright runs in 'headless' mode by default, meaning that it runs in the background, without any UI. It can be run with a GUI however, by using the `--ui` option.

For a more in-depth information on Playwright look [here](playwright.md).

**NOTE:** Make sure you are in the `/client/` directory before running any of these commands.

To run the end-to-end tests:

```bash
npx playwright test
```

or

```bash
npm run e2e
```

To run the end-to-end tests with a GUI:

```bash
npx playwright test --ui
```

or

```bash
npm run e2e:ui
```

import config

app = config.app_factory()


def create_mock_app():

    app = config.test_app_factory()
    return app

def create_app():

    app = config.app_factory()
    return app
from flask import current_app

with current_app.app_context():
    import config

db_session = config.db.session

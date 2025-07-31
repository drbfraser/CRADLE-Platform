from application import app

with app.app_context():
    import config

db_session = config.db.session

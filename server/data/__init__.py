import config
from flask_sqlalchemy import SessionBase

db_session: SessionBase = config.db.session

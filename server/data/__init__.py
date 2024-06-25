from flask_sqlalchemy import SessionBase

import config

db_session: SessionBase = config.db.session

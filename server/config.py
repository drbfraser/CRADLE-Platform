import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{username}:{password}@localhost:3306/{db_name}' # ex: 'mysql+pymysql://root:123456@localhost:3306/mydb'
    SQLALCHEMY_ECHO = True

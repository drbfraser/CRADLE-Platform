from models import User, UserSchema

from .Database import Database

class UserRepo(Database):
    def __init__(self):
        super(UserRepo, self).__init__(
            table=User,
            schema=UserSchema
        )
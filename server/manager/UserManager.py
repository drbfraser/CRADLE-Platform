from database.UserRepo import UserRepo
from manager.Manager import Manager


class UserManager(Manager):
    def __init__(self):
        Manager.__init__(self, UserRepo)

    def read_all_no_password(self):
        users_query = self.read_all()
        for user in users_query:
            user.pop("password", None)

        return users_query

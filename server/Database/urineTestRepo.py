from models import urineTest, urineTestSchema

from .Database import Database


class urineTestRepo(Database):
    def __init__(self):
        super(urineTestRepo, self).__init__(table=urineTest, schema=urineTestSchema)

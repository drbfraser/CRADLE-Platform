from models import UrineTest, UrineTestSchema

from .Database import Database


class urineTestRepo(Database):
    def __init__(self):
        super(urineTestRepo, self).__init__(table=UrineTest, schema=UrineTestSchema)

from models import Reading, ReadingSchema

from .Database import Database

class ReadingRepo(Database):
    def __init__(self):
        super(ReadingRepo, self).__init__(
            table=Reading,
            schema=ReadingSchema
        )


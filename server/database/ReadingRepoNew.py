from models import Reading, ReadingSchema

from .Database import Database
from config import db


class ReadingRepo(Database):
    def __init__(self):
        super(ReadingRepo, self).__init__(table=Reading, schema=ReadingSchema)

    def create(self, new_data: dict) -> dict:
        """
        Inserts a new reading into the database.

        Before inserting, the reading's traffic light is computed and stored within the
        object. This means that the `trafficLightStatus` field will be populated in the
        return value.

        :param new_data: A dictionary containing reading information
        :return: A dictionary containing the data that was inserted
        """
        reading = self.schema().load(new_data, session=db.session)
        reading.trafficLightStatus = reading.get_traffic_light()
        db.session.add(reading)
        db.session.commit()
        return self.model_to_dict(reading)

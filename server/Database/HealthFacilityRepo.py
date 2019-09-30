from config import db
from models import HealthFacilitySchema

class HealthFacilityRepo:
    def __init__(self):
        pass

    @staticmethod
    def model_to_dict(model):
        return HealthFacilitySchema().dump(model)

    @staticmethod
    def add_new_hf(hf_data):
        # Add new health facility to db
        schema = HealthFacilitySchema()
        new_hf = schema.load(hf_data, session=db.session)
        
        db.session.add(new_hf)
        db.session.commit()

        # Return the newly created health facility object
        return new_hf
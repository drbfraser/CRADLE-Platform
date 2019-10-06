from Database import HealthFacilityRepo
from models import HealthFacilitySchema

hf_database = HealthFacilityRepo.HealthFacilityRepo()

def create_health_facility(hf_data):
    new_hf = hf_database.add_new_hf(hf_data)
    return {
        'healthFacility': HealthFacilitySchema().dump(new_hf),
    }
import data.db_operations as crud
from common import phone_number_utils
from enums import FacilityTypeEnum
from models import HealthFacilityOrm

valid_facility_types = [valid_type.value for valid_type in FacilityTypeEnum]


def does_facility_exist(facility_name: str):
    """Return True if a health facility with the given name exists in the database."""
    facility_name = facility_name.lower()
    facility_model = crud.read(HealthFacilityOrm, name=facility_name)
    return facility_model is not None


def create_health_facility(
    name: str,
    phone_number: str,
    type: str,
    location: str,
    about: str,
):
    """Validate and create a new health facility record, raising ValueError on invalid inputs."""
    name = name.title()

    if type not in valid_facility_types:
        raise ValueError(f"Type ({type}) is not a valid facility type.")

    if not phone_number_utils.is_format_valid(phone_number):
        formatted_phone_number = phone_number_utils.format_to_E164(phone_number)
        print(f"Formatted number: {formatted_phone_number}")
        raise ValueError(f"Phone number ({phone_number}) is not valid.")

    formatted_phone_number = phone_number_utils.format_to_E164(phone_number)

    if phone_number_utils.does_phone_number_exist(formatted_phone_number):
        raise ValueError(f"Phone number ({phone_number}) is already assigned.")

    if does_facility_exist(name):
        raise ValueError(f"Facility ({name}) already exists.")

    crud.create(
        HealthFacilityOrm(
            name=name,
            phone_number=formatted_phone_number,
            type=type,
            location=location,
            about=about,
        )
    )

from data import crud
from enums import FacilityTypeEnum
from models import HealthFacilityOrm
from shared.phone_number_utils import PhoneNumberUtils

valid_facility_types = [valid_type.value for valid_type in FacilityTypeEnum]


class HealthFacilityUtils:
    @staticmethod
    def does_facility_exist(facility_name: str):
        facility_name = facility_name.lower()
        facility_model = crud.read(HealthFacilityOrm, name=facility_name)
        return facility_model is not None

    # End of function.

    @staticmethod
    def create_health_facility(
        name: str,
        phone_number: str,
        type: str,
        location: str,
        about: str,
    ):
        name = name.title()

        if type not in valid_facility_types:
            raise ValueError(f"Type ({type}) is not a valid facility type.")

        # Check if phone number is valid.
        if not PhoneNumberUtils.is_format_valid(phone_number):
            formatted_phone_number = PhoneNumberUtils.format_to_E164(phone_number)
            print(f"Formatted number: {formatted_phone_number}")
            raise ValueError(f"Phone number ({phone_number}) is not valid.")

        # Format phone number for storage.
        formatted_phone_number = PhoneNumberUtils.format_to_E164(phone_number)

        # Check if phone number is unique.
        if PhoneNumberUtils.does_phone_number_exist(formatted_phone_number):
            raise ValueError(f"Phone number ({phone_number}) is already assigned.")

        # Check if facility already exists.
        if HealthFacilityUtils.does_facility_exist(name):
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

    # End of function.

from data import crud
from enums import FacilityTypeEnum
from models import HealthFacility
from shared.phone_numbers import PhoneNumberUtils

valid_facility_types = [valid_type.value for valid_type in FacilityTypeEnum]

class HealthFacilityUtils:
    @staticmethod
    def does_facility_exist(facility_name: str):
        facility_name = facility_name.lower()
        facility_model = crud.read(HealthFacility, name=facility_name)
        return facility_model is not None
    # End of function.

    @staticmethod
    def create_health_facility(facility_name: str,
                               phone_number: str,
                               facility_type: str,
                               location: str,
                               about: str):
        facility_name = facility_name.lower()

        if facility_type not in valid_facility_types:
            raise RuntimeError(f"Type ({facility_type}) is not a valid facility type.")

        # Check if phone number is valid.
        if not PhoneNumberUtils.is_phone_number_valid(phone_number):
            formatted_phone_number = PhoneNumberUtils.format_to_E164(phone_number)
            print(f"Formatted number: {formatted_phone_number}")
            raise RuntimeError(f"Phone number ({phone_number}) is not valid.")

        # Format phone number for storage.
        formatted_phone_number = PhoneNumberUtils.format_to_E164(phone_number)

        # Check if phone number is unique.
        if PhoneNumberUtils.does_E164_phone_number_exist(formatted_phone_number):
            raise RuntimeError(f"Phone number ({phone_number}) is already assigned.")

        # Check if facility already exists.
        if HealthFacilityUtils.does_facility_exist(facility_name):
            raise RuntimeError(f"Facility ({facility_name}) already exists.")

        crud.create(HealthFacility(name=facility_name,
                                        phone_number=formatted_phone_number,
                                        type=facility_type,
                                        location=location,
                                        about=about))
    # End of function.

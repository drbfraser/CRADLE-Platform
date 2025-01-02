import logging
from datetime import date

from dateutil.relativedelta import relativedelta
from flask import abort
from flask_openapi3.blueprint import APIBlueprint

from api.decorator import roles_required
from common import user_utils
from common.api_utils import FacilityNamePath, UserIdPath
from data import crud
from enums import RoleEnum, TrafficLightEnum
from models import UserOrm
from validation.stats import TimestampValidator

LOGGER = logging.getLogger(__name__)


def query_stats_data(args, facility_id="%", user_id="%"):
    patients = crud.get_unique_patients_with_readings(
        facility=facility_id,
        user=user_id,
        filter=args,
    )[0][0]
    total_readings = crud.get_total_readings_completed(
        facility=facility_id,
        user=user_id,
        filter=args,
    )[0][0]
    color_readings_q = crud.get_total_color_readings(
        facility=facility_id,
        user=user_id,
        filter=args,
    )
    total_referrals = crud.get_sent_referrals(
        facility=facility_id,
        user=user_id,
        filter=args,
    )[0][0]

    days_with_readings = crud.get_days_with_readings(
        facility=facility_id,
        user=user_id,
        filter=args,
    )[0][0]

    color_readings = create_color_readings(color_readings_q)

    response_json = {
        "sent_referrals": total_referrals,
        "days_with_readings": days_with_readings,
        "unique_patient_readings": patients,
        "total_readings": total_readings,
        "color_readings": color_readings,
    }

    if user_id == "%":
        referred_patients = crud.get_referred_patients(
            facility=facility_id,
            filter=args,
        )[0][0]
        response_json["patients_referred"] = referred_patients

    return response_json


def create_color_readings(color_readings_q):
    color_readings = {
        TrafficLightEnum.GREEN.value: 0,
        TrafficLightEnum.YELLOW_UP.value: 0,
        TrafficLightEnum.YELLOW_DOWN.value: 0,
        TrafficLightEnum.RED_UP.value: 0,
        TrafficLightEnum.RED_DOWN.value: 0,
    }

    for reading in color_readings_q:
        if color_readings.get(reading[0]) is not None:
            color_readings[reading[0]] = reading[1]

    return color_readings


# api/stats
api_stats = APIBlueprint(
    name="stats",
    import_name=__name__,
    url_prefix="/api/stats",
)


# api/stats/all [GET]
@api_stats.get("all")
@roles_required([RoleEnum.ADMIN])
def get_all_stats(query: TimestampValidator):
    """
    Get all statistics for patients.
    """
    # Date filters default to max range
    filter = query.model_dump()
    response = query_stats_data(filter)
    return response, 200


# api/stats/facility/<string:facility_id> [GET]
@api_stats.get("/facility/<string:facility_id>")
@roles_required([RoleEnum.ADMIN, RoleEnum.HCW])
def get_facility_stats(path: FacilityNamePath, query: TimestampValidator):
    current_user = user_utils.get_current_user_from_jwt()
    if (
        current_user["role"] == RoleEnum.HCW.value
        and current_user["health_facility_name"] != path.health_facility_name
    ):
        return abort(401, message="Unauthorized to view this facility")
    filter = query.model_dump()
    response = query_stats_data(filter, facility_id=path.health_facility_name)
    return response, 200


def has_permission_to_view_user(user_id):
    current_user = user_utils.get_current_user_from_jwt()
    role = current_user["role"]
    is_current_user = current_user["id"] == user_id

    if is_current_user:
        return True

    if role == RoleEnum.VHT.value:
        return False

    if role == RoleEnum.CHO.value:
        supervised = crud.get_supervised_vhts(current_user["id"])
        if supervised is None:
            return False
        supervised = [user[0] for user in supervised]
        if user_id not in supervised:
            return False

    if role == RoleEnum.HCW.value:
        user = crud.read(UserOrm, id=user_id)
        if user is None:
            return False
        if current_user["health_facility_name"] != user.health_facility_name:
            return False

    return True


# api/stats/user/<int:user_id> [GET]
@api_stats.get("/user/<int:user_id>")
@roles_required([RoleEnum.ADMIN, RoleEnum.CHO, RoleEnum.HCW, RoleEnum.VHT])
def get_user_stats(path: UserIdPath, query: TimestampValidator):
    if not has_permission_to_view_user(path.user_id):
        return abort(401, "Unauthorized to view this endpoint")
    filter = query.model_dump()
    response = query_stats_data(filter, user_id=str(path.user_id))
    return response, 200


# api/stats/export/<int:user_id> [GET]
@api_stats.get("/export/<int:user_id>")
@roles_required([RoleEnum.ADMIN, RoleEnum.CHO, RoleEnum.HCW, RoleEnum.VHT])
def get_stats_export(path: UserIdPath, query: TimestampValidator):
    filter = query.model_dump()

    if crud.read(UserOrm, id=path.user_id) is None:
        return abort(404, "User with this ID does not exist")

    if not has_permission_to_view_user(path.user_id):
        return abort(401, "Unauthorized to view this endpoint")

    query_response = crud.get_export_data(path.user_id, filter)
    response = []
    if query_response is None:
        return response, 200
    for entry in query_response:
        age = relativedelta(date.today(), entry["date_of_birth"]).years
        traffic_light = entry.get("traffic_light_status").name
        color = None
        if traffic_light:
            traffic_light = traffic_light.split("_")
            color = traffic_light[0]

        arrow = None
        if len(traffic_light) > 1:
            arrow = traffic_light[1]

        response.append(
            {
                "referral_date": entry.get("date_referred"),
                "patient_id": entry.get("patient_id"),
                "name": entry.get("patient_name"),
                "sex": entry.get("sex").name,
                "age": age,
                "pregnant": bool(entry.get("is_pregnant")),
                "systolic_blood_pressure": entry.get("systolic_blood_pressure"),
                "diastolic_blood_pressure": entry.get("diastolic_blood_pressure"),
                "heart_rate": entry.get("heart_rate"),
                "traffic_color": color,
                "traffic_arrow": arrow,
            },
        )

    return response, 200

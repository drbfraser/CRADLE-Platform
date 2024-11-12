from datetime import date

from enums import TrafficLightEnum
from models import ReadingOrm


def get_stats_data(
    data_needed,
    readings: list[ReadingOrm],
    current_year,
    current_month,
    is_from_last_twelve_months=False,
):
    if data_needed == "traffic_light_status":
        data = [0, 0, 0, 0, 0]
    else:
        data = [[], [], [], [], [], [], [], [], [], [], [], []]

    if data_needed == "traffic_light_status":
        # do traffic light status stuff here
        data = get_traffic_light(readings, data)

    else:
        # month_index is used for indexing purpose when is_from_last_twelve_months is True
        month_index = 0
        for reading in readings:
            date_unix_ts = reading.date_taken
            date_object = date.fromtimestamp(date_unix_ts)
            item_month = date_object.month
            item_year = date_object.year
            if current_year == item_year or (
                is_from_last_twelve_months
                and current_year == item_year + 1
                and (current_month + (12 - item_month)) < 12
            ):
                if is_from_last_twelve_months:
                    month_index = get_month_index(
                        item_year,
                        item_month,
                        current_year,
                        current_month,
                    )
                if data_needed == "systolic_blood_pressure":
                    data[item_month - 1].append(reading.systolic_blood_pressure)
                elif data_needed == "diastolic_blood_pressure":
                    data[item_month - 1].append(reading.diastolic_blood_pressure)
                elif data_needed == "heart_rate":
                    data[item_month - 1].append(reading.heart_rate)
                elif data_needed == "bpSystolicLastTwelveMonths":
                    data[month_index].append(reading.systolic_blood_pressure)
                elif data_needed == "bpDiastolicLastTwelveMonths":
                    data[month_index].append(reading.diastolic_blood_pressure)
                elif data_needed == "heartRateBPMLastTwelveMonths":
                    data[month_index].append(reading.heart_rate)
    return data


# This function is used to get month index when we are retrieving the data dated from the last twelve months
def get_month_index(item_year, item_month, current_year, current_month):
    if current_year == item_year:
        return 12 - (current_month - item_month) - 1
    return item_month - current_month - 1


def get_traffic_light(readings: list[ReadingOrm], data):
    traffic_light_indexes = {
        TrafficLightEnum.GREEN: 0,
        TrafficLightEnum.YELLOW_UP: 1,
        TrafficLightEnum.YELLOW_DOWN: 2,
        TrafficLightEnum.RED_UP: 3,
        TrafficLightEnum.RED_DOWN: 4,
    }

    for reading in readings:
        index = traffic_light_indexes[reading.traffic_light_status]
        data[index] += 1

    return data

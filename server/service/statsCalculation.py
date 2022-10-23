from datetime import date
from models import Reading, TrafficLightEnum


def get_stats_data(
    data_needed,
    readings: Reading,
    current_year,
    current_month,
    is_from_last_twelve_months=False,
):
    if data_needed == "trafficLightStatus":
        data = [0, 0, 0, 0, 0]
    else:
        data = [[], [], [], [], [], [], [], [], [], [], [], []]

    if data_needed == "trafficLightStatus":
        # do traffic light status stuff here
        data = get_traffic_light(readings, data)

    else:
        # month_index is used for indexing purpose when is_from_last_twelve_months is True
        month_index = 0
        for reading in readings:
            date_unix_ts = reading.dateTimeTaken
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
                        item_year, item_month, current_year, current_month
                    )
                if data_needed == "bpSystolic":
                    data[item_month - 1].append(reading.bpSystolic)
                elif data_needed == "bpDiastolic":
                    data[item_month - 1].append(reading.bpDiastolic)
                elif data_needed == "heartRateBPM":
                    data[item_month - 1].append(reading.heartRateBPM)
                elif data_needed == "bpSystolicLastTwelveMonths":
                    data[month_index].append(reading.bpSystolic)
                elif data_needed == "bpDiastolicLastTwelveMonths":
                    data[month_index].append(reading.bpDiastolic)
                elif data_needed == "heartRateBPMLastTwelveMonths":
                    data[month_index].append(reading.heartRateBPM)
    return data


# This function is used to get month index when we are retrieving the data dated from the last twelve months
def get_month_index(item_year, item_month, current_year, current_month):
    if current_year == item_year:
        return 12 - (current_month - item_month) - 1
    return item_month - current_month - 1


def get_traffic_light(readings, data):

    traffic_light_indexes = {
        TrafficLightEnum.GREEN: 0,
        TrafficLightEnum.YELLOW_UP: 1,
        TrafficLightEnum.YELLOW_DOWN: 2,
        TrafficLightEnum.RED_UP: 3,
        TrafficLightEnum.RED_DOWN: 4,
    }

    for reading in readings:
        index = traffic_light_indexes[reading.trafficLightStatus]
        data[index] += 1

    return data

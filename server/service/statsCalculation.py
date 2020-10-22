from datetime import date
from models import Reading, TrafficLightEnum


def get_stats_data(data_needed, readings: Reading):
    if data_needed == "trafficLightStatus":
        data = [0, 0, 0, 0, 0]
    else:
        data = [[], [], [], [], [], [], [], [], [], [], [], []]

    if data_needed == "trafficLightStatus":
        # do traffic light status stuff here
        data = get_traffic_light(readings, data)

    else:
        for reading in readings:
            date_unix_ts = reading.dateTimeTaken
            date_object = date.fromtimestamp(date_unix_ts)
            item_month = date_object.month
            item_year = date_object.year
            current_year = date.today().year
            if current_year == item_year:
                if data_needed == "bpSystolic":
                    data[item_month - 1].append(reading.bpSystolic)
                elif data_needed == "bpDiastolic":
                    data[item_month - 1].append(reading.bpDiastolic)
                elif data_needed == "heartRateBPM":
                    data[item_month - 1].append(reading.heartRateBPM)
    return data


def get_traffic_light(readings, data):
    green_index = 0
    yellow_up_index = 1
    yellow_down_index = 2
    red_up_index = 3
    red_down_index = 4

    for reading in readings:
        if reading.trafficLightStatus == TrafficLightEnum.YELLOW_UP:
            data[yellow_up_index] += 1
        if reading.trafficLightStatus == TrafficLightEnum.YELLOW_DOWN:
            data[yellow_down_index] += 1
        if reading.trafficLightStatus == TrafficLightEnum.RED_UP:
            data[red_up_index] += 1
        if reading.trafficLightStatus == TrafficLightEnum.RED_DOWN:
            data[red_down_index] += 1
        if reading.trafficLightStatus == TrafficLightEnum.GREEN:
            data[green_index] += 1

    return data

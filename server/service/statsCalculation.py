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
   
    traffic_light_indexes = {TrafficLightEnum.GREEN:0, 
                            TrafficLightEnum.YELLOW_UP:1,
                            TrafficLightEnum.YELLOW_DOWN:2,
                            TrafficLightEnum.RED_UP:3,
                            TrafficLightEnum.RED_DOWN:4 
                            }
    
    for reading in readings: 
        index = traffic_light_indexes[reading.trafficLightStatus]
        data[index] += 1
    
    return data

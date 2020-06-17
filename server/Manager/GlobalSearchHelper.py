from Manager.ReadingManagerNew import ReadingManager

readingManager = ReadingManager()

from Manager.ReferralManager import ReferralManager

referralManager = ReferralManager()


def to_global_search_patient(patient):
    global_search_patient = {
        "patientName": patient["patientName"],
        "patientId": patient["patientId"],
        "villageNumber": patient["villageNumber"],
        "readings": patient["readings"],
        "state": patient["state"],
    }

    if global_search_patient["readings"]:
        readings_arr = []
        for reading in global_search_patient["readings"]:
            # build the reading json to add to array
            reading_json = {
                "dateReferred": None,
            }
            reading_data = readingManager.read("readingId", reading)
            reading_json["dateTimeTaken"] = reading_data["dateTimeTaken"]
            reading_json["trafficLightStatus"] = reading_data["trafficLightStatus"]

            # add referral if exists in reading
            if reading_data["referral"]:
                top_ref = referralManager.read("id", reading_data["referral"])
                reading_json["dateReferred"] = top_ref["dateReferred"]

            # add reading dateReferred data to array
            readings_arr.append(reading_json)

        # add reading key to global_search_patient key
        global_search_patient["readings"] = readings_arr

    return global_search_patient

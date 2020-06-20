from datetime import datetime
from Manager.Manager import Manager
from Manager.PatientManagerNew import PatientManager  # patient data
from Manager.ReadingManagerNew import ReadingManager  # reading data
from Manager.ReferralManager import ReferralManager  # referral data
import json

patientManager = PatientManager()
referralManager = ReferralManager()
readingManager = ReadingManager()


# TO DO: NEED TO ADD ERROR CHECKING
# add init
class StatsManager:
    def get_traffic_light(self, item, data):
        yellow_up_index = 1
        yellow_down_index = 2
        red_up_index = 3
        red_down_index = 4
        green_index = 0

        if item["trafficLightStatus"] == "YELLOW_UP":
            data[yellow_up_index] += 1
        if item["trafficLightStatus"] == "YELLOW_DOWN":
            data[yellow_down_index] += 1
        if item["trafficLightStatus"] == "RED_UP":
            data[red_up_index] += 1
        if item["trafficLightStatus"] == "RED_DOWN":
            data[red_down_index] += 1
        if item["trafficLightStatus"] == "GREEN":
            data[green_index] += 1

    """ 
        Description: can get either the total number of readings, or referrals, or assessments per month:
        Can also get number of traffic lights in the last month
            Parameters: 
                Table: which table to look through 
                category: e.g readings, referrals
                dateLabel: how date is recorded in that category e.g dateTime vs dateReferred
        """

    def get_data(self, table, dateLabel, category):
        if category != "trafficLight":
            data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        else:
            data = [0, 0, 0, 0, 0]

        today = datetime.today()
        month_needed_for_for_traffic_light = today.month - 1
        counter = 0
        for item in table:
            date_string_ts = item[dateLabel]
            date_string = datetime.utcfromtimestamp(date_string_ts).strftime("%Y-%m-%d")
            # make sure to add error checking in here
            date_object = datetime.strptime(date_string[5:7], "%m")
            month = date_object.month
            if category == "reading" or category == "referral":
                data[month - 1] += 1
            elif category == "assessment":  # counting number of assessments done
                if item["followUpId"] is not None:
                    data[month - 1] += 1
            elif (
                category == "trafficLight"
                and month == month_needed_for_for_traffic_light
            ):
                # get traffic light data
                self.get_traffic_light(item, data)

        return data

    """ 
        Description: can get either the total number of pregnant patients that were referred,
        total number of pregnant women that were referred and followed up, total number of women referred,
        or total number of women assessed
            Parameters: 
                category: referred vs assesed           
    """

    def get_unique_counts(self, category):
        data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        collected = []
        referrals = referralManager.read_all()
        for item in referrals:
            date_string_ts = item["dateReferred"]
            date_string = datetime.utcfromtimestamp(date_string_ts).strftime("%Y-%m-%d")
            # make sure to add error checking in here
            date_object = datetime.strptime(date_string[5:7], "%m")
            month = date_object.month
            patient_id = item["patientId"]
            patient = patientManager.read("patientId", patient_id)

            # checking if referral was for a pregnant patient
            if category == "pregReferrals" and patient not in collected:
                if patient["isPregnant"] == 1:
                    data[month - 1] += 1
                    collected.append(patient)

            # checking how many pregnant women were assessed
            if category == "pregAssessment":
                if (
                    item["followUpId"] is not None
                    and patient["isPregnant"] == 1
                    and patient not in collected
                ):
                    data[month - 1] += 1
                    collected.append(patient)

            # checking how many women were referred
            if category == "womenReferred" and patient not in collected:
                if patient["patientSex"] == "FEMALE":
                    data[month - 1] += 1
                    collected.append(patient)

            # checking referrals for women that were assessed
            if category == "womenAssessed":
                if (
                    item["followUpId"] is not None
                    and patient["patientSex"] == "FEMALE"
                    and patient not in collected
                ):
                    data[month - 1] += 1
                    collected.append(patient)

            # checking unique people
            if category == "uniquePeopleAssessed":
                if item["followUpId"] is not None and patient not in collected:
                    data[month - 1] += 1
                    collected.append(patient)
        return data

    """ 
        Description: puts a json object together with the following:
            total number of readings per month
            total number of referrals per month
            total number of assessments done (patients that were followed up) per month
            total number of referrals made for pregnant patients per month
            total number of referrals made for pregnant patients that were followed up per month
            total number of referrals made for women
            total number of assessments made for women
            total traffic light numbers for the last month
            each quantity is of an array, each index in the array refers to that index-1 month
    """

    def put_data_together(self):
        print("putting data together")
        readings = readingManager.read_all()
        referrals = referralManager.read_all()
        data_to_return = {}

        # getting readings per month
        readings_per_month = self.get_data(readings, "dateTimeTaken", "reading")
        data_to_return["readingsPerMonth"] = readings_per_month

        # getting number of referrals per month
        referrals_per_month = self.get_data(referrals, "dateReferred", "referral")
        data_to_return["referralsPerMonth"] = referrals_per_month

        # getting number of assessments per month
        assessments_per_month = self.get_data(referrals, "dateReferred", "assessment")
        data_to_return["assessmentsPerMonth"] = assessments_per_month

        # getting number of pregnant women that were referred
        pregnant_referrals_per_month = self.get_unique_counts("pregReferrals")
        data_to_return["pregnantWomenReferredPerMonth"] = pregnant_referrals_per_month

        # getting number of number pregnant women assessed
        pregnant_assessments_per_month = self.get_unique_counts("pregAssessment")
        data_to_return["pregnantWomenAssessedPerMonth"] = pregnant_assessments_per_month

        # getting number of women referred per month
        women_referrals_per_month = self.get_unique_counts("womenReferred")
        data_to_return["womenReferredPerMonth"] = women_referrals_per_month

        # getting number of women assessed per month
        women_assessments_per_month = self.get_unique_counts("womenAssessed")
        data_to_return["womenAssessedPerMonth"] = women_assessments_per_month

        # getting unique number of people assessed per month
        unique_people_assessed_per_month = self.get_unique_counts(
            "uniquePeopleAssessed"
        )
        data_to_return["uniquePeopleAssesedPerMonth"] = unique_people_assessed_per_month

        # getting traffic light data for the last month
        # sorry to the person who has to read the magic numbers below
        traffic_light_data_last_month = self.get_data(
            readings, "dateTimeTaken", "trafficLight"
        )
        data_to_return["trafficLightStatusLastMonth"] = {}
        data_to_return["trafficLightStatusLastMonth"][
            "green"
        ] = traffic_light_data_last_month[0]
        data_to_return["trafficLightStatusLastMonth"][
            "yellowUp"
        ] = traffic_light_data_last_month[1]
        data_to_return["trafficLightStatusLastMonth"][
            "yellowDown"
        ] = traffic_light_data_last_month[2]
        data_to_return["trafficLightStatusLastMonth"][
            "redUp"
        ] = traffic_light_data_last_month[3]
        data_to_return["trafficLightStatusLastMonth"][
            "redDown"
        ] = traffic_light_data_last_month[4]

        # returning stats in json format
        return json.loads(json.dumps(data_to_return))

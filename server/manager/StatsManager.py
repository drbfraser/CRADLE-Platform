from datetime import datetime, date
from manager.Manager import Manager
from manager.PatientManagerNew import PatientManager  # patient data
from manager.ReadingManagerNew import ReadingManager  # reading data
from manager.ReferralManager import ReferralManager  # referral data
from manager.FollowUpManager import FollowUpManager  # assessment data
import json
from models import Reading, ReadingSchema, TrafficLightEnum

patientManager = PatientManager()
referralManager = ReferralManager()
readingManager = ReadingManager()
followupManager = FollowUpManager()


# TODO: Add error handling
# TODO: Stats are pretty outdated, need to clean up and refactor once we have new client requirements
# add init
class StatsManager:

    """
    Description: Helper function that converts from unixtimestamp to date objects and returns necessary date components
        Parameters:
            record: the row in the db that is being converted
            dateLabel: how date is recorded in that table e.g dateTime vs dateReferred
    """

    def calculate_dates_helper(self, record, dateLabel):
        date_unix_ts = record[dateLabel]
        date_obj = date.fromtimestamp(date_unix_ts)
        record_month = date_obj.month
        record_year = date_obj.year
        current_year = date.today().year
        return {
            "record_month": record_month,
            "record_year": record_year,
            "current_year": current_year,
        }

    """ 
        Description: Helper function that indentifies traffic light status and increments it's corresponding counter
            Parameters: 
                record: the row in the db that is being checked
                data: the array that holds the traffic light counters
    """

    def calculate_traffic_light_helper(self, record, data):
        traffic_light_indexes = {
            TrafficLightEnum.GREEN.value: 0,
            TrafficLightEnum.YELLOW_UP.value: 1,
            TrafficLightEnum.YELLOW_DOWN.value: 2,
            TrafficLightEnum.RED_UP.value: 3,
            TrafficLightEnum.RED_DOWN.value: 4,
        }

        index = traffic_light_indexes[record["trafficLightStatus"]]
        data[index] += 1

    """ 
        Description: calculates total number of readings, or referrals, or assessments per month for a given year (e.g 2020)
            Parameters: 
                Table: which table to look through e.g reading table
                dateLabel: how date is recorded in that table e.g dateTime vs dateReferred
    """

    def calculate_yearly_data(self, table, dateLabel):
        data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        if table:
            for record in table:
                dates = self.calculate_dates_helper(record, dateLabel)
                if dates["record_year"] == dates["current_year"]:
                    data[dates["record_month"] - 1] += 1
        return data

    """ 
        Description: calculates total number of each type of traffic light for the last month
            Parameters: 
                Table: which table to look through e.g reading table
    """

    def calculate_month_traffic_light_data(self, table):
        data = [0, 0, 0, 0, 0]
        month_data_needed_for = date.today().month - 1
        if table:
            for record in table:
                dates = self.calculate_dates_helper(record, "dateTimeTaken")
                if dates["record_year"] == dates["current_year"]:
                    month_data_needed_for = 1
                    if dates["record_month"] == month_data_needed_for:

                        self.calculate_traffic_light_helper(record, data)
        return data

    """ 
        Description: calculates unique number of unique women referrals, and unique pregnant women referrals
            Parameters: 
                Table: which table to look through e.g reading table          
    """

    def calculate_unique_women_referrals(self, table):
        # so that we don't have to loop through table 2 times
        unique_pregnant_women_referrals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        unique_women_referrals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        collected_pregnant_patients = []
        collected_women_patients = []
        if table:
            for record in table:
                dates = self.calculate_dates_helper(record, "dateReferred")
                if dates["record_year"] != dates["current_year"]:
                    continue
                patient = patientManager.read("patientId", record["patientId"])

                # checking for referrals for women (unique)
                if (
                    patient["patientSex"] == "FEMALE"
                    and patient not in collected_women_patients
                ):
                    unique_women_referrals[dates["record_month"] - 1] += 1
                    collected_women_patients.append(patient)

                # checking for referrals for pregnant women (unique)
                if (
                    patient["isPregnant"] == 1
                    and patient not in collected_pregnant_patients
                ):
                    unique_pregnant_women_referrals[dates["record_month"] - 1] += 1
                    collected_pregnant_patients.append(patient)

        return {
            "uniqueWomenReferred": unique_women_referrals,
            "uniquePregnantWomenReferred": unique_pregnant_women_referrals,
        }

    """ 
        Description: calculates unique number of unique women assessments, unique pregnant women assessments, and unique patient assessments
        Parameters: 
                Table: which table to look through e.g assessment table          
    """

    def calculate_unique_patient_assessment_count(self, table):
        # so that we don't have to loop through table 3 times
        unique_women_assessed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        unique_pregnant_women_assessed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        unique_people_assessed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        collected_women_assessed = []
        collected_pregnant_women_assessed = []
        collected_patients_assessed = []
        if table:
            for record in table:
                reading = readingManager.read("readingId", record["reading"])
                dates = self.calculate_dates_helper(record, "dateAssessed")
                if dates["record_year"] != dates["current_year"]:
                    continue
                patient = patientManager.read("patientId", reading["patientId"])
                # women that were assessed (unique)
                if (
                    patient["patientSex"] == "FEMALE"
                    and patient not in collected_women_assessed
                ):
                    unique_women_assessed[dates["record_month"] - 1] += 1
                    collected_women_assessed.append(patient)

                # pregnant women that were assessed (unique)
                if (
                    patient["isPregnant"] == 1
                    and patient not in collected_pregnant_women_assessed
                ):
                    unique_pregnant_women_assessed[dates["record_month"] - 1] += 1
                    collected_pregnant_women_assessed.append(patient)

                # checking people that were assessed (unique)
                if patient not in collected_patients_assessed:
                    unique_people_assessed[dates["record_month"] - 1] += 1
                    collected_patients_assessed.append(patient)

        return {
            "uniqueWomenAssessed": unique_women_assessed,
            "uniquePregnantWomenAssesed": unique_pregnant_women_assessed,
            "uniquePeopleAssessed": unique_people_assessed,
        }

    def put_data_together(self):
        readings = readingManager.read_all()
        referrals = referralManager.read_all()
        assessments = followupManager.read_all()
        data_to_return = {}

        # getting readings per month
        readings_per_month = self.calculate_yearly_data(readings, "dateTimeTaken")
        data_to_return["readingsPerMonth"] = readings_per_month

        # getting number of referrals per month
        referrals_per_month = self.calculate_yearly_data(referrals, "dateReferred")
        data_to_return["referralsPerMonth"] = referrals_per_month

        # getting number of assessments per month
        assessments_per_month = self.calculate_yearly_data(assessments, "dateAssessed")
        data_to_return["assessmentsPerMonth"] = assessments_per_month

        # getting number of unique women and pregnant women referrals per month
        women_referrals_per_month = self.calculate_unique_women_referrals(referrals)
        data_to_return["pregnantWomenReferredPerMonth"] = women_referrals_per_month[
            "uniquePregnantWomenReferred"
        ]
        data_to_return["womenReferredPerMonth"] = women_referrals_per_month[
            "uniqueWomenReferred"
        ]

        # getting unique patient (women, pregnant women, all) assessments per month
        unique_patient_assessments = self.calculate_unique_patient_assessment_count(
            assessments
        )
        data_to_return["uniquePeopleAssesedPerMonth"] = unique_patient_assessments[
            "uniquePeopleAssessed"
        ]
        data_to_return["womenAssessedPerMonth"] = unique_patient_assessments[
            "uniqueWomenAssessed"
        ]
        data_to_return["pregnantWomenAssessedPerMonth"] = unique_patient_assessments[
            "uniquePregnantWomenAssesed"
        ]

        # getting traffic light data for last month
        traffic_light_data_last_month = self.calculate_month_traffic_light_data(
            readings
        )
        data_to_return["trafficLightStatusLastMonth"] = {}
        lights = ["green", "yellowUp", "yellowDown", "redUp", "redDown"]
        index = 0
        for light in lights:
            data_to_return["trafficLightStatusLastMonth"][
                light
            ] = traffic_light_data_last_month[index]
            index += 1

        return json.loads(json.dumps(data_to_return))

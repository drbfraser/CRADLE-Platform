from datetime import datetime
from Manager.Manager import Manager
from Manager.PatientManagerNew import PatientManager #patient data
from Manager.ReadingManagerNew import ReadingManager #reading data
from Manager.ReferralManager import ReferralManager #referral data
import json

patientManager = PatientManager()
referralManager = ReferralManager()
readingManager = ReadingManager()

patients = patientManager.read_all()
referrals = referralManager.read_all()
readings = readingManager.read_all()


# TO DO: NEED TO ADD ERROR CHECKING
class StatsManager(Manager):
    def __init__(Self):
  
        """ 
        Description: can get either the total number of readings, or referrals, or assesments per month:
            Parameters: 
                category: e.g readings, referrals
                date: how date is recorded in that category e.g dateTime vs dateReferred
                needAssesmentCount: 0/1 if not needed or needed
        """
    def get_readings_referrals_or_assesments_month(Self, category, date, needAssesmentCount):
        data = [0,0,0,0,0,0,0,0,0,0,0,0]
        counter = 0
        for item in category:
            dateString = item[date]
            #make sure to add error checking in here
            dateObject = datetime.strptime(dateString[5:7] , '%m')
            month = dateObject.month
            if(needAssesmentCount == 0):
                data[month-1] += 1
            elif(needAssesmentCount == 1): #counting number of assesments done
                if(item['followUpId'] is not None):
                    data[month-1] += 1
            else:
                print("Invalid assesment option")
                #programmer error, fix function call
        return data

    """ 
        Description: can get either the total number of pregnant patients that were referred,
        or total number of pregnant women that were referred and followed up
            Parameters: 
                Category: referred vs assesed           
    """

    def get_data_for_pregnant_patients(Self, category):
        data = [0,0,0,0,0,0,0,0,0,0,0,0]
        counter = 0
        for item in referrals:
            dateString = item['dateReferred']
            # make sure to add error checking in here
            dateObject = datetime.strptime(dateString[5:7] , '%m')
            month = dateObject.month
            patient_id = item['patientId']
            patient = patientManager.read("patientId", patient_id)
            
            # checking if referral was for a pregnant patient
            if(category == "pregReferrals"):
                if(patient['isPregnant']==1): 
                    data[month-1] += 1

            # checking referrals for pregnant patients that had a followup
            if(category == "pregAsessments"):
                if(item['followUpId'] is not None and patient['isPregnant']==1):
                    data[month-1] += 1

        #print("the data is:")
        #print(data)
        return data

    """ 
        Description: puts a json object together with the following:
            total number of readings per month
            total number of referrals per month
            total number of assesments done (patients that were followed up) per month
            total number of referrals made for pregnant patients per month
            total number of referrals made for pregnant patients that were followed up per month
            each quantity is of an array, each index in the array refers to that index-1 month
    """
    def put_data_together(Self):
        print("putting data together")

        # getting readings per month
        readings_per_month = Self.get_readings_referrals_or_assesments_month(readings, 'dateTimeTaken', 0)

        # getting number of referrals per month
        referrals_per_month = Self.get_readings_referrals_or_assesments_month(referrals, 'dateReferred', 0)

        # getting number of assesments per month
        assesments_per_month = Self.get_readings_referrals_or_assesments_month(referrals, 'dateReferred', 1)
        
        # getting number of referrals that were made for pregnant women
        pregnant_referrals_per_month = Self.get_data_for_pregnant_patients('pregReferrals')
        
        # getting number of referrals that were made for women who were pregnant who got an assesment (follow up)
        pregnant_assesments_per_month = Self.get_data_for_pregnant_patients('pregAsessments')


        # building json
        build_json = { 'readingsPerMonth': readings_per_month, 
                       'referralsPerMonth': referrals_per_month, 
                       'assesmentsPerMonth': assesments_per_month,
                       'referralsPregnantWomenPerMonth': pregnant_referrals_per_month,
                       'assesmentsPregnantWomenPerMonth': pregnant_assesments_per_month }
        json_data = json.dumps(build_json)
    
        #json.loads(json_data
        return json_data

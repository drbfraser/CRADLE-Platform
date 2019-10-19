from datetime import datetime
from Manager.Manager import Manager
from Manager.PatientManagerNew import PatientManager #patient data
from Manager.ReadingManagerNew import ReadingManager #reading data
from Manager.ReferralManager import ReferralManager #referral data
import json

patientManager = PatientManager()
referralManager = ReferralManager()
readingManager = ReadingManager()


# TO DO: NEED TO ADD ERROR CHECKING
class StatsManager(Manager):
    def __init__(self):
  
        """ 
        Description: can get either the total number of readings, or referrals, or assessments per month:
            Parameters: 
                category: e.g readings, referrals
                date: how date is recorded in that category e.g dateTime vs dateReferred
                needassessmentCount: 0/1 if not needed or needed
        """
    def get_readings_referrals_or_assessments_month(self, category, date, need_assessment_count):
        data = [0,0,0,0,0,0,0,0,0,0,0,0]
        counter = 0
        for item in category:
            date_string = item[date]
            #make sure to add error checking in here
            date_object = datetime.strptime(date_string[5:7] , '%m')
            month = date_object.month
            if(need_assessment_count == 0):
                data[month-1] += 1
            elif(need_assessment_count == 1): #counting number of assessments done
                if(item['followUpId'] is not None):
                    data[month-1] += 1
            else:
                print("invalid assessment optionl only 0 or 1 are valid options.")
                #programmer error, fix function call
        return data

    """ 
        Description: can get either the total number of pregnant patients that were referred,
        or total number of pregnant women that were referred and followed up
            Parameters: 
                category: referred vs assesed           
    """

    def get_data_for_pregnant_patients(self, category):
        data = [0,0,0,0,0,0,0,0,0,0,0,0]
        referrals = referralManager.read_all()
        for item in referrals:
            date_string = item['dateReferred']
            # make sure to add error checking in here
            date_object = datetime.strptime(date_string[5:7] , '%m')
            month = date_object.month
            patient_id = item['patientId']
            patient = patientManager.read("patientId", patient_id)
            
            # checking if referral was for a pregnant patient
            if(category == "pregReferrals"):
                if(patient['isPregnant']==1): 
                    data[month-1] += 1

            # checking referrals for pregnant patients that had a followup
            if(category == "pregAssessment"):
                if(item['followUpId'] is not None and patient['isPregnant']==1):
                    data[month-1] += 1

        #print("the data is:")
        #print(data)
        return data

    """ 
        Description: puts a json object together with the following:
            total number of readings per month
            total number of referrals per month
            total number of assessments done (patients that were followed up) per month
            total number of referrals made for pregnant patients per month
            total number of referrals made for pregnant patients that were followed up per month
            each quantity is of an array, each index in the array refers to that index-1 month
    """
    def put_data_together(self):
        print("putting data together")
        readings = readingManager.read_all()
        referrals = referralManager.read_all()
        
        # getting readings per month
        readings_per_month = self.get_readings_referrals_or_assessments_month(readings, 'dateTimeTaken', 0)

        # getting number of referrals per month
        referrals_per_month = self.get_readings_referrals_or_assessments_month(referrals, 'dateReferred', 0)

        # getting number of assessments per month
        assessments_per_month = self.get_readings_referrals_or_assessments_month(referrals, 'dateReferred', 1)
        
        # getting number of referrals that were made for pregnant women
        pregnant_referrals_per_month = self.get_data_for_pregnant_patients('pregReferrals')
        
        # getting number of referrals that were made for women who were pregnant who got an assessment (follow up)
        pregnant_assessments_per_month = self.get_data_for_pregnant_patients('pregAssessment')


        # building json
        build_json = { 'readingsPerMonth': readings_per_month, 
                       'referralsPerMonth': referrals_per_month, 
                       'assessmentsPerMonth': assessments_per_month,
                       'referralsPregnantWomenPerMonth': pregnant_referrals_per_month,
                       'assessmentsPregnantWomenPerMonth': pregnant_assessments_per_month }
    
        # returning stats in json format
        return json.loads(json.dumps(build_json))

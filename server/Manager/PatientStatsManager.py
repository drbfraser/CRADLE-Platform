from flask_restful import abort
from datetime import datetime
from Manager.Manager import Manager
from Manager.ReadingManagerNew import ReadingManager #reading data
from Manager import patientManager
import json
readingManager = ReadingManager()

# TO DO: Add error checking
# TO DO: Update init
# TO DO: Condense ret object
class PatientStatsManager():
    """
    Description: Returns a 2D list containing requested data 
        ex. bpSystolic readings, seperated by month
    Parameters:
        dataNeeded: The data that needs to be collected
        ex. bpSystolic, bpDiastolic, heartRate, trafficLightStatus
    """
    def get_data(self, dataNeeded, table, patient_id):
        data = [[],[],[],[],[],[],[],[],[],[],[],[]]
        #print(data)

        for item in table:
                if(patient_id == item['patientId']):
                    date_string = item['dateTimeTaken']
                    #make sure to add error checking in here
                    date_object = datetime.strptime(date_string[5:7] , '%m')
                    month = date_object.month
                    print(month)
                    data[month-1].append(item[dataNeeded])
        
        return data

    def clean_up_data(self,data_to_clean):
        for item in data_to_clean:
            if len(item) == 0:
                item.append("No readings for this month")
    
    """
    Description: Puts together a json object containing stats about the following:
        - bpSystolic
        - bpDiastolic
        - heartRate
        - trafficLightStatus
    """
    def put_data_together(self, patient_id):

        patient = patientManager.read("patientId", patient_id)
        if patient is None:
            abort(404, message="Patient {} doesn't exist.".format(patient_id))

        readings = readingManager.read_all()
        
        # getting all bpSystolic readings for each month
        bp_systolic = self.get_data('bpSystolic', readings, patient_id)
        self.clean_up_data(bp_systolic)

        # getting all bpDiastolic readings for each month
        bp_diastolic = self.get_data('bpDiastolic', readings, patient_id)
        self.clean_up_data(bp_diastolic)

        # getting all heart rate readings for each month
        heart_rate = self.get_data('heartRateBPM', readings, patient_id)
        self.clean_up_data(heart_rate)

        # getting all traffic light statuses for each month
        traffic_light_statuses = self.get_data('trafficLightStatus', readings, patient_id)
        self.clean_up_data(traffic_light_statuses)


        # putting data into one object now
        data = {'bpSystolicReadings': bp_systolic,
          'bpDiastolicReadings': bp_diastolic,
          'heartRateReadings': heart_rate,
          'trafficLightStatuses': traffic_light_statuses      
        }

        #return json.loads(json.dumps(build_json))
        return data
        




        
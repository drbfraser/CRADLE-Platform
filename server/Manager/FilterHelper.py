

# need to finish filtering for CHO 
# todo: should probably refactor all of this into one function b/c much code reuse

def filtered_list_hcw(patients, referrals, facility):
    print("Filtering list...")
    patient_id_list = []
    patient_filtered_list = []

    # need to look up userId in user table to find what health facility person is from
    # getting patient Ids for all patients referred to the clinic in question
    for r in referrals:
        # replcae this with token facility name
        if r['referralHealthFacilityName'] == "H1233":  
            if(r['patientId'] not in patient_id_list):
                patient_id_list.append(r['patientId'])
        
    # getting all patient rows based on patientIds collected in last table
    for p in patients:
        if p['patientId'] in patient_id_list:
            patient_filtered_list.append(p)   

    # now we have a filtered list
    return patient_filtered_list


def filtered_list_vht(patients, readings, vhtId):
    print("Filtering list...")
    patient_id_list = []
    patient_filtered_list = []

    # getting patient Ids for all patients this VHT has taken readings for
    for r in readings:
        # replcae this with token facility name
        if r['userId'] == vhtId:  
            if(r['patientId'] not in patient_id_list):
                patient_id_list.append(r['patientId'])
        
    # getting all patient rows based on patientIds collected in last table
    for p in patients:
        if p['patientId'] in patient_id_list:
            patient_filtered_list.append(p)   

    # now we have a filtered list
    return patient_filtered_list


def filtered_list_cho(patients, readings, vhtList):
    print("Filtering list...")
    patient_id_list = []
    patient_filtered_list = []

    for i in vhtList:
        patient_filtered_list.extend(filtered_list_vht(patients, readings, i))

    return patient_filtered_list









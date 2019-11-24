

# need to finish filtering for CHO 
# todo: should probably refactor all of this into one function b/c there's some code reuse

def filtered_list_hcw(patients, referrals, users, userId):
    print("Filtering list...")
    patient_id_list = []
    patient_filtered_list = []

    # need to look up userId in user table to find what health facility person is from
    # may need to add error check here depending on if front end is okay with catching them
    facilityName = ""
    for u in users:
        if u['id'] == userId:
            facilityName = u['healthFacilityName']
    

    # getting patient Ids for all patients referred to the clinic in question
    for r in referrals:
        if r['referralHealthFacilityName'] == facilityName:  
            if(r['patientId'] not in patient_id_list):
                patient_id_list.append(r['patientId'])
        
    # getting all patient rows based on patientIds collected in last table
    for p in patients:
        if p['patientId'] in patient_id_list:
            patient_filtered_list.append(p)   

    # now we have a filtered list
    return patient_filtered_list


def filtered_list_vht(patients, readings, userId):
    print("Filtering list...")
    patient_id_list = []
    patient_filtered_list = []

    # getting patient Ids for all patients this VHT has taken readings for
    for r in readings:
        if r['userId'] == userId:  
            if(r['patientId'] not in patient_id_list):
                patient_id_list.append(r['patientId'])
        
    # getting all patient rows based on patientIds collected in last table
    for p in patients:
        if p['patientId'] in patient_id_list:
            patient_filtered_list.append(p)   

    # now we have a filtered list
    return patient_filtered_list


def filtered_list_cho(patients, readings, vhtList, userId):
    print("Filtering list...")
    patient_id_list = []
    patient_filtered_list = []

    # adding cho user id to VHT list because we need the patients CHO sees as well 
    vhtList.append(userId)

    for v in vhtList:
        patient_filtered_list.extend(filtered_list_vht(patients, readings, v))

    return patient_filtered_list









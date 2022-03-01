from flask_restful import Api


def init_routes(api: Api):
    """
    Configures all API routes for the resources in this module's sub-modules.

    :param api: A ``flask_restful`` ``Api`` object to configure
    """
    __init_patients_resources(api)
    __init_readings_resources(api)
    __init_referral_resources(api)
    __init_assessment_resources(api)
    __init_facilities_resources(api)
    __init_sync_resources(api)
    __init_patient_associations_resources(api)
    __init_pregnancy_resources(api)
    __init_medical_record_resources(api)


def __init_patients_resources(api: Api):
    import api.resources.patients as r

    api.add_resource(r.Root, "/api/patients", endpoint="patient_root")
    api.add_resource(r.SinglePatient, "/api/patients/<string:patient_id>")
    api.add_resource(r.PatientInfo, "/api/patients/<string:patient_id>/info")
    api.add_resource(r.PatientStats, "/api/patients/<string:patient_id>/stats")
    api.add_resource(r.PatientReadings, "/api/patients/<string:patient_id>/readings")
    api.add_resource(
        r.PatientMostRecentReading,
        "/api/patients/<string:patient_id>/most_recent_reading",
    )
    api.add_resource(r.PatientReferrals, "/api/patients/<string:patient_id>/referrals")
    api.add_resource(
        r.PatientPregnancySummary, "/api/patients/<string:patient_id>/pregnancy_summary"
    )
    api.add_resource(
        r.PatientMedicalHistory, "/api/patients/<string:patient_id>/medical_history"
    )
    api.add_resource(r.PatientTimeline, "/api/patients/<string:patient_id>/timeline")


def __init_readings_resources(api: Api):
    import api.resources.readings as r

    api.add_resource(r.Root, "/api/readings", endpoint="reading_root")
    api.add_resource(r.SingleReading, "/api/readings/<string:reading_id>")


def __init_referral_resources(api: Api):
    import api.resources.referrals as r

    api.add_resource(r.Root, "/api/referrals", endpoint="referral_root")
    api.add_resource(r.SingleReferral, "/api/referrals/<int:referral_id>")
    api.add_resource(r.AssessReferral, "/api/referrals/assess/<int:referral_id>")


def __init_assessment_resources(api: Api):
    import api.resources.assessments as r

    api.add_resource(r.Root, "/api/assessments", endpoint="assessment_root")
    api.add_resource(r.SingleAssessment, "/api/assessments/<int:assessment_id>")


def __init_facilities_resources(api: Api):
    import api.resources.facilities as r

    api.add_resource(r.Root, "/api/facilities", endpoint="facility_root")


def __init_sync_resources(api: Api):
    import api.resources.sync as r

    api.add_resource(r.SyncPatients, "/api/sync/patients")
    api.add_resource(r.SyncReadings, "/api/sync/readings")


def __init_patient_associations_resources(api: Api):
    import api.resources.patientAssociations as r

    api.add_resource(
        r.Root, "/api/patientAssociations", endpoint="patientAssociations_root"
    )


def __init_pregnancy_resources(api: Api):
    import api.resources.pregnancies as p

    api.add_resource(
        p.Root,
        "/api/patients/<string:patient_id>/pregnancies",
        endpoint="pregnancy_root",
    )
    api.add_resource(p.SinglePregnancy, "/api/pregnancies/<string:pregnancy_id>")


def __init_medical_record_resources(api: Api):
    import api.resources.medicalRecords as m

    api.add_resource(
        m.Root,
        "/api/patients/<string:patient_id>/medical_records",
        endpoint="medical_record_root",
    )
    api.add_resource(
        m.SingleMedicalRecord, "/api/medical_records/<string:pregnancy_id>"
    )

from flask_restful import Api


def init_routes(api: Api):
    """
    Configures all API routes for the resources in this module's sub-modules.

    :param api: A ``flask_restful`` ``Api`` object to configure
    """
    __init_patients_resources(api)
    __init_readings_resources(api)
    __init_referral_resources(api)


def __init_patients_resources(api: Api):
    import api.resources.patients as r

    api.add_resource(r.Root, "/api/patients", endpoint="patient_root")
    api.add_resource(r.SinglePatient, "/api/patients/<string:patient_id>")
    api.add_resource(r.PatientInfo, "/api/patients/<string:patient_id>/info")
    api.add_resource(r.PatientStats, "/api/patients/<string:patient_id>/stats")
    api.add_resource(r.PatientReadings, "/api/patients/<string:patient_id>/readings")


def __init_readings_resources(api: Api):
    import api.resources.readings as r

    api.add_resource(r.Root, "/api/readings", endpoint="reading_root")
    api.add_resource(r.SingleReading, "/api/readings/<string:reading_id>")


def __init_referral_resources(api: Api):
    import api.resources.referrals as r

    api.add_resource(r.Root, "/api/referrals", endpoint="referral_root")
    api.add_resource(r.SingleReferral, "/api/referrals/<int:id>")

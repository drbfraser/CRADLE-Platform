from service.workflow.datasourcing.data_catalogue import get_catalogue
from service.workflow.datasourcing.data_sourcing import (
    DatasourceVariable,
    resolve_variable,
    resolve_variables,
)


class TestPatientResolution:
    """System tests for patient data resolution"""

    def test_resolve_basic_patient_attributes(self, patient_factory):
        patient_factory.create(
            id="patient_001", name="Mary Grace", sex="FEMALE", zone="40"
        )

        context = {"patient_id": "patient_001"}
        catalogue = get_catalogue()

        name_var = DatasourceVariable.from_string("patient.name")
        sex_var = DatasourceVariable.from_string("patient.sex")
        zone_var = DatasourceVariable.from_string("patient.zone")

        result = resolve_variables(
            context=context,
            variables=[name_var, sex_var, zone_var],
            catalogue=catalogue,
        )

        assert result["patient.name"] == "Mary Grace"
        assert result["patient.sex"] == "FEMALE"
        assert result["patient.zone"] == "40"

    def test_resolve_patient_age_custom_attribute(self, patient_factory):
        patient_factory.create(
            id="patient_002", name="Senior Patient", date_of_birth="1950-01-01"
        )

        context = {"patient_id": "patient_002"}
        catalogue = get_catalogue()
        age_var = DatasourceVariable.from_string("patient.age")

        result = resolve_variable(
            context=context, variable=age_var, catalogue=catalogue
        )

        assert result is not None
        assert isinstance(result, int)
        assert result > 70

    def test_resolve_nonexistent_patient(self):
        context = {"patient_id": "nonexistent_patient"}
        catalogue = get_catalogue()

        name_var = DatasourceVariable.from_string("patient.name")

        result = resolve_variable(
            context=context, variable=name_var, catalogue=catalogue
        )

        assert result is None


class TestReadingResolution:
    """System tests for reading data resolution"""

    def test_resolve_reading_vitals(self, user_factory, patient_factory, reading_factory):
        user_factory.create(id=1, username="test_user")
        patient_factory.create(id="patient_003", name="BP Test Patient")
        reading_factory.create(
            id="reading_001",
            patient_id="patient_003",
            systolic_blood_pressure=145,
            diastolic_blood_pressure=92,
            heart_rate=78,
        )

        context = {"patient_id": "patient_003"}
        catalogue = get_catalogue()

        systolic_var = DatasourceVariable.from_string("reading.systolic_blood_pressure")
        diastolic_var = DatasourceVariable.from_string(
            "reading.diastolic_blood_pressure"
        )
        hr_var = DatasourceVariable.from_string("reading.heart_rate")

        result = resolve_variables(
            context=context,
            variables=[systolic_var, diastolic_var, hr_var],
            catalogue=catalogue,
        )

        assert result["reading.systolic_blood_pressure"] == 145
        assert result["reading.diastolic_blood_pressure"] == 92
        assert result["reading.heart_rate"] == 78

    def test_resolve_reading_without_patient_reading(self, patient_factory):
        patient_factory.create(id="patient_004", name="No Reading Patient")

        context = {"patient_id": "patient_004"}
        catalogue = get_catalogue()

        systolic_var = DatasourceVariable.from_string("reading.systolic_blood_pressure")

        result = resolve_variable(
            context=context, variable=systolic_var, catalogue=catalogue
        )

        assert result is None


class TestAssessmentResolution:
    """System tests for assessment data resolution"""

    def test_resolve_assessment_fields(self, user_factory, patient_factory, followup_factory):
        user_factory.create(id=1, username="test_user")
        patient_factory.create(id="patient_005", name="Assessment Patient")
        followup_factory.create(
            id="assessment_001",
            patient_id="patient_005",
            healthcare_worker_id=1,
            diagnosis="Hypertension",
            follow_up_needed=True,
            follow_up_instructions="Monitor blood pressure daily",
        )

        context = {"patient_id": "patient_005", "assessment_id": "assessment_001"}
        catalogue = get_catalogue()

        diagnosis_var = DatasourceVariable.from_string("assessment.diagnosis")
        followup_var = DatasourceVariable.from_string("assessment.follow_up_needed")

        result = resolve_variables(
            context=context,
            variables=[diagnosis_var, followup_var],
            catalogue=catalogue,
        )

        assert result["assessment.diagnosis"] == "Hypertension"
        assert result["assessment.follow_up_needed"] is True


class TestPregnancyResolution:
    """System tests for pregnancy data resolution"""

    def test_resolve_pregnancy_data(self, patient_factory, pregnancy_factory):
        patient_factory.create(
            id="patient_006", name="Pregnant Patient", is_pregnant=True
        )
        pregnancy_factory.create(
            id=1,
            patient_id="patient_006",
            start_date=1609459200,  # 2021-01-01
        )

        context = {"patient_id": "patient_006", "pregnancy_id": 1}
        catalogue = get_catalogue()

        start_date_var = DatasourceVariable.from_string("pregnancy.start_date")

        result = resolve_variable(
            context=context, variable=start_date_var, catalogue=catalogue
        )

        assert result == 1609459200


class TestMultiObjectResolution:
    """System tests for resolving multiple object types together"""

    def test_resolve_patient_and_reading_together(
        self, user_factory, patient_factory, reading_factory
    ):
        user_factory.create(id=1, username="test_user")
        patient_factory.create(
            id="patient_007", name="Multi Test", sex="FEMALE", is_pregnant=True
        )
        reading_factory.create(
            id="reading_002",
            patient_id="patient_007",
            systolic_blood_pressure=150,
            diastolic_blood_pressure=95,
        )

        context = {"patient_id": "patient_007"}
        catalogue = get_catalogue()

        variables = [
            DatasourceVariable.from_string("patient.name"),
            DatasourceVariable.from_string("patient.is_pregnant"),
            DatasourceVariable.from_string("reading.systolic_blood_pressure"),
            DatasourceVariable.from_string("reading.diastolic_blood_pressure"),
        ]

        result = resolve_variables(
            context=context, variables=variables, catalogue=catalogue
        )

        assert result["patient.name"] == "Multi Test"
        assert result["patient.is_pregnant"] is True
        assert result["reading.systolic_blood_pressure"] == 150
        assert result["reading.diastolic_blood_pressure"] == 95

    def test_resolve_with_missing_optional_object(self, patient_factory):
        patient_factory.create(id="patient_008", name="Partial Data")

        context = {"patient_id": "patient_008"}
        catalogue = get_catalogue()

        variables = [
            DatasourceVariable.from_string("patient.name"),
            DatasourceVariable.from_string("reading.systolic_blood_pressure"),
        ]

        result = resolve_variables(
            context=context, variables=variables, catalogue=catalogue
        )

        assert result["patient.name"] == "Partial Data"
        assert result["reading.systolic_blood_pressure"] is None

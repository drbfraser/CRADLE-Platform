from manager.Manager import Manager
from database.PatientRepo import PatientRepo
from database.HealthFacilityRepo import HealthFacilityRepo

patientManager = Manager(PatientRepo)
healthFacilityManager = Manager(HealthFacilityRepo)

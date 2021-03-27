from manager.Manager import Manager

from database.ReadingRepo import ReadingRepo
from database.PatientRepo import PatientRepo
from database.HealthFacilityRepo import HealthFacilityRepo

patientManager = Manager(PatientRepo)
readingManager = Manager(ReadingRepo)
healthFacilityManager = Manager(HealthFacilityRepo)

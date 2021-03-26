from manager.Manager import Manager

from database.ReferralRepo import ReferralRepo
from database.ReadingRepo import ReadingRepo
from database.PatientRepo import PatientRepo
from database.HealthFacilityRepo import HealthFacilityRepo

referralManager = Manager(ReferralRepo)
patientManager = Manager(PatientRepo)
readingManager = Manager(ReadingRepo)
healthFacilityManager = Manager(HealthFacilityRepo)

from manager.Manager import Manager

from database.ReferralRepo import ReferralRepo
from database.ReadingRepoNew import ReadingRepo
from database.PatientRepoNew import PatientRepo
from database.HealthFacilityRepoNew import HealthFacilityRepo

referralManager = Manager(ReferralRepo)
patientManager = Manager(PatientRepo)
readingManager = Manager(ReadingRepo)
healthFacilityManager = Manager(HealthFacilityRepo)

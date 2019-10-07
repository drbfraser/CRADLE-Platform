from Manager.Manager import Manager

from Database.ReferralRepo import ReferralRepo
from Database.ReadingRepoNew import ReadingRepo
from Database.PatientRepoNew import PatientRepo
from Database.HealthFacilityRepo import HealthFacilityRepo

referralManager = Manager(ReferralRepo)
patientManager = Manager(PatientRepo)
readingManager = Manager(ReadingRepo)
healthFacilityManager = Manager(HealthFacilityRepo)
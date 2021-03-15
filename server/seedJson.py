import random
import string
import uuid
import datetime
import numpy as np
from random import randrange
from datetime import timedelta, datetime
from random import randint, choice
from string import ascii_lowercase, digits

NUM_FACS = 15





def generateJson():
    for i in facilityLocations:
        pass

if __name__ == "__main__":
    facilityLocations = [
        "Kampala",
        "Kaliro",
        "Jinja",
        "Mbale",
        "Mityana",
        "Mubende",
        "Masindi",
        "Gulu",
        "Lira",
        "Arua",
        "Masaka",
        "Fort Portal",
        "Mbarara",
        "Kabale",
        "Iganga",
    ]

    facilityType = ["HCF_1", "HCF_2", "HCF_3", "HCF_4", "HOSPITAL"]
    facilityAbout = [
        "Has minimal resources",
        "Can do full checkup",
        "Has specialized equipment",
        "Urgent requests only",
    ]
    facilityNumbers = generatePhoneNumbers()

    
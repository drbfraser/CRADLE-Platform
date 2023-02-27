from enum import Enum

# To add a table to db, make a new class
# create a migration: flask db migrate
# apply the migration: flask db upgrade

#
# ENUMS CLASSES
#


class EnumWithList(Enum):
    @classmethod
    def listNames(cls):
        return [e.name for e in cls]

    @classmethod
    def listValues(cls):
        return [e.value for e in cls]


class RoleEnum(Enum):
    VHT = "VHT"
    HCW = "HCW"
    ADMIN = "ADMIN"
    CHO = "CHO"


class SexEnum(Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class GestationalAgeUnitEnum(Enum):
    MONTHS = "MONTHS"
    WEEKS = "WEEKS"


class TrafficLightEnum(Enum):
    NONE = "NONE"
    GREEN = "GREEN"
    YELLOW_UP = "YELLOW_UP"
    YELLOW_DOWN = "YELLOW_DOWN"
    RED_UP = "RED_UP"
    RED_DOWN = "RED_DOWN"


class FacilityTypeEnum(Enum):
    HCF_2 = "HCF_2"
    HCF_3 = "HCF_3"
    HCF_4 = "HCF_4"
    HOSPITAL = "HOSPITAL"


class QuestionTypeEnum(EnumWithList):
    INTEGER = "INTEGER"
    DECIMAL = "DECIMAL"
    STRING = "STRING"
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    MULTIPLE_SELECT = "MULTIPLE_SELECT"
    DATE = "DATE"
    TIME = "TIME"
    DATETIME = "DATETIME"
    CATEGORY = "CATEGORY"


class QRelationalEnum(Enum):
    LARGER_THAN = "LARGER_THAN"
    SMALLER_THAN = "SMALLER_THAN"
    EQUAL_TO = "EQUAL_TO"
    CONTAINS = "CONTAINS"


class ContentTypeEnum(EnumWithList):
    JSON = "application/json"
    CSV = "text/csv"

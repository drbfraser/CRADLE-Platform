from .base import *

# MODELS
class HealthFacilityOrm(db.Model):
    """
    Represents healthcare facilities.
    
    Stores facility details, contact info, and tracks incoming referrals.
    Currently designed for Uganda (single area code) but could expand later.
    Each facility has a unique ID and can receive referrals from other providers.
    """
    __tablename__ = "health_facility"
    id = db.Column(db.String(50), primary_key=True, default=get_uuid)
    name = db.Column(db.String(50), nullable=False, index=True)
    type = db.Column(db.Enum(FacilityTypeEnum))

    # Best practice would be to add column for area code + column for rest of number.
    # However, all of our facilities are in Uganda so area code does not change.
    # May want to change in the future if system is used in multiple countries
    phone_number = db.Column(db.String(50), unique=True)
    location = db.Column(db.String(50))
    about = db.Column(db.Text)
    new_referrals = db.Column(db.BigInteger, nullable=True)

    @staticmethod
    def schema():
        return HealthFacilitySchema
    
class VillageOrm(db.Model):
    """
    Records details about the village, including village number and zone number.
    """
    __tablename__ = "village"
    village_number = db.Column(db.String(50), primary_key=True)
    zone_number = db.Column(db.String(50))
    
    @staticmethod
    def schema():
        return VillageSchema

# SCHEMAS
# class HealthFacilitySchema(ma.SQLAlchemyAutoSchema):
#     type = EnumField(FacilityTypeEnum, by_value=True)

#     class Meta:
#         include_fk = True
#         model = HealthFacilityOrm
#         load_instance = True
#         include_relationships = True
        
# class VillageSchema(ma.SQLAlchemyAutoSchema):
#     class Meta:
#         include_fk = True
#         model = VillageOrm
#         load_instance = True
#         include_relationships = True
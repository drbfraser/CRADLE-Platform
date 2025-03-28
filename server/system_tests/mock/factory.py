from typing import Any

from flask_sqlalchemy import SQLAlchemy

import data
import models as models
from data import crud, marshal
from manage import get_username_from_email


class ModelFactory:
    """
    The base factory class for managing test models.

    Models constructed by this class are committed to the database just like usual.
    However, they are tracked by the factory which created them and are deleted once
    they are no longer needed. Factories are designed to be supplied to test functions
    via test fixtures which will trigger the factory to cleanup once the test has
    finished.

    Implementors must implement the ``_do_create`` method which handles creating a model
    and inserting it into the database.
    """

    def __init__(self, db: SQLAlchemy, **default_args):
        self.db = db
        self.models = []
        self.default_args = dict(**default_args)

    def create(self, **kwargs) -> Any:
        """
        Creates a new model, inserts it into the database and returns it. The model is
        tracked by this factory and will be cleaned up once it is no longer needed.

        :param kwargs: Keyword arguments to be forwarded along with the default
                       arguments to the delegate method for creating the model
        :return: A model
        """
        args = {**self.default_args, **kwargs}
        model = self._do_create(**args)
        self.models.append(model)
        return model

    def _do_create(self, **kwargs) -> Any:
        """
        Overridden by implementors to perform the actual creation of the model.

        :param kwargs: Arguments for model creation
        :return: A model
        """

    def cleanup(self):
        """
        Cleans up after this factory by deleting all created models.
        """
        for model in self.models:
            self.db.session.delete(model)
        self.db.session.commit()
        self.models = []


class PatientFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(PatientFactory, self).__init__(
            db,
            name="Test",
            sex="FEMALE",
            is_pregnant=False,
            zone="37",
            village_number="37",
            date_of_birth="1990-01-01",
            is_exact_date_of_birth=True,
        )

    def create(self, **kwargs) -> Any:
        """
        Creates a new patient.

        :param kwargs: Keyword arguments
        :key id: Unique id of the patient to create
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        return crud.create_model(dict(**kwargs), models.PatientSchema)


class ReadingFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(ReadingFactory, self).__init__(
            db,
            systolic_blood_pressure=110,
            diastolic_blood_pressure=80,
            heart_rate=70,
            symptoms="",
            date_taken=1594514397,
            user_id=1,
        )

    def create(self, **kwargs) -> Any:
        """
        Creates a new reading.

        :param kwargs: Keyword arguments
        :key id: Unique id of the patient to create
        :key patient_id: Id of the patient to associate this reading with
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        readingModel = marshal.unmarshal(models.ReadingOrm, dict(**kwargs))
        crud.create(readingModel, refresh=True)

        return readingModel


class ReferralFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(ReferralFactory, self).__init__(
            db,
            date_referred=1594514397,
            user_id=1,
            health_facility_name="H0000",
        )

    def create(self, **kwargs):
        """
        Creates a new referral.

        :param kwargs: Keyword arguments
        :key patient_id: Id of the patient to associate this referral with
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        return crud.create_model(dict(**kwargs), models.ReferralSchema)


class AssessmentFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(AssessmentFactory, self).__init__(
            db,
            date_assessed=1594514397,
            healthcare_worker_id=1,
        )

    def create(self, **kwargs):
        """
        Creates a new assessment.

        :param kwargs: Keyword arguments
        :key patient_id: Id of the patient to associate this assessment with
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        return crud.create_model(dict(**kwargs), models.AssessmentSchema)


class UserFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(UserFactory, self).__init__(
            db, health_facility_name="H0000", role="ADMIN", name="user"
        )

    def create(self, **kwargs) -> Any:
        """
        Creates a new user.

        :param kwargs: Keyword arguments
        :key email: Unique email for the user
        :return: A ``User`` model
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        # from config import flask_bcrypt
        from models import UserOrm

        d = dict(**kwargs)
        email = d.get("email")
        username = d.get("username")
        if username is None and email is not None:
            d["username"] = get_username_from_email(email)
        elif email is None and username is not None:
            d["email"] = f"{username}@email.com"

        # Default fields.
        if email is None and username is None:
            d["email"] = "user@email.com"
            d["username"] = "user"

        user = marshal.unmarshal(UserOrm, d)
        crud.create(user)
        data.db_session.commit()
        return user


class HealthFacilityFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(HealthFacilityFactory, self).__init__(db)

    def create(self, **kwargs) -> Any:
        """
        Creates a new health facility.

        :param kwargs: Keyword arguments
        :key name: Unique health facility name
        :return: A ``HealthFacilityOrm`` model
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        return crud.create_model(dict(**kwargs), models.HealthFacilitySchema)


class PregnancyFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super().__init__(db)

    def create(self, **kwargs) -> Any:
        """
        Creates a new pregnancy.

        :param kwargs: Keyword arguments
        :key patient_id: ID of the patient to associate the new pregnancy with
        :return: A ``Pregnancy`` model
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        return crud.create_model(dict(**kwargs), models.PregnancySchema)


class MedicalRecordFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super().__init__(db)

    def create(self, **kwargs) -> Any:
        """
        Creates a new medical record.

        :param kwargs: Keyword arguments
        :key patient_id: ID of the patient to associate the new record with
        :return: A ``MedicalRecordOrm`` model
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        return crud.create_model(dict(**kwargs), models.MedicalRecordSchema)


class FormTemplateFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super().__init__(db)

    def create(self, **kwargs) -> Any:
        """
        Creates a new form template.

        :param kwargs: Keyword arguments
        :return: A ``FormTemplateOrm`` model
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        return crud.create_model(dict(**kwargs), models.FormTemplateSchema)

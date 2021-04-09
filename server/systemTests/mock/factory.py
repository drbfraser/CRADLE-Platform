from flask_sqlalchemy import SQLAlchemy
from typing import Any
import data.crud as crud
import data.marshal as marshal
import models as models


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
        pass

    def cleanup(self):
        """
        Cleans up after this factory by deleting all created models.
        """
        for model in self.models:
            self.db.session.delete(model)
        self.db.session.commit()


class PatientFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(PatientFactory, self).__init__(
            db,
            patientName="Test",
            patientSex="FEMALE",
            isPregnant=False,
            zone="37",
            villageNumber="37",
        )

    def create(self, **kwargs) -> Any:
        """
        Creates a new patient.

        :param kwargs: Keyword arguments
        :key patientId: Unique id of the patient to create
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        from database.PatientRepo import PatientRepo

        return PatientRepo().create_model(dict(**kwargs))


class ReadingFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(ReadingFactory, self).__init__(
            db,
            bpSystolic=110,
            bpDiastolic=80,
            heartRateBPM=70,
            symptoms="",
            dateTimeTaken=1594514397,
            userId=1,
        )

    def create(self, **kwargs) -> Any:
        """
        Creates a new reading.

        :param kwargs: Keyword arguments
        :key readingId: Unique id of the patient to create
        :key patientId: Id of the patient to associate this reading with
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        from database.ReadingRepo import ReadingRepo

        return ReadingRepo().create_model(dict(**kwargs))


class ReferralFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(ReferralFactory, self).__init__(
            db,
            dateReferred=1594514397,
            userId=1,
            referralHealthFacilityName="H0000",
        )

    def create(self, **kwargs):
        """
        Creates a new referral.

        :param kwargs: Keyword arguments
        :key patientId: Id of the patient to associate this referral with
        :key readingId: Id of the reading to associate this referral with
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:

        return crud.create_model(dict(**kwargs), models.ReferralSchema)

class FollowUpFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(FollowUpFactory, self).__init__(
            db, dateAssessed=1594514397, healthcareWorkerId=1
        )

    def create(self, **kwargs):
        """
        Creates a new followup.

        :param kwargs: Keyword arguments
        :key readingId: Id of the reading to associate this followup with
        :return:
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:

        return crud.create_model(dict(**kwargs), models.FollowUpSchema)


class UserFactory(ModelFactory):
    def __init__(self, db: SQLAlchemy):
        super(UserFactory, self).__init__(
            db, password="password", healthFacilityName="H0000", role="ADMIN"
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
        import data
        from config import flask_bcrypt
        from models import User

        d = dict(**kwargs)

        # Hash the user's password so that they can login
        d["password"] = flask_bcrypt.generate_password_hash(d["password"])

        user = marshal.unmarshal(User, d)
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
        :key healthFacilityName: Unique health facility name
        :return: A ``HealthFacility`` model
        """
        return super().create(**kwargs)

    def _do_create(self, **kwargs) -> Any:
        from database.HealthFacilityRepo import HealthFacilityRepo

        return HealthFacilityRepo().create_model(dict(**kwargs))

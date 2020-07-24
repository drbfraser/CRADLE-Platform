from models import FollowUp, FollowUpSchema

from .Database import Database


class FollowUpRepo(Database):
    def __init__(self):
        super(FollowUpRepo, self).__init__(table=FollowUp, schema=FollowUpSchema)

    def model_to_dict(self, model: FollowUp) -> dict:
        """
        Converts a ``FollowUp`` model to a dictionary representation.

        :param model: A ``Followup`` model
        :return: A dictionary representation of the model
        """
        d = super().model_to_dict(model)
        # Remove some fields from the resultant dictionary which were populated by
        # relations configured in the model.
        del d["reading"]
        del d["healthcareWorker"]
        return d

"""
Filename: 
    Database.py
Author:
    Vinson Ly
Description:
    Parent Database class that contains a generic implementation of 
    common database operations including CRUD
Usage:
    - Create child Database classes that inherit from this class and 
    overriding the constructor to pass in the appropriate values for
    self.table and self.schema.
    - The implemented methods can be override in the child class if 
    custom implementations are needed
"""

import collections
from config import db
from typing import Any, Optional, List


class Database:
    def __init__(self, table, schema):
        self.table = table
        self.schema = schema

    def model_to_dict(self, model: Any) -> Optional[dict]:
        """
        Converts a model into a dictionary mapping column names to values.

        :param model: A model
        :return: A dictionary or ``None`` if ``model`` is ``None``
        """
        if not model:
            return None
        if isinstance(model, collections.Mapping):  # Local database stub
            return model
        return self.schema().dump(model)

    def models_to_list(self, models: List[Any]) -> List[dict]:
        """
        Converts a list of models into a list of dictionaries mapping column names
        to values.

        :param models: A list of models
        :return: A list of dictionaries
        """
        return self.schema(many=True).dump(models)

    @staticmethod
    def add(model: Any):
        """
        Inserts a new model into the database and commits the changes.

        :param model: A model
        """
        db.session.add(model)
        db.session.commit()

    def create(self, new_data: dict) -> dict:
        """
        Creates a new row in the database by converting ``new_data`` to a model then
        adding it to the database.

        Use of ``create_model`` is preferred over this method as it returns the
        actual model instead of it's dictionary representation.

        :param new_data: A dictionary mapping column names to values
        :return: A dictionary representing the inserted row
        """
        new_entry = self.schema().load(new_data, session=db.session)
        db.session.add(new_entry)
        db.session.commit()
        return self.model_to_dict(new_entry)

    def create_model(self, new_data: dict) -> Any:
        """
        Constructs a model from a dictionary associating column names to values, inserts
        said model into the database, and then returns the model.

        This method differs from ``create`` in that it returns the actual model instance
        and not another dictionary. This allows callers to take advantage of the various
        relations provided by the ORM instead of having to query those object manually.

        :param new_data: A dictionary mapping column names to values
        :return: A model instance
        """
        new_model = self.schema().load(new_data, session=db.session)
        self.add(new_model)
        return new_model

    def read(self, key: str, value: Any) -> dict:
        """
        Reads a single record in the table.

        :param key: Name fo the column used to query
        :param value: Value of the column used to query
        :return: A dictionary mapping column names to values for the queried rows or
                 ``None`` if the query has no matches
        """
        entry = self.table.query.filter_by(**{key: value}).one_or_none()
        return self.model_to_dict(entry)

    def read_all(self) -> Optional[List[dict]]:
        """
        Reads all record in the table.

        :return: A list containing dictionaries mapping column names to values or
                 ``None`` if the query returned no results
        """
        all_entries = self.table.query.all()
        if all_entries:
            return self.models_to_list(all_entries)
        return None

    def update(self, key: str, value: Any, new_data: dict) -> Optional[dict]:
        """
        Updates a single record in the table

        :param key: Name of the column used to query
        :param value: Value of the column used to query
        :param new_data: Dictionary containing the key value pairs to update
        :return: The new value of the row as a dictionary or ``None`` if the query has
                 no matches
        """
        found_entry = self.table.query.filter_by(**{key: value}).first()
        if found_entry:
            for key in new_data:
                this_attr = getattr(found_entry, key)
                setattr(found_entry, key, new_data[key])
            db.session.commit()
        return self.model_to_dict(found_entry)

    def delete(self, key: str, value: Any) -> bool:
        """
        Deletes a single record from the table.

        :param key: Name of the column used to query
        :param value: Value of the column used to query
        :return: True if match is found and record is deleted, otherwise false
        """
        found_entry = self.table.query.filter_by(**{key: value}).first()
        if found_entry:
            db.session.delete(found_entry)
            db.session.commit()
            return True
        return False

    def delete_all(self) -> int:
        """
        Delete all record in the table

        :return: The number of records deleted
        """
        count = db.session.query(self.table).delete()
        db.session.commit()
        print(f"Deleted {count} {type(self.table).__name__}")
        return count

    def search(self, search_dict: dict) -> List[dict]:
        """
        Searches for all records which match a given search criteria.

        :param search_dict: A dictionary mapping column names to values used to filter
                            the query
        :return: A list of rows as dictionaries
        """
        all_entries = self.table.query.filter_by(**search_dict)
        return self.models_to_list(all_entries)

    def select_one(self, **kwargs) -> Optional[Any]:
        """
        Queries the database returning the model which has columns which match the given
        keyword arguments.

        In the event that multiple rows are returned by the query, a
        ``sqlalchemy.orm.exc.MultipleResultsFound`` exception is raised.

        :param kwargs: Keyword arguments used to filter the query
        :return: A model or ``None`` if the query didn't return any rows
        """
        return self.table.query.filter_by(**kwargs).one_or_none()

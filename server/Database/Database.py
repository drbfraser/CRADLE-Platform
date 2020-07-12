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
from typing import Any


class Database:
    def __init__(self, table, schema):
        self.table = table
        self.schema = schema

    """
        Description: 
            converts a SQLAlchemy object to a python dict
    """

    def model_to_dict(self, model):
        if not model:
            return None
        if isinstance(model, collections.Mapping):  # Local database stub
            return model
        return self.schema().dump(model)

    """
        Description: 
            converts a list of SQLAlchemy objects to a python list containing
            python dicts, with key value pairs of SQLAlchemy object
    """

    def models_to_list(self, models):
        return self.schema(many=True).dump(models)

    @staticmethod
    def add(model: Any):
        """
        Inserts a new model into the database and commits the changes.

        :param model: A model
        """
        db.session.add(model)
        db.session.commit()

    """
        Description: 
            create new record in table, using new_data
        Params:
            new_data: 
                [dict] containing keys, matching column names of table,
                and its corresponding values to save 
        Return: 
            [dict] containing the key value pairs of the newly inserted row
    """

    def create(self, new_data):
        new_entry = self.schema().load(new_data, session=db.session)
        db.session.add(new_entry)
        db.session.commit()
        return self.model_to_dict(new_entry)

    def create_from_dict(self, new_data: dict) -> Any:
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
        db.session.add(new_model)
        db.session.commit()
        return new_model

    """
        Description: 
            read single record in table
        Params:
            key: name of the column used to query
            value: value of the column used to query 
        Return: 
            - [dict] containing the key value pairs of the first matching 
            record 
            - None is returned if query has no matches
    """

    def read(self, key, value):
        search_dict = {}
        search_dict[key] = value
        entry = self.table.query.filter_by(**search_dict).one_or_none()
        return self.model_to_dict(entry)

    """
        Description: 
            read all records in table
        Return: 
            - [list] containing dicts corresponding to all records
            - None is returned if query has no matches
    """

    def read_all(self):
        all_entries = self.table.query.all()
        if all_entries:
            return self.models_to_list(all_entries)
        return None

    """
        Description: 
            update single record in table
        Params:
            key: name of the column used to query
            value: value of the column used to query 
            new_data: dict containing the key value pairs to update
            and its corresponding values
        Return: 
            - [dict] containing the key value pairs of updated record
            - None is returned if query has no matches
    """

    def update(self, key, value, new_data):
        search_dict = {}
        search_dict[key] = value
        found_entry = self.table.query.filter_by(**search_dict).first()
        if found_entry:
            for key in new_data:
                this_attr = getattr(found_entry, key)
                this_type = type(this_attr)
                if this_attr == None:
                    setattr(found_entry, key, new_data[key])
                else:
                    setattr(found_entry, key, this_type(new_data[key]))
            db.session.commit()
        return self.model_to_dict(found_entry)

    """
        Description: 
            update single record in table
        Params:
            key: name of the column used to query
            value: value of the column used to query 
        Return: 
            - True if match is found and record is deleted
            - False is returned if query has no matches
    """

    def delete(self, key, value):
        search_dict = {}
        search_dict[key] = value
        found_entry = self.table.query.filter_by(**search_dict).first()
        if found_entry:
            db.session.delete(found_entry)
            db.session.commit()
            return True
        return False

    """
        Description: 
            delete all records in table
        Return: 
            - [int] number of records deleted
    """

    def delete_all(self):
        count = db.session.query(self.table).delete()
        db.session.commit()
        print(f"Deleted {count} {type(self.table).__name__}")
        return count

    """
        Description: 
            read single record in table
        Params:
            search_dict:
                python dict containing key value pairs to query table
        Return: 
            - [list] containing the python dicts of all matching records
    """

    def search(self, search_dict):
        all_entries = self.table.query.filter_by(**search_dict)
        return self.models_to_list(all_entries)

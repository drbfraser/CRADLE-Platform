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

from config import db
import collections

class Database:
    def __init__(self, table, schema):
        self.table = table
        self.schema = schema

    def model_to_dict(self, model):
        if not model:
            return None
        if isinstance(model, collections.Mapping):  # Local database stub
            return model
        return self.schema().dump(model)

    def create(self, new_data):
        new_entry = self.schema().load(new_data, session=db.session)
        db.session.add(new_entry)
        db.session.commit()
        return self.model_to_dict(new_entry)
    
    def read(self, key, value):
        search_dict = {}
        search_dict[key] = value
        entry = self.table.query.filter_by(**search_dict).one_or_none()
        return self.model_to_dict(entry)

    def read_all(self):
        all_entries = self.table.query.all()
        if all_entries:
            return self.schema(many=True).dump(all_entries)
        return None

    def update(self, key, value, new_data):
        search_dict = {}
        search_dict[key] = value
        found_entry = self.table.query.filter_by(**search_dict).first()
        if found_entry:
            for key in new_data:
                # found_entry.key = new_data[key]
                setattr(found_entry, key, new_data[key])
            db.session.commit()
        return self.model_to_dict(found_entry)

    def delete(self, key, value):
        search_dict = {}
        search_dict[key] = value
        found_entry = self.table.query.filter_by(**search_dict).first()
        if found_entry:
            db.session.delete(found_entry)
            db.session.commit()
            return True
        return False

    def delete_all(self):
        count = db.session.query(self.table).delete()
        db.session.commit()
        print(f'Deleted {count} {type(self.table).__name__}')
        return count
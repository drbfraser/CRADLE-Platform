"""
Description:
    This is a parent manager class that implements
    common database operations
Usage:
    Create a class that inherits from this manager class,
    passing in the mysql table during instantiation
"""


class Manager:
    def __init__(self, database):
        self.database = database()

    def create(self, data):
        return self.database.create(data)

    def read_all(self):
        return self.database.read_all()

    def read(self, key, value):
        return self.database.read(key, value)

    def update(self, key, value, new_data):
        return self.database.update(key, value, new_data)

    def delete(self, key, value):
        return self.database.delete(key, value)

    def delete_all(self):
        return self.database.delete_all()

    def search(self, search_dict):
        return self.database.search(search_dict)

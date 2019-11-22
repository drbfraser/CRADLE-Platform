from Database.UserRepo import UserRepo
from Manager.Manager import Manager

from Manager.RoleManager import RoleManager
roleManager = RoleManager()

class UserManager(Manager):
    def __init__(self):
        Manager.__init__(self, UserRepo)

    def read_all_no_password(self):
        users_query = self.read_all()
        for user in users_query:
            user.pop('password', None)
        
        return users_query

    # returns a list of VHT objects (id + email)
    def read_all_vhts(self):
        vht_list = []
        users_query = self.read_all()
        for user in users_query:
            if user['roleIds']:
                role_names = roleManager.get_role_names(user['roleIds'])
                if 'VHT' in role_names:
                    vht_list.append({'id': user['id'], 'email': user['email']})
        
        return vht_list

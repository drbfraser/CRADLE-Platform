from Manager.Manager import Manager

from config import db
from models import Role, User

class RoleManager():

    def add_user_to_role(self, user_id, role_ids):
        # remove all user roles
        user = User.query.filter_by(id=user_id).first()
        user.roleIds = []
        db.session.commit()

        # add user to roles
        for role_id in role_ids:
            role = Role.query.filter_by(id=role_id).first()
            role.users.append(user)
            db.session.add(role)
        db.session.commit()
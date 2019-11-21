from Manager.Manager import Manager

from config import db
from models import Role, User


class RoleManager():

    def get_role_names(self, role_ids):
        roles = []
        for role_id in role_ids:
            role = Role.query.filter_by(id=role_id).first()
            roles.append(role.name.name)
        return roles

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

    def add_vht_to_supervise(self, cho_id, vht_ids):
        # find the cho
        cho = User.query.filter_by(id=cho_id).first()

        # check CHO role is actually CHO

        cho.vhtList = []
        db.session.commit()

        # add vhts to CHO's vhtList
        for vht_id in vht_ids:
            vht = User.query.filter_by(id=vht_id).first()
            cho.vhtList.append(vht)
            db.session.add(cho)
        db.session.commit()
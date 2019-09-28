
# this seeds the database with seed command below

from flask_script import Manager
from config import app, db, flask_bcrypt
from models import *

manager = Manager(app)

# USAGE: python manage.py seed
@manager.command
def seed():
    role1 = Role(name='VHT')
    role2 = Role(name='HCW')
    role3 = Role(name='ADMIN')

    print('Seeding roles...')
    db.session.add_all([role1,role2,role3])
    db.session.commit()

    # NOTE: users are automatically added to 'HCW' role
    role_hcw = Role.query.filter_by(name='HCW').first()

    user_schema = UserSchema()
    u1 = { 'email' : 'a@a.com', 'password': flask_bcrypt.generate_password_hash('123456') }
    u2 = { 'email' : 'b@b.com', 'password': flask_bcrypt.generate_password_hash('123456') }
    role_hcw.users.append(user_schema.load(u1, session=db.session))
    role_hcw.users.append(user_schema.load(u2, session=db.session))

    print('Seeding users...')
    db.session.add(role_hcw)
    db.session.commit()

    print('Complete!')

if __name__ == "__main__":
    manager.run()
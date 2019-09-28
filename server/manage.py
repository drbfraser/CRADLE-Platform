
# this seeds the database with seed command below

from flask_script import Manager
from config import app, db
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

    # NOTE: users are automatically added to 'HCW' role
    u1 = User(email="a@a.com", password="123456")
    u2 = User(email="b@b.com", password="123456")

    print('Seeding users...')
    db.session.add_all([u1,u2])

    db.session.commit()
    print('Complete!')

if __name__ == "__main__":
    manager.run()
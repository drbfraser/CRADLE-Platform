"""Change form id to be uuid

Revision ID: 276237440825
Revises: 92e818bd7db3
Create Date: 2022-03-18 07:08:05.807052

"""
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '276237440825'
down_revision = '92e818bd7db3'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    op.drop_constraint('question_ibfk_1', 'question', type_='foreignkey')
    op.alter_column('form', 'id',
               existing_type=mysql.INTEGER(display_width=11),
               type_=sa.String(length=50),
               existing_nullable=False)
    op.drop_constraint('PRIMARY', 'form', type_='primary')
    op.alter_column('question', 'formId',
               existing_type=mysql.INTEGER(display_width=11),
               type_=sa.String(length=50),
               existing_nullable=True)

    connection.execute(f'DELETE FROM form')
    connection.execute(f'DELETE FROM question')

    op.create_primary_key('pk_form', 'form', ['id'])
    op.create_foreign_key('question_ibfk_1', 'question', 'form', ['formId'], ['id'], ondelete='CASCADE')

def downgrade():
    connection = op.get_bind()

    op.drop_constraint('question_ibfk_1', 'question', type_='foreignkey')
    op.drop_constraint('PRIMARY', 'form', type_='primary')

    connection.execute(f'DELETE FROM form')
    connection.execute(f'DELETE FROM question')

    op.alter_column('question', 'formId',
               existing_type=sa.String(length=50),
               type_=mysql.INTEGER(display_width=50),
               existing_nullable=True)
    op.create_primary_key('pk_form', 'form', ['id'])
    op.alter_column('form', 'id',
               existing_type=sa.String(length=50),
               type_=mysql.INTEGER(display_width=50),
               existing_nullable=False,
               autoincrement=True)

    op.create_foreign_key('question_ibfk_1', 'question', 'form', ['formId'], ['id'], ondelete='CASCADE')

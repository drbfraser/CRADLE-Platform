"""question add category self reference

Revision ID: 8066e35980e3
Revises: f0abb9a3e931
Create Date: 2022-04-06 10:07:25.266376

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '8066e35980e3'
down_revision = 'f0abb9a3e931'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('question', sa.Column('categoryId', sa.String(length=50), nullable=True))
    op.create_index(op.f('ix_question_categoryId'), 'question', ['categoryId'], unique=False)
    op.create_foreign_key("fk_question_category_id_id", 'question', 'question', ['categoryId'], ['id'], ondelete='SET NULL')
    op.drop_column('question', 'category')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('question', sa.Column('category', mysql.TEXT(), nullable=False))
    op.drop_constraint("fk_question_category_id_id", 'question', type_='foreignkey')
    op.drop_index(op.f('ix_question_categoryId'), table_name='question')
    op.drop_column('question', 'categoryId')
    # ### end Alembic commands ###

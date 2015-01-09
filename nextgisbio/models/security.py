# -*- coding: utf-8 -*-

import csv
import sys
import hashlib

from sqlalchemy import Column, Enum, Integer, Unicode, ForeignKey
from sqlalchemy.orm import relationship

from nextgisbio.models import Base, DBSession
from nextgisbio.utils.jsonify import JsonifyMixin

USER_ACL_ROLES = dict(user='user', editor='editor', admin='admin')


class User(Base, JsonifyMixin):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    login = Column(Unicode(40), nullable=False, unique=True)
    password = Column(Unicode(40), nullable=False)
    role = Column(Enum(*USER_ACL_ROLES, native_enum=False), nullable=False)
    person = relationship('Person')
    person_id = Column(Integer, ForeignKey('person.id'))

    @classmethod
    def password_hash(cls, password):
        return hashlib.sha1(password).hexdigest()

    def __unicode__(self):
        return u"%s" % self.display_name

    @staticmethod
    def add_from_file(users_csv_file_path):
        import transaction
        with transaction.manager:
            dbsession = DBSession()
            reader = csv.reader(open(users_csv_file_path), delimiter='\t')
            row = reader.next() # пропускаем заголовки
            records = [line for line in reader]

            for row in records:
                (id, login, password, person_id, role) = [None if x == '' else x for x in row]
                user = User(
                    id=id,
                    login=login,
                    password=User.password_hash(password),
                    role=role,
                    person_id=person_id
                )
                dbsession.add(user)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'login', 'password', 'person_id', 'role']
        dump(filename, fieldnames, DBSession().query(User).all())
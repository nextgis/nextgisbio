# -*- coding: utf-8 -*-

import csv
import hashlib

from sqlalchemy import Column, Enum, Integer, Unicode, ForeignKey, Sequence, Boolean
from sqlalchemy.orm import relationship

from nextgisbio.models import Base, DBSession
from nextgisbio.utils.jsonify import JsonifyMixin

USER_ACL_ROLES = dict(user='user', editor='editor', admin='admin')


class User(Base, JsonifyMixin):
    __tablename__ = 'user'
    id = Column(Integer, Sequence('users_id_seq', start=1), primary_key=True)
    login = Column(Unicode(40), nullable=False, unique=True)
    password = Column(Unicode(40), nullable=False)
    role = Column(Enum(*USER_ACL_ROLES, native_enum=False), nullable=False)
    person = relationship('Person')
    person_id = Column(Integer, ForeignKey('person.id'), unique=True)
    active = Column(Boolean)

    @classmethod
    def password_hash(cls, password):
        return hashlib.sha1(password).hexdigest()

    def __unicode__(self):
        return u"%s" % self.display_name

    @staticmethod
    def add_from_file(users_csv_file_path, md5_pass):
        import transaction
        with transaction.manager:
            dbsession = DBSession()
            reader = csv.reader(open(users_csv_file_path), delimiter='\t')
            reader.next()
            records = [line for line in reader]

            for row in records:
                (id, login, password, person_id, role) = [None if x == '' else x for x in row]
                user = User(
                    login=login,
                    password=password if md5_pass else User.password_hash(password),
                    role=role,
                    person_id=person_id,
                    active=True
                )
                dbsession.add(user)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'login', 'password', 'person_id', 'role']
        dump(filename, fieldnames, DBSession().query(User).order_by(User.id).all())

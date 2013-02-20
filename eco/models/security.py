# -*- coding: utf-8 -*-

import hashlib

from sqlalchemy import Column, Enum
from sqlalchemy import Integer, Unicode

from eco.models import Base
from eco.utils.jsonify import JsonifyMixin

USER_ACL_ROLES = dict(user='user', editor='editor', admin='admin')

class User(Base, JsonifyMixin):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    login = Column(Unicode(40), nullable=False, unique=True)
    password = Column(Unicode(40), nullable=False)
    role = Column(Enum(*USER_ACL_ROLES, native_enum=False), nullable=False)

    @classmethod
    def password_hash(cls, password):
        return hashlib.sha1(password).hexdigest()

    def __unicode__(self):
        return u"%s" % self.display_name

# encoding: utf-8

from sqlalchemy import Column, Integer, String, Sequence, ForeignKey
from sqlalchemy.orm import relationship

from eco.models import DBSession, Base
from eco.utils.jsonify import JsonifyMixin


class Photo(Base, JsonifyMixin):
    __tablename__ = 'photo'

    id = Column(Integer, Sequence('photo_id_seq', start=1), primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    url = Column(String)


class CardsPhoto(Base, JsonifyMixin):
    __tablename__ = 'cards_photo'

    card_id = Column(Integer, ForeignKey('cards.id'), primary_key=True)
    photo_id = Column(Integer, ForeignKey('photo.id'), primary_key=True)
    card = relationship("Cards")
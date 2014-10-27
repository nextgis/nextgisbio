# encoding: utf-8

import csv
import transaction

from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey, Sequence
from sqlalchemy.orm import relationship

from eco.models import Base
from eco.utils.jsonify import JsonifyMixin
from eco.models import DBSession
from eco.utils import csv_utf

class Images(Base, JsonifyMixin):
    __tablename__ = 'images'

    id = Column(Integer, Sequence('image_id_seq', start=1), primary_key=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String)
    url = Column(String)
    local = Column(String)
    size = Column(Integer)

    @staticmethod
    def export_to_file(filename):
        fieldnames = ['id', 'name', 'description', 'url',
                      'local', 'size']

        with open(filename, 'wb') as file:
            writer = csv_utf.UnicodeWriter(file)
            writer.writerow(fieldnames)
            session = DBSession()
            images = [[image.id,
                      image.name,
                      image.description,
                      image.url,
                      image.local,
                      image.size
                      ] for image in session.query(Images).all()]
            session.close()
            writer.writerows(images)

    @staticmethod
    def import_from_csv(path_to_file):
        with transaction.manager:
            session = DBSession()

            reader = csv.reader(open(path_to_file), delimiter='\t')
            reader.next()  # пропускаем заголовки
            records = [line for line in reader]

            for row in records:
                id_image, name, description, url, local, size = [None if x == '' else x for x in row]
                image = Images(id=id_image, name=name, description=description, url=url, local=local, size=size)
                session.add(image)


class CardsImages(Base, JsonifyMixin):
    __tablename__ = 'cards_images'

    card_id = Column(Integer, ForeignKey('cards.id'), primary_key=True)
    image_id = Column(Integer, ForeignKey('images.id'), primary_key=True)
    card = relationship("Cards")
    image = relationship("Images")

    @staticmethod
    def export_to_file(filename):
        fieldnames = ['card_id', 'image_id']

        with open(filename, 'wb') as file:
            writer = csv_utf.UnicodeWriter(file)
            writer.writerow(fieldnames)
            session = DBSession()
            images = [[cards_image.card_id,
                      cards_image.image_id
                      ] for cards_image in session.query(CardsImages).all()]
            session.close()
            writer.writerows(images)

    @staticmethod
    def import_from_csv(path_to_file):
        with transaction.manager:
            session = DBSession()

            reader = csv.reader(open(path_to_file), delimiter='\t')
            reader.next()  # пропускаем заголовки
            records = [line for line in reader]

            for row in records:
                card_id, image_id = [None if x == '' else x for x in row]
                card_image = CardsImages(card_id=card_id, image_id=image_id)
                session.add(card_image)
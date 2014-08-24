# encoding: utf-8

import csv

from sqlalchemy import Column, Integer, String, Float
from sqlalchemy import ForeignKey, Sequence
from sqlalchemy.orm import relationship

from eco.models import DBSession, Base, Taxon
from eco.utils.jsonify import JsonifyMixin
from eco.utils import csv_utf


class Annotation(Base, JsonifyMixin):
    '''
    Аннотированные списки
    '''
    __tablename__ = 'annotation'

    id = Column(Integer, Sequence('annotation_id_seq', start=100000), primary_key=True)
    species = Column(Integer, ForeignKey('taxon.id'), nullable=False)
    species_link = relationship('Taxon')
    key_area = Column(Integer, ForeignKey('key_area.id'), nullable=False) # ключевой участок
    key_area_link = relationship('Key_area', backref='annotations')

    inserter = Column(Integer, ForeignKey('person.id'))
    identifier = Column(Integer, ForeignKey('person.id'))       # определил
    collecter = Column(Integer, ForeignKey('person.id'))       # собрал
    biblioref = Column(Integer, ForeignKey('inforesources.id')) # библиогр. ссылка

    original_name = Column(String) # Исходное название
    location = Column(String) # Геопривязка
    lon = Column(Float)
    lat = Column(Float)
    biotop = Column(String) # Биотоп
    difference = Column(String) # Отличия
    substrat = Column(String) # Субстрат
    status = Column(String) # статус
    frequency = Column(String) # Частота встречаемости
    quantity = Column(String) # количество (тип взял как в БД Access)
    annotation = Column(String) # аннотация
    infosourse = Column(String) # Источник информации
    year = Column(Integer)
    month = Column(Integer)
    day = Column(Integer)
    exposure = Column(Integer) # Длительность экспозиции


    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  species key_area    identifier  collecter   biblioref   original_name   location    lon lat biotop  difference  substrat    status  frequency   quantity    annotation  infosourse  year    month   day exposure
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()
            reader = csv.reader(open(filename), delimiter='\t')
            row = reader.next() # пропускаем заголовки
            records = [line for line in reader]

            for row in records:
                x = [None if x == '' else x for x in row]
                print str(len(x)) + ' - ' + str(x[0])
                (
                    id, species, inserter, key_area, identifier, collecter,
                    biblioref,
                    original_name, location, lon, lat,
                    biotop, difference, substrat, status,
                    frequency, quantity, annotation,
                    infosourse, year, month, day, exposure
                ) = [None if x == '' else x for x in row]
                ann = Annotation(
                    id=id,
                    species=species,
                    inserter=inserter,
                    key_area=key_area,
                    identifier=identifier,
                    collecter=collecter,
                    biblioref=biblioref,
                    original_name=original_name, location=location, lon=lon, lat=lat,
                    biotop=biotop, difference=difference, substrat=substrat, status=status,
                    frequency=frequency, quantity=quantity, annotation=annotation,
                    infosourse=infosourse, year=year, month=month, day=day, exposure=exposure
                )
                dbsession.add(ann)


    @staticmethod
    def export_to_file(filename):
        fieldnames = ['id', 'species', 'inserter', 'key_area', 'identifier', 'collecter',
                'biblioref',
                'original_name', 'location', 'lon', 'lat',
                'biotop', 'difference', 'substrat', 'status',
                'frequency', 'quantity', 'annotation',
                'infosourse', 'year', 'month', 'day', 'exposure']
        
        with open(filename, 'wb') as file:
            writer = csv_utf.UnicodeWriter(file)
            writer.writerow(fieldnames)
        
            dbsession = DBSession()
            
            annotations = [[ann.id, ann.species, ann.inserter, ann.key_area, ann.identifier, ann.collecter,
                ann.biblioref,
                ann.original_name, ann.location, ann.lon, ann.lat,
                ann.biotop, ann.difference, ann.substrat, ann.status,
                ann.frequency, ann.quantity, ann.annotation,
                ann.infosourse, ann.year, ann.month, ann.day, ann.exposure] for ann in dbsession.query(Annotation).all()]

            writer.writerows(annotations)


    @staticmethod
    def as_join_list(taxon_list=None, header=True):
        '''
        Выбрать аннотированные списки таксонов, перечисленных в taxon_list
        Все идентификаторы заменить на соотв. значения из таблиц-справочников.
        Вернуть выборку в виде списка значений.
        Если taxon_list=None, выбрать все карточки.
        header: добавлять ли в начало списка строку заголовков.
        '''

        dbsession = DBSession()
        if taxon_list: # выдать списки-потомки определенных таксонов
            species = Taxon.species_by_taxon(taxon_list)
            species_id = [t['id'] for t in species]
        else: # выдать все списки
            species = dbsession.query(Taxon).all()
            species_id = [t.id for t in species if t.is_last_taxon()]
        qs = '''
            SELECT
                annotation.id,
                taxon.name as species,
                key_area.name as key_area,
                person_1.name as identifier,
                person_2.name as collecter,
                inforesources.filename as biblioref,
                original_name,
                location,
                lon,
                lat,
                biotop,
                difference,
                substrat,
                status,
                frequency,
                quantity,
                annotation,
                infosourse,
                year,
                month,
                day,
                exposure
            FROM annotation
            LEFT OUTER JOIN 
                taxon ON  annotation.species = taxon.id
            LEFT OUTER JOIN
                key_area ON annotation.key_area = key_area.id
            LEFT OUTER JOIN
                person as person_1 ON annotation.identifier = person_1.id
            LEFT OUTER JOIN
                person as person_2 ON annotation.collecter = person_2.id
            LEFT OUTER JOIN 
                inforesources ON annotation.biblioref = inforesources.id
            WHERE
                annotation.species IN (%s)
        ''' % ", ".join([str(num) for num in species_id])
        anlists = dbsession.query(Annotation).from_statement(qs).all()
        dbsession.close()

        names = [
            'id',
            'species',
            'key_area',
            'identifier',
            'collecter',
            'biblioref',
            'original_name',
            'location',
            'lon',
            'lat',
            'biotop',
            'difference',
            'substrat',
            'status',
            'frequency',
            'quantity',
            'annotation',
            'infosourse',
            'year',
            'month',
            'day',
            'exposure'
        ]
        result = [names]
        for anlist in anlists:
            row = [anlist.__getattribute__(attr) for attr in names]
            result.append(row)
        return result
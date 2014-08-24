# encoding: utf-8

import csv

from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy import ForeignKey, Sequence

from sqlalchemy.orm import relationship

#from geoalchemy import GeometryColumn, Point

from eco.models import DBSession, Base, Taxon, TAXON_TYPES
from eco.models import Inforesources
from eco.utils.jsonify import JsonifyMixin


class Cards(Base, JsonifyMixin):
    '''
    Карточки
    '''
    __tablename__ = 'cards'
    id = Column(Integer, Sequence('cards_id_seq', start=100000), primary_key=True)
    species = Column(Integer, ForeignKey('taxon.id'), nullable=False)
    inserter = Column(Integer, ForeignKey('person.id'))
    observer = Column(Integer, ForeignKey('person.id'))
    identifier = Column(Integer, ForeignKey('person.id'))
    taxa_scheme = Column(Integer, ForeignKey('taxa_scheme.id'))
    museum = Column(Integer, ForeignKey('museum.id'))
    anthr_press = Column(Integer, ForeignKey('anthr_press.id'))
    vitality = Column(Integer, ForeignKey('vitality.id'))
    abundance = Column(Integer, ForeignKey('abundance.id'))
    footprint = Column(Integer, ForeignKey('footprint.id'))
    pheno = Column(Integer, ForeignKey('pheno.id'))
    inforesources = Column(Integer, ForeignKey('inforesources.id'))

    original_name = Column(String)  # Исходное название
    photo = Column(Boolean)
    year = Column(Integer)
    month = Column(Integer)
    day = Column(Integer)
    time = Column(String)
    habitat = Column(String)  # местообитание
    substrat = Column(String)
    limit_fact = Column(String)  # лимитирующие факторы
    protection = Column(String)  # меры охраны
    area = Column(String)  # площадь ценопопуляции
    quantity = Column(Integer)  # количество (шт.)

    unknown_age = Column(Integer)  # 
    unknown_sex = Column(Integer)  # 
    males = Column(Integer)  # 
    females = Column(Integer)  # 

    ad = Column(Integer)  # 
    sad = Column(Integer)  # 
    juv = Column(Integer)  # 
    pull = Column(Integer)  # 
    egs = Column(Integer)  # 

    publications = Column(String)  #

    notes = Column(String)  # примечания

    location = Column(String)  # Геопривязка
    lon = Column(Float)
    lat = Column(Float)
    coord_type = Column(Integer, ForeignKey('coord_type.id'))

    @staticmethod
    def as_join_list(taxon_list=None, header=True):
        '''
        Выбрать карточки наблюдений таксонов, перечисленных в taxon_list
        Все идентификаторы заменить на соотв. значения из таблиц-справочников.
        Вернуть выборку в виде списка значений.
        Если taxon_list=None, выбрать все карточки.
        header: добавлять ли в начало списка строку заголовков.
        '''

        dbsession = DBSession()
        if taxon_list:  # выдать карточки-потомки определенных таксонов
            species = Taxon.species_by_taxon(taxon_list)
            species_id = [t['id'] for t in species]
        else:  # выдать все карточки
            species = dbsession.query(Taxon).all()
            species_id = [t.id for t in species if t.is_last_taxon()]
        qs = '''
            SELECT
                cards.id, 
                taxon.name as species,
                cards.original_name,
                person.name as inserter,
                person_1.name as observer,
                person_2.name as identifier,
                taxa_scheme.taxa_scheme,
                museum.museum,
                anthr_press.anthr_press,
                vitality.vitality,
                abundance.abundance,
                footprint.footprint,
                pheno.pheno,
                inforesources.filename as inforesources,
                cards.photo,
                cards.year,
                cards.month,
                cards.day,
                cards.time,
                cards.habitat,
                cards.substrat,
                cards.limit_fact,
                cards.protection,
                cards.area,
                cards.quantity,
                cards.unknown_age,
                cards.unknown_sex,
                cards.males,
                cards.females,
                cards.ad,
                cards.sad,
                cards.juv,
                cards.pull,
                cards.egs,
                cards.publications,
                cards.notes,
                cards.location,
                cards.lon,
                cards.lat,
                coord_type.coord_type  
            FROM cards 
            LEFT OUTER JOIN 
                taxon ON  cards.species = taxon.id
            LEFT OUTER JOIN
                person ON cards.inserter = person.id
            LEFT OUTER JOIN
                person as person_1 ON cards.observer = person_1.id
            LEFT OUTER JOIN
                person as person_2 ON cards.identifier = person_2.id
            LEFT OUTER JOIN 
                taxa_scheme ON  cards.taxa_scheme = taxa_scheme.id
            LEFT OUTER JOIN 
                museum ON  cards.museum = museum.id
            LEFT OUTER JOIN 
                anthr_press ON  cards.anthr_press = anthr_press.id
            LEFT OUTER JOIN 
                vitality ON  cards.vitality = vitality.id
            LEFT OUTER JOIN 
                abundance ON cards.abundance = abundance.id
            LEFT OUTER JOIN 
                footprint ON cards.footprint = footprint.id
            LEFT OUTER JOIN 
                pheno ON cards.pheno = pheno.id
            LEFT OUTER JOIN 
                inforesources ON cards.inforesources = inforesources.id
            LEFT OUTER JOIN 
                coord_type ON cards.coord_type = coord_type.id
            WHERE
                cards.species IN (%s)
        ''' % ", ".join([str(num) for num in species_id])
        cards = dbsession.query(Cards).from_statement(qs).all()
        names = ['id', 'species', 'original_name', 'inserter', 'observer', 'identifier', 'taxa_scheme', 'museum',
                 'anthr_press', 'vitality', 'abundance', 'footprint', 'pheno',
                 'inforesources',
                 'photo', 'year', 'month', 'day', 'time', 'habitat', 'substrat', 'limit_fact', 'protection', 'area',
                 'quantity', 'unknown_age', 'unknown_sex', 'males', 'females', 'ad', 'sad', 'juv', 'pull', 'egs',
                 'publications', 'notes', 'location', 'lon', 'lat', 'coord_type']
        result = [names]
        for card in cards:
            row = [card.__getattribute__(attr) for attr in names]
            result.append(row)
        return result


    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла filename (с разделителями табуляция).
        
        Файл filename в формате csv, колонки:
        id  species inserter    observer    identifier  taxa_scheme museum  anthr_press vitality    abundance   footprint   pheno   inforesources   original_name   photo   year    month   day time    habitat substrat    limit_fact  protection  area    quantity    unknown_age unknown_sex males   females ad  sad juv pull    egs publications    notes   location    lon lat coord_type
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()
            reader = csv.reader(open(filename), delimiter='\t')
            row = reader.next()  # пропускаем заголовки
            records = [line for line in reader]

            for row in records:
                (
                    id, species, inserter, observer,
                    identifier, taxa_scheme, museum,
                    anthr_press, vitality, abundance,
                    footprint, pheno, inforesources,
                    original_name, photo, year, month,
                    day, time, habitat, substrat, limit_fact,
                    protection, area, quantity, unknown_age,
                    unknown_sex, males, females, ad, sad,
                    juv, pull, egs, publications, notes,
                    location, lon, lat, coord_type
                ) = [None if x == '' else x for x in row]
                card = Cards(
                    id=id,
                    species=species,
                    inserter=inserter,
                    observer=observer,
                    identifier=identifier,
                    taxa_scheme=taxa_scheme,
                    museum=museum,
                    anthr_press=anthr_press,
                    vitality=vitality,
                    abundance=abundance,
                    footprint=footprint,
                    pheno=pheno,
                    inforesources=inforesources,
                    original_name=original_name,
                    photo=photo,
                    year=year,
                    month=month,
                    day=day,
                    time=time,
                    habitat=habitat,
                    substrat=substrat,
                    limit_fact=limit_fact,
                    protection=protection,
                    area=area,
                    quantity=quantity,
                    unknown_age=unknown_age,
                    unknown_sex=unknown_sex,
                    males=males,
                    females=females,
                    ad=ad,
                    sad=sad,
                    juv=juv,
                    pull=pull,
                    egs=egs,
                    publications=publications,
                    notes=notes,
                    location=location,
                    lon=lon,
                    lat=lat,
                    coord_type=coord_type
                )
                dbsession.add(card)

    @staticmethod
    def export_to_file(filename):
        from eco.utils import csv_utf

        fieldnames = ['id', 'species', 'inserter', 'observer',
                      'identifier', 'taxa_scheme', 'museum',
                      'anthr_press', 'vitality', 'abundance',
                      'footprint', 'pheno', 'inforesources',
                      'original_name', 'photo', 'year', 'month',
                      'day', 'time', 'habitat', 'substrat', 'limit_fact',
                      'protection', 'area', 'quantity', 'unknown_age',
                      'unknown_sex', 'males', 'females', 'ad', 'sad',
                      'juv', 'pull', 'egs', 'publications', 'notes',
                      'location', 'lon', 'lat', 'coord_type']

        with open(filename, 'wb') as file:
            writer = csv_utf.UnicodeWriter(file)
            writer.writerow(fieldnames)

            dbsession = DBSession()

            cards = [[card.id,
                      card.species,
                      card.inserter,
                      card.observer,
                      card.identifier,
                      card.taxa_scheme,
                      card.museum,
                      card.anthr_press,
                      card.vitality,
                      card.abundance,
                      card.footprint,
                      card.pheno,
                      card.inforesources,
                      card.original_name,
                      card.photo,
                      card.year,
                      card.month,
                      card.day,
                      card.time,
                      card.habitat,
                      card.substrat,
                      card.limit_fact,
                      card.protection,
                      card.area,
                      card.quantity,
                      card.unknown_age,
                      card.unknown_sex,
                      card.males,
                      card.females,
                      card.ad,
                      card.sad,
                      card.juv,
                      card.pull,
                      card.egs,
                      card.publications,
                      card.notes,
                      card.location,
                      card.lon,
                      card.lat,
                      card.coord_type] for card in
                     dbsession.query(Cards).all()]

            writer.writerows(cards)


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
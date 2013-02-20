# encoding: utf-8

import csv

from sqlalchemy import Table, Column, Integer, String, Float, Boolean
from sqlalchemy import ForeignKey, Sequence

from sqlalchemy.orm import relationship

import osgeo.ogr as ogr
import osgeo.osr as osr

from geoalchemy import GeometryColumn, Polygon, GeometryDDL, WKTSpatialElement

from eco.models import DBSession, Base
from eco.models import Key_area
from eco.models import NoResultFound


from eco.utils.jsonify import JsonifyMixin

# Таблица для связи многие-ко-многим для ключевых участков и полигонов
square_keyarea_association = Table('square_karea_association', Base.metadata,
    Column('square_id', Integer, ForeignKey('square.id')),
    Column('key_area_id', Integer, ForeignKey('key_area.id'))
)

class Squares(Base, JsonifyMixin):
    __tablename__ = 'square'
    id = Column(Integer, Sequence('square_id_seq', start=100000), primary_key=True)
    key_areas = relationship('Key_area', secondary=square_keyarea_association, backref='squares')
    geom = GeometryColumn(Polygon(dimension=2, srid=3857))
    
    @staticmethod        
    def add_from_file(associations_filename, shp_filename):
        '''
        Добавить данные из shp-файла shp_filename. Первое поле аттрибутивной таблицы--идентификатор.
        
        Одновременно добавляются в таблицу связи данные из файла с разделителями associations_filename.
        Файл filename в формате csv (разделитель табуляция), колонки:
        square_id   key_area_id
        '''
        dbsession = DBSession()
        
        ogrData = ogr.Open(shp_filename)
        layer = ogrData.GetLayer(0)
        sq = layer.GetNextFeature()
        while sq is not None:
            id = sq.GetFieldAsString(0)
            geom = sq.GetGeometryRef()
            geom = geom.ExportToWkt()
            square = Squares(id=id, geom=WKTSpatialElement(geom, srid=3857))
            dbsession.add(square)
            
            sq = layer.GetNextFeature()
        dbsession.flush()
        
        reader = csv.reader(open(associations_filename), delimiter='\t')
        row = reader.next() # пропускаем заголовки
        records = [line for line in reader]
        
        for id, key_area_id in records:
            # Определим ключевоq уч-к по его id
            key_a = dbsession.query(Key_area).filter_by(id = key_area_id).one()
            # Определим полигон по его id
            square = dbsession.query(Squares).filter_by(id=id).one()
            square.key_areas.append(key_a)

        dbsession.flush()
    
GeometryDDL(Squares.__table__)





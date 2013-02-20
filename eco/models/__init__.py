# encoding: utf-8

from sqlalchemy.orm import scoped_session, sessionmaker
from zope.sqlalchemy import ZopeTransactionExtension

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm.exc import MultipleResultsFound, NoResultFound

DBSession    = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base         = declarative_base()

from taxons import Taxon, Synonym, TAXON_ID_QUERY, TAXON_ALL_QUERY, TAXON_TYPES, MAMMALIA, AVES, PLANTAE, ARA, ARTHROPODA, MOSS, LICHENES, ORG_TYPES
from references import (
    Person, Taxa_scheme, Museum, Coord_type, Anthr_press, Vitality, 
    Abundance, Footprint, Pheno, Doc_type, Inforesources,
    Area_type, Legend, Key_area
)
from cards import Cards
from annotations import Annotation
from squares import Squares, square_keyarea_association

from security import User

def table_by_name(table):
    '''
    Возвращает модель по имени таблицы
    '''
    # отображение названия таблицы в класс таблицы
    tables_map = {
        # Таксоны
        Taxon.__tablename__:    Taxon,
        Synonym.__tablename__: Synonym,
        # Карточки наблюдений
        Cards.__tablename__:    Cards,
        # Анн. списки
        Annotation.__tablename__: Annotation,
        
        
        # Справочники
        Person.__tablename__:       Person,
        Taxa_scheme.__tablename__:  Taxa_scheme,
        Museum.__tablename__:       Museum,
        Coord_type.__tablename__:   Coord_type,
        Anthr_press.__tablename__:  Anthr_press,
        Vitality.__tablename__:     Vitality,
        Abundance.__tablename__:    Abundance,
        Inforesources.__tablename__: Inforesources,
        Pheno.__tablename__:        Pheno,
        Key_area.__tablename__:     Key_area,
        Area_type.__tablename__:    Area_type,
        #Doc_type.__tablename__:     Doc_type,
        Footprint.__tablename__:    Footprint,
        Legend.__tablename__:       Legend,
        #Squares.__tablename__:      Squares,
        Taxa_scheme.__tablename__:  Taxa_scheme,
        
        # Пользователи
        User.__tablename__:         User,
    }
    try:
        result = tables_map[table]
    except KeyError:
        raise NameError("ModelNameError")
    return result



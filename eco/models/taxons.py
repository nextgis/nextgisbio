# encoding: utf-8
import csv

from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy import ForeignKey, Sequence, UniqueConstraint

from eco.models import DBSession, Base
from eco.utils.jsonify import JsonifyMixin


######################################
# Таксоны
######################################

# Иерархия таксонов
TAXON_TYPES = ('Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species')

# строки SQL-запроса таксонов-потомков
# Нужна для ускорения поиска при рекурсивных запросах
# Используются в качестве подзапросов.
# Выбор id
TAXON_ID_QUERY = """WITH RECURSIVE subtree AS
        (
          SELECT * FROM taxon WHERE id IN (%s)
          UNION ALL
          SELECT t.*
          FROM
            taxon AS t, subtree AS st
          WHERE  (t.parent_id = st.id)
        )
        SELECT DISTINCT id FROM subtree WHERE taxon_type='%s'"""
# Выбор всех полей
TAXON_ALL_QUERY = """WITH RECURSIVE subtree AS
        (
          SELECT * FROM taxon WHERE id IN (%s)
          UNION ALL
          SELECT t.*
          FROM
            taxon AS t, subtree AS st
          WHERE  (t.parent_id = st.id)
        )
        SELECT DISTINCT * FROM subtree WHERE taxon_type='%s'"""

# Различные виды организмов
MAMMALIA = ("Mammalia", )
AVES = ("Aves", )
PLANTAE = ('Cycadophyta', 'Equisetophyta', 'Gnetophyta', 'Lycopodiophyta', 'Magnoliophyta', 'Pinophyta', 'Pteridophyta')
ARA = ('Amphibia', 'Reptilia', 'Actinopterygii', 'Cephalaspidomorphi')
ARTHROPODA = ("Arthropoda", )
MOSS = ('Bryophyta', 'Marchantiophyta')
LICHENES = ('Ascomycota', 'Basidiomycota', 'Mycetozoa')

ORG_TYPES = ('mammalia', 'aves', 'plantae', 'ara', 'arthropoda', 'moss', 'lichenes')


class Taxon(Base, JsonifyMixin):
    __tablename__ = 'taxon'
    __table_args__ = (
        UniqueConstraint('old_id', 'taxon_type'),
    )

    id = Column(Integer, Sequence('taxon_id_seq', start=100000), primary_key=True)
    parent_id = Column(Integer, ForeignKey('taxon.id'), nullable=True)
    old_id = Column(Integer)  # id таксона в таблице-источнике (MS ACCESS)

    taxon_type = Column(Enum(*TAXON_TYPES, native_enum=False))
    name = Column(String, nullable=False)
    russian_name = Column(String)
    author = Column(String)
    source = Column(String)

    @staticmethod
    def parent_taxon_class(taxon_name):
        '''
        По типу таксона возвращает родительский тип
        '''
        index = TAXON_TYPES.index(taxon_name)
        if index > 0:
            return TAXON_TYPES[index - 1]
        else:
            return None

    @staticmethod
    def species_by_taxon(taxon_ids):
        '''
        Возвращает список видов (species),
        которые являются потомками таксонов, указанных в списке taxon_ids
        '''
        dbsession = DBSession()
        qs = TAXON_ALL_QUERY % (", ".join([str(num) for num in taxon_ids]), TAXON_TYPES[len(TAXON_TYPES) - 1]) + ';'
        taxons = dbsession.query(Taxon.id, Taxon.taxon_type, Taxon.name, Taxon.author, Taxon.source).from_statement(
            qs).all()
        taxons = [{'id': t[0], 'taxon_type': t[1], 'name': t[2], 'author': t[3], 'source': t[4]} for t in taxons]
        return taxons


    @staticmethod
    def parent_taxons(taxon_id):
        '''
        Возвращает родительские таксоны данного таксона.
        '''

        dbsession = DBSession()
        qs = '''
        WITH RECURSIVE subtree AS
            (
              SELECT * FROM taxon WHERE id=%s
              UNION ALL
              SELECT t.*
              FROM
                taxon AS t, subtree AS st
              WHERE  (st.parent_id = t.id)
            )
            SELECT * FROM subtree ;
        ''' % (taxon_id, )

        taxons = dbsession.query(Taxon).from_statement(qs).all()
        # Отсортируем таксоны так, чтобы на первом месте списка шли царства, на последнем -- виды.
        taxons.sort(key=lambda x: TAXON_TYPES.index(x.taxon_type))

        return taxons

    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу таксонов из файла filename (разделители - табуляция).
        
        Файл filename в формате csv, колонки:
        id  parent_id   old_id  taxon_type  name    russian_name    author  source
        '''
        dbsession = DBSession()

        reader = csv.reader(open(filename), delimiter='\t')
        row = reader.next()  # пропускаем заголовки
        records = [line for line in reader]
        for row in records:
            id, parent_id, old_id, taxon_type, name, russian_name, author, source = [None if x == '' else x for x in
                                                                                     row]
            taxon = Taxon(
                id=id,
                parent_id=parent_id,
                old_id=old_id,
                taxon_type=taxon_type,
                name=name,
                russian_name=russian_name,
                author=author,
                source=source
            )
            dbsession.add(taxon)
        dbsession.flush()

    @staticmethod
    def export_to_file(filename):
        from eco.utils.dump_to_file import dump

        fieldnames = [
            'id',
            'parent_id',
            'old_id',
            'taxon_type',
            'name',
            'russian_name',
            'author',
            'source'
        ]
        dump(filename, fieldnames, DBSession().query(Taxon).all())

    def __repr__(self):
        return "<Taxon('%s')>" % (self.name, )

    def is_last_taxon(self):
        '''
        Последний таксон иерархии?
        '''
        return self.taxon_type == TAXON_TYPES[len(TAXON_TYPES) - 1]

    def child_of(self, taxon_id):
        '''
        Возвращает истину, если данный таксон является дочерним таксоном от таксона taxon_id
        '''
        return taxon_id in [t.id for t in Taxon.parent_taxons(self.id)[:-1]]

    def __parent_in_list__(self, list):
        '''
        Возвращает истину, если данный таксон является дочерним таксоном от
        одного из таксонов, чьи названия перечисленны в списке list
        '''
        dbsession = DBSession()
        target = dbsession.query(Taxon).filter(Taxon.name.in_(list)).all()
        target_ids = [t.id for t in target]
        for id in target_ids:
            if self.child_of(id): return True
        return False

    def is_mammalia(self):
        '''
        является ли данный таксон млекопитающим
        '''
        return self.__parent_in_list__(MAMMALIA)


    def is_aves(self):
        '''
        является ли данный таксон птицей
        '''
        return self.__parent_in_list__(AVES)

    def is_plantae(self):
        '''
        является ли данный таксон растением
        '''
        return self.__parent_in_list__(PLANTAE)

    def is_ara(self):
        '''
        является ли данный таксон рептилией, амфибией или рыбой
        '''
        return self.__parent_in_list__(ARA)

    def is_arthropoda(self):
        '''
        является ли данный таксон членистоногим
        '''
        return self.__parent_in_list__(ARTHROPODA)

    def is_moss(self):
        '''
        является ли данный таксон мохом
        '''
        return self.__parent_in_list__(MOSS)

    def is_lichenes(self):
        '''
        является ли данный таксон лишайником, слизевиком или грибом
        '''
        return self.__parent_in_list__(LICHENES)


class Synonym(Base):
    """
    Таблица синонимов
    """
    __tablename__ = 'synonym'

    id = Column(Integer, Sequence('synonym_id_seq', start=100000), primary_key=True)
    species_id = Column(Integer, ForeignKey('taxon.id'), nullable=False)
    synonym = Column(String, nullable=False)
    author = Column(String)
    source = Column(String)

    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу синонимов таксонов из файла filename (разделители - табуляция).
        
        Файл filename в формате csv, колонки:
        id  species_id  synonym author  source
        '''
        dbsession = DBSession()

        reader = csv.reader(open(filename), delimiter='\t')
        row = reader.next()  # пропускаем заголовки
        records = [line for line in reader]

        for row in records:
            id, species_id, synonym, author, source = [None if x == '' else x for x in row]
            synonym = Synonym(id=id, species_id=species_id, synonym=synonym, author=author, source=source)
            dbsession.add(synonym)
        dbsession.flush()

    @staticmethod
    def export_to_file(filename):
        from eco.utils.dump_to_file import dump

        fieldnames = [
            'id',
            'species_id',
            'synonym',
            'author',
            'source'
        ]
        dump(filename, fieldnames, DBSession().query(Synonym).all())

    def __repr__(self):
        return "<Synonym('%s')>" % (self.synonym, )


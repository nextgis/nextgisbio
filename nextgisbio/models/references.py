# encoding: utf-8

import csv

from sqlalchemy import Column, Integer, String, Float, Boolean, Enum, ForeignKey, Sequence
from sqlalchemy.orm import relationship

from nextgisbio.models import DBSession, Base, ORG_TYPES
from nextgisbio.utils.jsonify import JsonifyMixin


###################################################
# Таблицы-справочники
###################################################

class Person(Base, JsonifyMixin):
    '''
    Научный работник
    '''
    __tablename__ = 'person'
    id = Column(Integer, Sequence('person_id_seq', start=1), primary_key=True)
    name = Column(String, nullable=False)
    fullname = Column(String)
    speciality = Column(String)
    degree = Column(String)
    organization = Column(String)
    position = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    user = relationship('User', uselist=False, back_populates="person")
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  name    fullname    speciality  degree  organization    position    email   phone   address
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            row = reader.next() # пропускаем заголовки
            records = [line for line in reader]

            for (id, name, fullname, speciality, degree, organization, position, email, phone, address) in records:
                person = Person(
                    name=name,
                    fullname=fullname,
                    speciality=speciality,
                    degree=degree,
                    organization=organization,
                    position=position,
                    email=email,
                    phone=phone,
                    address=address
                )
                dbsession.add(person)

    def __repr__(self):
        return "<Person ('%s') >" % (self.name, )

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'name', 'fullname', 'speciality', 'degree', 'organization', 'position', 'email', 'phone',
                      'address']
        dbsession = DBSession()
        dump(filename, fieldnames, dbsession.query(Person).order_by(Person.id).all())


class Taxa_scheme(Base, JsonifyMixin):
    '''
    Таксономическая схема
    '''
    __tablename__ = 'taxa_scheme'
    id = Column(Integer, Sequence('taxa_scheme_id_seq', start=1), primary_key=True)
    taxa_scheme = Column(String, nullable=False, unique=True)
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  taxa_scheme
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]

            for id, t_scheme in records:
                t = Taxa_scheme(taxa_scheme=t_scheme)
                dbsession.add(t)
        
    def __repr__(self):
        return "<Taxa_sceme('%s') >" % (self.taxa_scheme, )

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'taxa_scheme']
        dump(filename, fieldnames, DBSession().query(Taxa_scheme).order_by(Taxa_scheme.id).all())


class Museum(Base, JsonifyMixin):
    '''
    Музейные образцы
    '''
    __tablename__ = 'museum'
    id = Column(Integer, Sequence('museum_id_seq', start=1), primary_key=True)
    museum = Column(String, nullable=False, unique=True)
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  museum
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]

            for id, m in records:
                museum = Museum(museum=m)
                dbsession.add(museum)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'museum']
        dump(filename, fieldnames, DBSession().query(Museum).order_by(Museum.id).all())

    def __repr__(self):
        return "<Museum('%s') >" % (self.museum, )


class Coord_type(Base, JsonifyMixin):
    '''
    Тип координат
    '''
    __tablename__ = 'coord_type'
    id = Column(Integer, Sequence('coord_type_id_seq', start=1), primary_key=True)
    coord_type = Column(String, nullable=False, unique=True)
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  coord_type
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]
            for id, ct in records:
                coord_type = Coord_type(coord_type=ct)
                dbsession.add(coord_type)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'coord_type']
        dump(filename, fieldnames, DBSession().query(Coord_type).order_by(Coord_type.id).all())

    def __repr__(self):
        return "<Coord_type('%s') >" % (self.coord_type, )


class Anthr_press(Base, JsonifyMixin):
    '''
    Антропогенная нагрузка
    '''
    __tablename__ = 'anthr_press'
    id = Column(Integer, Sequence('anthr_press_id_seq', start=1), primary_key=True)
    anthr_press = Column(String, nullable=False, unique=True)
    description = Column(String)
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  anthr_press description
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]
            for id, ap, desc in records:
                an_p = Anthr_press(anthr_press=ap, description=desc)
                dbsession.add(an_p)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'anthr_press', 'description']
        dump(filename, fieldnames, DBSession().query(Anthr_press).order_by(Anthr_press.id).all())

    def __repr__(self):
        return "<Anthr_press('%s') >" % (self.anthr_press, )


class Vitality(Base, JsonifyMixin):
    '''
    Состояние популяции
    '''
    __tablename__ = 'vitality'
    id = Column(Integer, Sequence('vitality_id_seq', start=1), primary_key=True)
    vitality = Column(String, nullable=False)
    org_type = Column(Enum(*ORG_TYPES, native_enum=False))
    description = Column(String)

    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  vitality    org_type    description
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]
            for id, vit, t, descr in records:
                vit = Vitality(vitality=vit, description=descr, org_type= t)
                dbsession.add(vit)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'vitality', 'org_type', 'description']
        dump(filename, fieldnames, DBSession().query(Vitality).order_by(Vitality.id).all())

    def __repr__(self):
        return "<Vitality('%s') >" % (self.vitality, )

        
class Abundance(Base, JsonifyMixin):
    '''
    Обилие
    '''
    __tablename__ = 'abundance'
    id = Column(Integer, Sequence('abundance_id_seq', start=1), primary_key=True)
    abundance = Column(String, nullable=False, unique=True)
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  abundance
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]
            for id, ab in records:
                abn = Abundance(abundance=ab)
                dbsession.add(abn)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'abundance']
        dump(filename, fieldnames, DBSession().query(Abundance).order_by(Abundance.id).all())

    def __repr__(self):
        return "<Abundance('%s') >" % (self.abundance, )

        
class Footprint(Base, JsonifyMixin):
    '''
    Следы жизнедеятельности
    '''
    __tablename__ = 'footprint'
    id = Column(Integer, Sequence('footprint_id_seq', start=1), primary_key=True)
    footprint = Column(String, nullable=False)
    org_type = Column(Enum(*ORG_TYPES, native_enum=False))
    description = Column(String)
    
    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  footprint   org_type    description
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]
            for id, fpr, t, desc in records:
                fp = Footprint(footprint=fpr, description=desc, org_type=t)
                dbsession.add(fp)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'footprint', 'org_type', 'description']
        dump(filename, fieldnames, DBSession().query(Footprint).order_by(Footprint.id).all())

    def __repr__(self):
        return "<Footprint('%s') >" % (self.footprint, )
       
        
class Pheno(Base, JsonifyMixin):
    '''
    Фаза жизненного цикла
    '''
    __tablename__ = 'pheno'
    id = Column(Integer, Sequence('pheno_id_seq', start=1), primary_key=True)
    pheno = Column(String, nullable=False, unique=True)
    description = Column(String)
    org_type = Column(Enum(*ORG_TYPES, native_enum=False))

    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  pheno   description org_type
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]
            for id, p, desc, t in records:
                ph = Pheno(pheno=p, description=desc, org_type=t)
                dbsession.add(ph)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'pheno', 'description', 'org_type']
        dump(filename, fieldnames, DBSession().query(Pheno).order_by(Pheno.id).all())

    def __repr__(self):
        return "<Pheno('%s') >" % (self.pheno, )


class Doc_type(Base, JsonifyMixin):
    '''
    Тип документа
    '''
    __tablename__ = 'doc_type'
    id = Column(Integer, Sequence('doc_type_id_seq', start=1), primary_key=True)
    doc_type = Column(String, nullable=False, unique=True)
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        idDocType,docType
        '''
        dbsession = DBSession()
        
        reader = csv.reader(open(filename), delimiter=',')
        reader.next()
        records = [line for line in reader]
        for id, dt in records:
            dtp = Doc_type(doc_type=dt)
            dbsession.add(dtp)
        dbsession.flush()

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'doc_type']
        dump(filename, fieldnames, DBSession().query(Doc_type).all())

    def __repr__(self):
        return "<Doc_type('%s') >" % (self.doc_type, )


class Inforesources(Base, JsonifyMixin):
    '''
    Источники информации
    '''
    __tablename__ = 'inforesources'
    id = Column(Integer, Sequence('inforesources_id_seq', start=1), primary_key=True)
    doc_type_id = Column(Integer, ForeignKey('doc_type.id'))
    filename = Column(String, nullable=False, unique=True)
    fullname = Column(String)
    author = Column(String)
    magazine = Column(String)
    pages = Column(String)
    mammals = Column(String)
    birds = Column(String)
    reptiles = Column(String)
    amphibians = Column(String)
    fish = Column(String)
    invertebrates = Column(String)
    vascular = Column(String)
    bryophytes = Column(String)
    lichens = Column(String)
    fungi = Column(String)
    maps = Column(String)
    
    @staticmethod        
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  doc_type_id filename    fullname    author  magazine    pages   mammals birds   reptiles    amphibians  fish    invertebrates   vascular    bryophytes  lichens fungi   maps
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]
            for row in records:
                (
                    id,
                    doc_type_id,
                    filename,
                    fullname,
                    author,
                    magazine,
                    pages,
                    mammals,
                    birds,
                    reptiles,
                    amphibians,
                    fish,
                    invertebrates,
                    vascular,
                    bryophytes,
                    lichens,
                    fungi,
                    maps
                ) = [None if x == '' else x for x in row]
                infores = Inforesources(
                    doc_type_id=doc_type_id,
                    filename=filename,
                    fullname=fullname,
                    author=author,
                    magazine=magazine,
                    pages=pages,
                    mammals=mammals,
                    birds=birds,
                    reptiles=reptiles,
                    amphibians=amphibians,
                    fish=fish,
                    invertebrates=invertebrates,
                    vascular=vascular,
                    bryophytes=bryophytes,
                    lichens=lichens,
                    fungi=fungi,
                    maps=maps
                )
                dbsession.add(infores)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'doc_type_id', 'filename', 'fullname',
                'author', 'magazine', 'pages', 'mammals', 'birds',
                'reptiles', 'amphibians', 'fish', 'invertebrates', 'vascular',
                'bryophytes', 'lichens', 'fungi', 'maps']
        dump(filename, fieldnames, DBSession().query(Inforesources).order_by(Inforesources.id).all())

    def __repr__(self, filename):
        return "<Inforesources('%s') >" % (self.filename, )


class Legend(Base, JsonifyMixin):
    '''
    Пояснение поля Precision в таблице ключевых участков
    '''    
    __tablename__ = 'legend'
    id = Column(Integer, Sequence('legend_id_seq', start=1), primary_key=True)
    precision = Column(Integer, nullable=False, unique=True) # код точности
    count = Column(String, nullable=False, unique=True)  # Количество квадратиков
    description = Column(String, nullable=False, unique=True)  # Пояснения
    
    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        Файл filename в формате csv, колонки:
        id  precision   count   description
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]

            for id, p, c, d in records:
                leg = Legend(precision=p, count=c, description=d)
                dbsession.add(leg)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'precision', 'count', 'description']
        dump(filename, fieldnames, DBSession().query(Legend).order_by(Legend.id).all())

    def __repr__(self):
        return "<Legend('%s') >" % (self.count, )


class Area_type(Base, JsonifyMixin):
    '''
    Пояснение поля Precision в таблице ключевых участков
    '''    
    __tablename__ = 'area_type'
    id = Column(Integer, Sequence('area_type_id_seq', start=1), primary_key=True)
    area_type = Column(String, nullable=False, unique=True)  # Пояснения
    
    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  area_type
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]

            for id, t in records:
                a_type = Area_type(area_type=t)
                dbsession.add(a_type)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'area_type']
        dump(filename, fieldnames, DBSession().query(Area_type).order_by(Area_type.id).all())

    def __repr__(self):
        return "<Area_type('%s') >" % (self.area_type, )


class Key_area(Base, JsonifyMixin):
    '''
    Ключевые участки
    '''    
    __tablename__ = 'key_area'
    id = Column(Integer, Sequence('key_area_id_seq', start=1), primary_key=True)
    area_type = Column(Integer, ForeignKey('area_type.id'))
    legend = Column(Integer, ForeignKey('legend.id'))
    name = Column(String, nullable=False, unique=True)

    @staticmethod
    def add_from_file(filename):
        '''
        Добавить данные в таблицу из файла с разделителями filename.
        
        Файл filename в формате csv, колонки:
        id  area_type   legend  name
        '''
        import transaction
        with transaction.manager:
            dbsession = DBSession()

            reader = csv.reader(open(filename), delimiter='\t')
            reader.next()
            records = [line for line in reader]

            for id, atype_id, pr_id, k in records:
                key_a = Key_area(area_type=atype_id, legend=pr_id, name=k)
                dbsession.add(key_a)

    @staticmethod
    def export_to_file(filename):
        from nextgisbio.utils.dump_to_file import dump
        fieldnames = ['id', 'area_type', 'legend', 'name']
        dump(filename, fieldnames, DBSession().query(Key_area).order_by(Key_area.id).all())

    def __repr__(self):
        return "<Key_area('%s') >" % (self.id, )

    def get_annotations(self):
        '''
        Возвращает аннотированые списки, связанные с ключевым участком
        '''
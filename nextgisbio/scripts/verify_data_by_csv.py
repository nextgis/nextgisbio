# encoding: utf-8

from os import path
import os
import csv


import os
import sys

from sqlalchemy import engine_from_config
from sqlalchemy.sql.operators import eq
from sqlalchemy.orm import aliased
from pyramid.paster import (
    get_appsettings,
    setup_logging,
)

from nextgisbio.models import (
    DBSession, Base,
    Taxon, Synonym, Cards,
    Person, Taxa_scheme, Museum, Coord_type, Anthr_press, Vitality,
    Abundance, Footprint, Pheno, Inforesources,
    Area_type, Legend, Key_area,
    Annotation,
    Squares, User
)
from nextgisbio.models.red_books import RedBook
from nextgisbio.models.image import Images, CardsImages

data = {}

id_verify_conditions = [
    {
        'main': {
            'csv': {
                'file': 'footprint.csv',
                'id': 0,
                'name': 1,
            },
            'db': {
                'table': Footprint,
                'id': Footprint.id,
                'name': Footprint.footprint
            }
        },
        'dependency': [
            {
                'csv': {
                    'id': ('cards.csv', 10)
                },
                'db': {
                    'table': Cards,
                    'id': Cards.footprint
                }
            }
        ]
    },

    # person.csv
    {
        'main': {
            'csv': {
                'file': 'person.csv',
                'id': 0,
                'name': 1,
            },
            'db': {
                'table': Person,
                'id': Person.id,
                'name': Person.name
            }
        },
        'dependency': [
            {
                'csv': {
                    'id': ('user.csv', 3)
                },
                'db': {
                    'table': User,
                    'id': User.person_id
                }
            },
            {
                'csv': {
                    'id': ('annotation.csv', 2)
                },
                'db': {
                    'table': Annotation,
                    'alias': aliased(Person),
                    'joined': Annotation.inserter
                }
            },
            {
                'csv': {
                    'id': ('cards.csv', 2)
                },
                'db': {
                    'table': Cards,
                    'alias': aliased(Person),
                    'joined': Cards.inserter
                }
            },
            {
                'csv': {
                    'id': ('cards.csv', 3)
                },
                'db': {
                    'table': Cards,
                    'alias': aliased(Person),
                    'joined': Cards.observer
                }
            },
            {
                'csv': {
                    'id': ('cards.csv', 4)
                },
                'db': {
                    'table': Cards,
                    'alias': aliased(Person),
                    'joined': Cards.identifier
                }
            }
        ]
    },

    # {
    #     'id': ('cards.csv', 'id', 0),
    #     'affected': [
    #         ('cards_images.csv', 'card_id', 0)
    #     ]
    # },
    # {
    #     'id': ('taxon.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'species', 1),
    #         ('synonym.csv', 'species_id', 1),
    #         ('annotation.csv', 'species', 1),
    #         ('taxon.csv', 'parent_id', 1)
    #     ]
    # },
    # {
    #     'id': ('footprint.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'footprint', 10)
    #     ]
    # },
    # {
    #     'id': ('vitality.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'vitality', 8)
    #     ]
    # },
    # {
    #     'id': ('taxa_scheme.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'taxa_scheme', 5)
    #     ]
    # },
    # {
    #     'id': ('synonym.csv', 'id', 0),
    #     'affected': []
    # },
    # {
    #     'id': ('person.csv', 'id', 0),
    #     'affected': [
    #         ('user.csv', 'person_id', 3)
    #     ]
    # },
    # {
    #     'id': ('key_area.csv', 'id', 0),
    #     'affected': [
    #         ('square_karea_association.csv', 'key_area_id', 1),
    #         ('annotation.csv', 'key_area', 3)
    #     ]
    # },
    # {
    #     'id': ('area_type.csv', 'id', 0),
    #     'affected': [
    #         ('key_area.csv', 'area_type', 1)
    #     ]
    # },
    # {
    #     'id': ('abundance.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'abundance', 9)
    #     ]
    # },
    # {
    #     'id': ('anthr_press.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'anthr_press', 7)
    #     ]
    # },
    # {
    #     'id': ('images.csv', 'id', 0),
    #     'affected': [
    #         ('cards_images.csv', 'image_id', 1)
    #     ]
    # },
    # {
    #     'id': ('coord_type.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'coord_type', 38)
    #     ]
    # },
    # {
    #     'id': ('inforesources.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'inforesources', 12),
    #         ('annotation.csv', 'biblioref', 6)
    #     ]
    # },
    # {
    #     'id': ('legend.csv', 'id', 0),
    #     'affected': [
    #         ('key_area.csv', 'legend', 2)
    #     ]
    # },
    # {
    #     'id': ('museum.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'museum', 6)
    #     ]
    # },
    # {
    #     'id': ('person.csv', 'id', 0),
    #     'affected': [
    #         ('user.csv', 'person_id', 3),
    #         ('annotation.csv', 'inserter', 2),
    #         ('annotation.csv', 'identifier', 4),
    #         ('annotation.csv', 'collecter', 5),
    #         ('cards.csv', 'inserter', 2),
    #         ('cards.csv', 'observer', 3),
    #         ('cards.csv', 'identifier', 4),
    #     ]
    # },
    # {
    #     'id': ('pheno.csv', 'id', 0),
    #     'affected': [
    #         ('cards.csv', 'pheno', 11)
    #     ]
    # }
]


def parse_data(initial_data_dir_name):
    for csv_file in os.listdir(initial_data_dir_name):
        path_csv_file = path.join(initial_data_dir_name, csv_file)
        reader = csv.reader(open(path_csv_file), delimiter='\t')

        records = [line for line in reader]

        data[csv_file] = records

        data[csv_file] = {
            'fields': records[0],
            'records': records[1:]
        }

        print '%s parsed' % csv_file


def verify_ids():
    session = DBSession()

    for condition in id_verify_conditions:
        print '--------------------'
        print condition['main']['csv']['file']
        print '--------------------'
        print '\n'

        for csv_row in data[condition['main']['csv']['file']]['records']:
            csv_id, entity_name = csv_row[condition['main']['csv']['id']],\
                                  csv_row[condition['main']['csv']['name']]

            db_entities = session.query(condition['main']['db']['table'])\
                .filter(eq(condition['main']['db']['name'], entity_name))\
                .all()

            if len(db_entities) != 1:
                raise Exception()

            db_entity_id = db_entities[0].id

            print '\n'
            print entity_name

            for dependency in condition['dependency']:
                csv_dependency_records = data[dependency['csv']['id'][0]]['records']
                count_dependency_records = 0
                db_dependency_entities = session.query(dependency['db']['table'])

                if 'alias' in dependency['db']:
                    alias = dependency['db']['alias']
                    db_dependency_entities = db_dependency_entities.outerjoin(alias, dependency['db']['joined'] == alias.id)
                    db_dependency_entities = db_dependency_entities.filter(eq(dependency['db']['alias'].id, db_entity_id))
                else:
                    db_dependency_entities = db_dependency_entities.filter(eq(dependency['db']['id'], db_entity_id))

                db_dependency_entities = db_dependency_entities.all()

                for csv_dep_record in csv_dependency_records:
                    if csv_dep_record[dependency['csv']['id'][1]] == csv_id:
                        count_dependency_records += 1

                # if len(db_dependency_entities) == count_dependency_records:
                #     print ''

                print condition['main']['csv']['file'] + ' -> ' + dependency['csv']['id'][0]
                print 'db: ' + str(len(db_dependency_entities))
                print 'csv: ' + str(count_dependency_records)


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri> --make-id-start-0\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) != 2 and len(argv) != 3:
        usage(argv)
    config_uri = argv[1]
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    script_dir = os.path.dirname(__file__)
    rel_path_source_data = "../source_data/"
    source_data_dir = os.path.join(script_dir, rel_path_source_data)
    parse_data(source_data_dir)
    verify_ids()


if __name__ == "__main__":
    main()

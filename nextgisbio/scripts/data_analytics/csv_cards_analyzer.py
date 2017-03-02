# encoding: utf-8

from os import path
import os
import csv


import os
import sys

from sqlalchemy import engine_from_config
from sqlalchemy.sql.operators import eq
from sqlalchemy.orm import aliased
import transaction
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

from operator import itemgetter

from csv_parser import parse_data

conf_parser = {
    'csv': True
}

data_structure = [
    {
        'main': {
            'table': 'cards.csv',
            'field': 'inserter',
            'db_table': Cards,
            'db_table_id': Cards.inserter
        },
        'relation': {
            'table': 'person.csv',
            'id_field': 'id',
            'name_field': 'name',
            'db_table': Person,
            'db_table_id': Person.id,
            'db_table_name': Person.name
        }
    },
    {
        'main': {
            'table': 'cards.csv',
            'field': 'abundance',
            'db_table': Cards,
            'db_table_id': Cards.abundance
        },
        'relation': {
            'table': 'abundance.csv',
            'id_field': 'id',
            'name_field': 'abundance',
            'db_table': Abundance,
            'db_table_id': Abundance.id,
            'db_table_name': Abundance.abundance
        }
    },
]


def analyze(csv_data):
    for data_structure_item in data_structure:
        if 'csv' in conf_parser:
            csv_handle(csv_data, data_structure_item)
        if 'db' in conf_parser:
            db_handle(csv_data, data_structure_item)


def csv_handle(csv_data, data_structure_item):
    main_table = csv_data[data_structure_item['main']['table']]
    relation_table = csv_data[data_structure_item['relation']['table']]

    main_field = data_structure_item['main']['field']
    main_index_field = main_table['fields'].index(main_field)

    relation_id_field_name = data_structure_item['relation']['id_field']
    relation_id_field_index = relation_table['fields'].index(relation_id_field_name)
    relation_name_field_name = data_structure_item['relation']['name_field']
    relation_name_field_index = relation_table['fields'].index(relation_name_field_name)

    relation_ids_aggregated = {}
    for record in main_table['records']:
        if record[main_index_field] == '':
            continue
        main_relation_id = int(record[main_index_field])
        if main_relation_id in relation_ids_aggregated:
            relation_ids_aggregated[main_relation_id] += 1
        else:
            relation_ids_aggregated[main_relation_id] = 1

    relation_aggregated = []
    for record in relation_table['records']:
        relation_id = record[relation_id_field_index]
        relation_name = record[relation_name_field_index]
        if relation_id in relation_ids_aggregated:
            relation_aggregated.append([
                str(relation_id) + ' - ' + relation_name + ' = ',
                relation_ids_aggregated[relation_id]
            ])
        else:
            relation_aggregated.append([
                str(relation_id) + ' - ' + relation_name + ' = ',
                0
            ])

    relation_aggregated = sorted(relation_aggregated, key=itemgetter(1), reverse=True)

    print '\n -------------------'
    print data_structure_item['main']['table'] + ' -> ' + data_structure_item['relation']['table']
    print 'by field "' + main_field + '"'
    print '-------------------'

    for result_item in relation_aggregated:
        print result_item[0] + str(result_item[1])


def db_handle(csv_data, data_structure_item):
    main_field = data_structure_item['main']['field']
    main_table = data_structure_item['main']['db_table']
    relation_table = data_structure_item['relation']['db_table']
    relation_table_name = data_structure_item['relation']['db_table_name']
    left_field = data_structure_item['main']['db_table_id']
    right_field = data_structure_item['relation']['db_table_id']

    session = DBSession()
    db_items = session.query(main_table, left_field, relation_table_name)\
        .outerjoin(relation_table, left_field == right_field)\
        .all()

    relation_db_aggregated = {}
    for db_item in db_items:
        relation_db_id = db_item[1]
        if relation_db_id in relation_db_aggregated:
            relation_db_aggregated[relation_db_id]['count'] += 1
        else:
            relation_db_aggregated[relation_db_id] = {
                'name': db_item[2],
                'count': 1
            }

    print '\n -------------------'
    print data_structure_item['main']['table'] + ' -> ' + data_structure_item['relation']['table']
    print 'by field "' + main_field + '"'
    print '-------------------'

    for k in relation_db_aggregated:
        print u'{0} - {1} = {2}'.format(k, relation_db_aggregated[k]['name'], relation_db_aggregated[k]['count'])


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri> --make-id-start-0\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) != 2 and len(argv) != 3:
        usage(argv)
    config_uri = argv[1]
    conf_parser_args = argv[2]
    conf_parser = dict((k, True) for k in conf_parser_args.split(','))
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    script_dir = os.path.dirname(__file__)
    rel_path_source_data = "./csv/"
    source_data_dir = os.path.join(script_dir, rel_path_source_data)
    csv_data = parse_data(source_data_dir)
    analyze(csv_data)


if __name__ == "__main__":
    main()

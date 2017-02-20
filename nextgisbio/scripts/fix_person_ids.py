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

data = {}


def parse_data(initial_data_dir_name):
    for csv_file in os.listdir(initial_data_dir_name):
        path_csv_file = path.join(initial_data_dir_name, 'person.csv')
        reader = csv.reader(open(path_csv_file), delimiter='\t')

        records = [line for line in reader]

        data[csv_file] = records

        data[csv_file] = {
            'fields': records[0],
            'records': records[1:]
        }

        for record in data[csv_file]['records']:
            record[0] = int(record[0])

        from operator import itemgetter
        data[csv_file]['records'] = sorted(data[csv_file]['records'], key=itemgetter(0))

        print '%s parsed' % csv_file


def fix_ids():
    session = DBSession()

    new_corrected_id = 1
    for csv_person in data['person.csv']['records']:
        old_id_from_csv = csv_person[0]
        if old_id_from_csv != new_corrected_id:
            print '\n'
            print 'csv name: ' + csv_person[1]
            print 'csv id: ' + str(old_id_from_csv)
            print 'id corrected: ' + str(new_corrected_id)

            # cards

            cards_inserter = session.query(Cards)\
                .outerjoin(Person, Cards.inserter == Person.id)\
                .filter(Person.id == old_id_from_csv)\
                .all()
            print 'related cards.inserter = ' + str(len(cards_inserter))
            update_related_items(Cards, Cards.inserter, 'inserter', old_id_from_csv, new_corrected_id)
            cards_inserter = session.query(Cards)\
                .outerjoin(Person, Cards.inserter == Person.id)\
                .filter(Person.id == new_corrected_id)\
                .all()
            print 'affected cards.inserter = ' + str(len(cards_inserter))

            cards_observer = session.query(Cards)\
                .outerjoin(Person, Cards.observer == Person.id)\
                .filter(Person.id == old_id_from_csv)\
                .all()
            print 'related cards.observer = ' + str(len(cards_observer))
            update_related_items(Cards, Cards.observer, 'observer', old_id_from_csv, new_corrected_id)
            cards_observer = session.query(Cards)\
                .outerjoin(Person, Cards.observer == Person.id)\
                .filter(Person.id == new_corrected_id)\
                .all()
            print 'affected cards.observer = ' + str(len(cards_observer))

            cards_identifier = session.query(Cards)\
                .outerjoin(Person, Cards.identifier == Person.id)\
                .filter(Person.id == old_id_from_csv)\
                .all()
            print 'related cards.identifier = ' + str(len(cards_identifier))
            update_related_items(Cards, Cards.identifier, 'identifier', old_id_from_csv, new_corrected_id)
            cards_identifier = session.query(Cards)\
                .outerjoin(Person, Cards.identifier == Person.id)\
                .filter(Person.id == new_corrected_id)\
                .all()
            print 'affected cards.identifier = ' + str(len(cards_identifier))

            # annotations

            annotations_inserter = session.query(Annotation)\
                .outerjoin(Person, Annotation.inserter == Person.id)\
                .filter(Person.id == old_id_from_csv)\
                .all()
            print 'related annotations.inserter = ' + str(len(annotations_inserter))
            update_related_items(Annotation, Annotation.inserter, 'inserter', old_id_from_csv, new_corrected_id)
            annotations_inserter = session.query(Annotation)\
                .outerjoin(Person, Annotation.inserter == Person.id)\
                .filter(Person.id == new_corrected_id)\
                .all()
            print 'affected annotations.inserter = ' + str(len(annotations_inserter))

            annotations_collecter = session.query(Annotation)\
                .outerjoin(Person, Annotation.collecter == Person.id)\
                .filter(Person.id == old_id_from_csv)\
                .all()
            print 'related annotations.collecter = ' + str(len(annotations_collecter))
            update_related_items(Annotation, Annotation.collecter, 'collecter', old_id_from_csv, new_corrected_id)
            annotations_collecter = session.query(Annotation)\
                .outerjoin(Person, Annotation.collecter == Person.id)\
                .filter(Person.id == new_corrected_id)\
                .all()
            print 'affected annotations.collecter = ' + str(len(annotations_collecter))

            annotations_identifier = session.query(Annotation)\
                .outerjoin(Person, Annotation.identifier == Person.id)\
                .filter(Person.id == old_id_from_csv)\
                .all()
            print 'related annotations.identifier = ' + str(len(annotations_identifier))
            update_related_items(Annotation, Annotation.identifier, 'identifier', old_id_from_csv, new_corrected_id)
            annotations_identifier = session.query(Annotation)\
                .outerjoin(Person, Annotation.identifier == Person.id)\
                .filter(Person.id == new_corrected_id)\
                .all()
            print 'affected annotations.identifier = ' + str(len(annotations_identifier))

        new_corrected_id += 1


def update_related_items(table, db_relative_field, relative_field_name, old_id_from_csv, new_corrected_id):
    session = DBSession()

    new_person = session.query(Person)\
        .filter(Person.id == new_corrected_id)\
        .one()

    count_items = session.query(table)\
        .outerjoin(Person, db_relative_field == Person.id)\
        .filter(db_relative_field == old_id_from_csv)\
        .count()

    items = session.query(table)\
        .outerjoin(Person, db_relative_field == Person.id)\
        .filter(db_relative_field == old_id_from_csv)

    if count_items > 0:
        with transaction.manager:
            save_session = DBSession()
            for item in items:
                save_session.query(table).filter_by(id=item.id).update({relative_field_name: new_person.id})
            transaction.commit()

    session.close()


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
    rel_path_source_data = "../_fix_persons/"
    source_data_dir = os.path.join(script_dir, rel_path_source_data)
    parse_data(source_data_dir)
    fix_ids()


if __name__ == "__main__":
    main()

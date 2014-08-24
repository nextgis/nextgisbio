# encoding: utf-8

import os
import sys
import time
import transaction

from sqlalchemy import engine_from_config

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)

from eco.models import (
    DBSession, Base,
    Taxon, Synonym, Cards,
    Person, Taxa_scheme, Museum, Coord_type, Anthr_press, Vitality,
    Abundance, Footprint, Pheno, Doc_type, Inforesources,
    Area_type, Legend, Key_area,
    Annotation,
    Squares, square_keyarea_association, User
)

from eco.models.red_books import RedBook


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri>\n'
          '(example: "%s development.ini")' % (cmd, cmd))
    sys.exit(1)


def main(argv=sys.argv):
    if len(argv) != 2:
        usage(argv)
    config_uri = argv[1]
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    # Заполним таблицы данными:

    # Таксоны
    taxons_file = 'eco/initial_data/csv/taxon.csv'
    Taxon.add_from_file(taxons_file)

    synonym_file = 'eco/initial_data/csv/synonym.csv'
    Synonym.add_from_file(synonym_file)

    # Справочники

    person_file = 'eco/initial_data/csv/person.csv'
    Person.add_from_file(person_file)

    taxa_file = 'eco/initial_data/csv/taxa_scheme.csv'
    Taxa_scheme.add_from_file(taxa_file)

    museum_file = 'eco/initial_data/csv/museum.csv'
    Museum.add_from_file(museum_file)

    coord_type_file = 'eco/initial_data/csv/coord_type.csv'
    Coord_type.add_from_file(coord_type_file)

    ant_file = 'eco/initial_data/csv/anthr_press.csv'
    Anthr_press.add_from_file(ant_file)

    vital_file = 'eco/initial_data/csv/vitality.csv'
    Vitality.add_from_file(vital_file)

    abundance_file = 'eco/initial_data/csv/abundance.csv'
    Abundance.add_from_file(abundance_file)

    footprint_file = 'eco/initial_data/csv/footprint.csv'
    Footprint.add_from_file(footprint_file)

    pheno_file = 'eco/initial_data/csv/pheno.csv'
    Pheno.add_from_file(pheno_file)

    infores_file = 'eco/initial_data/csv/inforesources.csv'
    Inforesources.add_from_file(infores_file)

    area_type_file = 'eco/initial_data/csv/area_type.csv'
    Area_type.add_from_file(area_type_file)

    legend_file = 'eco/initial_data/csv/legend.csv'
    Legend.add_from_file(legend_file)

    key_area_file = 'eco/initial_data/csv/key_area.csv'
    Key_area.add_from_file(key_area_file)

    # Нужно добавить шейпы и заполнить данными таблицу
    # связей (square_keyarea_association) многие-ко-многим между Squares и Key_area
    shp_file = 'eco/initial_data/shp/key_areas_25km.shp'
    association_file = 'eco/initial_data/csv/square_karea_association.csv'
    Squares.add_from_file(association_file, shp_file)

    # Карточки и аннотации
    cards_file = 'eco/initial_data/csv/cards.csv'
    Cards.add_from_file(cards_file)

    ann_file = 'eco/initial_data/csv/annotation.csv'
    Annotation.add_from_file(ann_file)

    # Пользователи
    users_file = 'eco/initial_data/csv/user.csv'
    User.add_from_file(users_file)

    red_books_csv = 'eco/initial_data/csv/redbooks.csv'
    RedBook.import_from_csv(red_books_csv)


if __name__ == "__main__":
    main()
# encoding: utf-8

import os
import sys

import time

import id_verificator

import transaction
from sqlalchemy import engine_from_config
from pyramid.paster import (
    get_appsettings,
    setup_logging,
    )

from nextgisbio.models import (
    DBSession, Taxon, Synonym, Cards,
    Person, Taxa_scheme, Museum, Coord_type, Anthr_press, Vitality,
    Abundance, Footprint, Pheno, Inforesources,
    Area_type, Legend, Key_area,
    Annotation,
    Squares, User
)
from nextgisbio.models.red_books import RedBook
from nextgisbio.models.image import Images, CardsImages


def dump_data():
    dir_name = 'nextgisbio/initial_data/csv/' + time.strftime("%Y_%m_%d_%H_%M_%S")

    if not os.path.exists(dir_name):
        os.makedirs(dir_name)
    else:
        raise Exception('Directory for exported csv files already exists')

    get_path_name = lambda name: os.path.join(dir_name, name)

    with transaction.manager:
        Annotation.export_to_file(get_path_name('annotation.csv'))
        Cards.export_to_file(get_path_name('cards.csv'))
        Person.export_to_file(get_path_name('person.csv'))
        Taxa_scheme.export_to_file(get_path_name('taxa_scheme.csv'))
        Museum.export_to_file(get_path_name('museum.csv'))
        Coord_type.export_to_file(get_path_name('coord_type.csv'))
        Anthr_press.export_to_file(get_path_name('anthr_press.csv'))
        Vitality.export_to_file(get_path_name('vitality.csv'))
        Abundance.export_to_file(get_path_name('abundance.csv'))
        Footprint.export_to_file(get_path_name('footprint.csv'))
        Pheno.export_to_file(get_path_name('pheno.csv'))
        Inforesources.export_to_file(get_path_name('inforesources.csv'))
        Legend.export_to_file(get_path_name('legend.csv'))
        Area_type.export_to_file(get_path_name('area_type.csv'))
        Key_area.export_to_file(get_path_name('key_area.csv'))
        RedBook.export_to_file(get_path_name('redbooks.csv'))
        User.export_to_file(get_path_name('user.csv'))
        Squares.export_to_file(get_path_name('square_karea_association.csv'))
        Taxon.export_to_file(get_path_name('taxon.csv'))
        Synonym.export_to_file(get_path_name('synonym.csv'))
        Images.export_to_file(get_path_name('images.csv'))
        CardsImages.export_to_file(get_path_name('cards_images.csv'))

    return dir_name


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
    dir_name = dump_data()
    if len(argv) == 3 and argv[2] == '--make-id-start-0':
        id_verificator.start(dir_name)

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


def parse_data(data_dir_name):
    data = {}
    for csv_file in os.listdir(data_dir_name):
        path_csv_file = path.join(data_dir_name, csv_file)
        reader = csv.reader(open(path_csv_file), delimiter='\t')

        records = [line for line in reader]

        data[csv_file] = records

        data[csv_file] = {
            'fields': records[0],
            'records': records[1:]
        }

        for record in data[csv_file]['records']:
            if record[0].isdigit():
                record[0] = int(record[0])

        from operator import itemgetter
        data[csv_file]['records'] = sorted(data[csv_file]['records'], key=itemgetter(0))

        print '%s parsed' % csv_file

    return data

from os import path
import os
import csv

data = {}

id_verify_conditions = [
    {
        'id': ('cards.csv', 'id', 0),
        'affected': [
            ('cards_images.csv', 'card_id', 0)
        ]
    },
    {
        'id': ('taxon.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'species', 1),
            ('synonym.csv', 'species_id', 1),
            ('annotation.csv', 'species', 1),
            ('taxon.csv', 'parent_id', 1)
        ]
    },
    {
        'id': ('footprint.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'footprint', 10)
        ]
    },
    {
        'id': ('vitality.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'vitality', 8)
        ]
    },
    {
        'id': ('taxa_scheme.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'taxa_scheme', 5)
        ]
    },
    {
        'id': ('synonym.csv', 'id', 0),
        'affected': []
    },
    {
        'id': ('person.csv', 'id', 0),
        'affected': [
            ('user.csv', 'person_id', 3)
        ]
    },
    {
        'id': ('key_area.csv', 'id', 0),
        'affected': [
            ('square_karea_association.csv', 'key_area_id', 1),
            ('annotation.csv', 'key_area', 3)
        ]
    },
    {
        'id': ('area_type.csv', 'id', 0),
        'affected': [
            ('key_area.csv', 'area_type', 1)
        ]
    },
    {
        'id': ('abundance.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'abundance', 9)
        ]
    },
    {
        'id': ('anthr_press.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'anthr_press', 7)
        ]
    },
    {
        'id': ('images.csv', 'id', 0),
        'affected': [
            ('cards_images.csv', 'image_id', 1)
        ]
    },
    {
        'id': ('coord_type.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'coord_type', 38)
        ]
    },
    {
        'id': ('inforesources.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'inforesources', 12),
            ('annotation.csv', 'biblioref', 6)
        ]
    },
    {
        'id': ('legend.csv', 'id', 0),
        'affected': [
            ('key_area.csv', 'legend', 2)
        ]
    },
    {
        'id': ('museum.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'museum', 6)
        ]
    },
    {
        'id': ('person.csv', 'id', 0),
        'affected': [
            ('user.csv', 'person_id', 3),
            ('annotation.csv', 'inserter', 2),
            ('annotation.csv', 'identifier', 4),
            ('annotation.csv', 'collecter', 5),
            ('cards.csv', 'inserter', 2),
            ('cards.csv', 'observer', 3),
            ('cards.csv', 'identifier', 4),
        ]
    },
    {
        'id': ('pheno.csv', 'id', 0),
        'affected': [
            ('cards.csv', 'pheno', 11)
        ]
    }
]


def parse_data(initial_data_dir_name):
    for csv_file in os.listdir(initial_data_dir_name):
        path_csv_file = path.join(initial_data_dir_name, csv_file)
        reader = csv.reader(open(path_csv_file), delimiter='\t')

        records = [line for line in reader]

        data[csv_file] = records
        print '%s parsed' % csv_file


def verify_ids():
    for condition in id_verify_conditions:
        csv_data_name, id_column_name, id_column_index = condition['id']
        csv_data = data[csv_data_name]

        if csv_data[0][id_column_index] != id_column_name:
            raise Exception('Column %s by %s index into %s not found' %
                            (id_column_name, id_column_index, csv_data_name))

        expected_id = 1
        for i, csv_row in enumerate(csv_data[1:]):
            current_id = int(csv_row[id_column_index])
            if current_id != expected_id:
                csv_row[id_column_index] = expected_id

                print 'Changed: %s:%s:%s %s -> %s' % (csv_data_name, i + 1, id_column_index,
                                                      current_id, expected_id)

                change_relative_id(condition, current_id, expected_id, csv_row, id_column_index)
            expected_id += 1


def change_relative_id(condition, current_wrong_id, expected_correct_id, csv_row, id_column_index):
    for affected_item in condition['affected']:
        affected_csv, affected_csv_column_name, affected_csv_column_index = affected_item
        affected_csv_data = data[affected_csv]

        if affected_csv_data[0][affected_csv_column_index] != affected_csv_column_name:
            raise Exception('Column %s by %s index into %s not found' %
                            (affected_csv_column_name, affected_csv_column_index, affected_csv))

        for i, affected_row in enumerate(affected_csv_data[1:]):
            current_value_id = affected_row[affected_csv_column_index]
            if not current_value_id:
                continue
            current_value_id = int(current_value_id)
            if current_value_id == current_wrong_id:
                affected_row[affected_csv_column_index] = expected_correct_id
                print 'Changed: %s:%s:%s %s -> %s' % (affected_csv, i + 1, affected_csv_column_index,
                                                      current_wrong_id, expected_correct_id)


def update_csv(initial_data_dir_name):
    from nextgisbio.utils import csv_utf
    for csv_file_name, new_csv_data in data.iteritems():
        csv_path = path.join(initial_data_dir_name, csv_file_name)
        with open(csv_path, "w"):
            pass
        with open(csv_path, 'wb') as csv_file:
            writer = csv_utf.UnicodeWriter(csv_file)

            for new_csv_data_row in new_csv_data:
                writer.writerow(new_csv_data_row)

            print '%s updated successfully.' % csv_file_name


def verify_id(initial_data_dir_name):
    for csv_file in os.listdir(initial_data_dir_name):
        print '\n\r'
        path_csv_file = path.join(initial_data_dir_name, csv_file)
        reader = csv.reader(open(path_csv_file), delimiter='\t')

        records = [line for line in reader]

        if records[0][0] != 'id':
            continue

        ids = []

        first = True
        for row in records:
            if first:
                first = False
                continue
            ids.append(int(row[0]))

        for i, entity_id in enumerate(ids):
            if i == 0:
                continue
            if (entity_id - ids[i - 1]) != 1:
                print '%s:%s ID difference warning! Previous = %s' % (csv_file, entity_id, ids[i - 1])


def start(dir_name):
    parse_data(dir_name)
    verify_ids()
    update_csv(dir_name)

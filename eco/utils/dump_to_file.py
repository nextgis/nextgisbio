from eco.models import DBSession


def dump(filename, attributes, objects, fieldnames=None, is_array=False):
    from eco.utils import csv_utf

    with open(filename, 'wb') as file:
        writer = csv_utf.UnicodeWriter(file)

        if fieldnames:
            writer.writerow(fieldnames)
        else:
            writer.writerow(attributes)

        if is_array:
            writer.writerows(objects)
            return

        object_rows = []
        for object in objects:
            object_as_array = []
            for attribute_name in attributes:
                object_as_array.append(getattr(object, attribute_name))
            object_rows.append(object_as_array)

        writer.writerows(object_rows)
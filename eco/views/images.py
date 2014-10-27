# encoding: utf-8

import os
import datetime
import uuid
import shutil

import transaction
from PIL import Image
from pyramid.view import view_config

import eco
from eco.models import (
    DBSession
)
from eco.models.cards import Cards
from eco.models.image import Images, CardsImages

THUMBNAIL_SIZES = {
    'medium': (200, 200)
}

@view_config(route_name='upload_image', renderer='json', permission='edit')
def upload_image(request):
    filename = request.POST['file'].filename
    input_file = request.POST['file'].file
    obj_id = request.matchdict['id']
    obj_type = request.matchdict['type']

    path_to_images = os.path.join(os.path.dirname(eco.__file__), 'static/data/images')
    date_now = datetime.datetime.now().strftime('%Y-%m-%d')
    path_to_images_now = os.path.join(path_to_images, date_now)

    if not os.path.exists(path_to_images_now):
        os.mkdir(path_to_images_now)

    # from http://stackoverflow.com/questions/2782229/most-lightweight-way-to-create-a-random-string-and-a-random-hexadecimal-number
    random_file_name = str(uuid.uuid4())
    base_file_path = os.path.join(path_to_images_now, '.'.join([random_file_name, 'jpg']))

    with open(base_file_path, 'wb') as output_file:
        shutil.copyfileobj(input_file, output_file)

    for key_size in THUMBNAIL_SIZES:
        try:
            im = Image.open(base_file_path)
            im.thumbnail(THUMBNAIL_SIZES[key_size], Image.BICUBIC)
            im.save(os.path.join(path_to_images_now, '.'.join([random_file_name + '_' + key_size, 'jpg'])), 'JPEG',
                    quality=70)
        except IOError:
            print "cannot create thumbnail for '%s'" % base_file_path

    with transaction.manager:
        dbSession = DBSession()
        image = Images()
        image.name = filename
        image.url = '/static/data/images/%s/%s.jpg' % (date_now, random_file_name)
        image.size = os.path.getsize(base_file_path)
        image.local = base_file_path
        dbSession.add(image)

        if obj_type == 'card':
            card_image = CardsImages()
            card_image.image = image
            card_image.card = dbSession.query(Cards).filter_by(id=obj_id).one()
            dbSession.add(card_image)

        photo_json = image.as_json_dict()

    return photo_json


@view_config(route_name='remove_image', renderer='json', permission='edit')
def remove_image(request):
    image_id = request.matchdict['image_id']
    obj_type = request.matchdict['type']

    with transaction.manager:
        dbSession = DBSession()
        dbSession.query(CardsImages).filter_by(image_id=image_id).delete()
        image = dbSession.query(Images).filter_by(id=image_id).one()
        if image.local and os.path.exists(image.local):
            os.remove(image.local)
            path_without_ext, extension = os.path.splitext(image.local)[0], os.path.splitext(image.local)[1]
            for key_size in THUMBNAIL_SIZES:
                os.remove('%s_%s%s' % (path_without_ext, key_size, extension))

        dbSession.delete(image)

    return {'success': True}
# encoding: utf-8

import json
import urlparse
import csv
import os
import datetime
import uuid

import tempfile
import zipfile
import shutil

import osgeo.ogr as ogr
import osgeo.osr as osr

import transaction
from PIL import Image

from pyramid.response import Response
from pyramid.view import view_config
from pyramid.security import has_permission, ACLAllowed, authenticated_userid

from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm.exc import NoResultFound

import eco
from eco.models import (
    DBSession
)
from eco.models.cards import Cards, Photos, CardsPhoto


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

    thumbnail_sizes = {
        'medium': (200, 200)
    }

    for key_size in thumbnail_sizes:
        try:
            im = Image.open(base_file_path)
            im.thumbnail(thumbnail_sizes[key_size], Image.BICUBIC)
            im.save(os.path.join(path_to_images_now, '.'.join([random_file_name + '_' + key_size, 'jpg'])), 'JPEG', quality=70)
        except IOError:
            print "cannot create thumbnail for '%s'" % base_file_path

    with transaction.manager:
        dbSession = DBSession()
        photo = Photos()
        photo.name = filename
        photo.url = '/static/data/images/%s/%s.jpg' % (date_now, random_file_name)
        photo.size = os.path.getsize(base_file_path)
        photo.local = base_file_path
        dbSession.add(photo)

        if obj_type == 'card':
            card_photo = CardsPhoto()
            card_photo.photo = photo
            card_photo.card = dbSession.query(Cards).filter_by(id=obj_id).one()
            dbSession.add(card_photo)

        photo_json = photo.as_json_dict()

    return photo_json


@view_config(route_name='remove_image', renderer='json', permission='edit')
def remove_image(request):
    image_id = request.matchdict['image_id']
    obj_type = request.matchdict['type']

    with transaction.manager:
        dbSession = DBSession()
        dbSession.query(CardsPhoto).filter_by(photo_id=image_id).delete()
        photo = dbSession.query(Photos).filter_by(id=image_id).one()
        if photo.local and os.path.exists(photo.local):
            os.remove(photo.local)
        dbSession.delete(photo)

    return {'success': True}
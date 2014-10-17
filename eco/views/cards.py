# encoding: utf-8

import json
import urllib
import csv
import os
from random import random
from urlparse import urlparse

import tempfile
import zipfile
import shutil

import osgeo.ogr as ogr
import osgeo.osr as osr

import transaction

from pyramid.response import Response
from pyramid.view import view_config
from pyramid.security import has_permission, ACLAllowed, authenticated_userid
from pyramid.httpexceptions import HTTPInternalServerError

from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm import joinedload

from eco.models import (
    DBSession,
    Cards, User, Person, Inforesources,
    Taxon, TAXON_ID_QUERY, TAXON_TYPES
)

from eco.models.cards import CardsPhoto

from eco.utils.try_encode import try_encode

@view_config(route_name='points_text', renderer='points.mak')
def points_text(request):
    # Есть querystring, содержащее строку вида 'nodes=taxon_id1,taxon_id2').
    # Например, "nodes=taxon_1,taxon_5"
    # Это значит, что пользователь выбрал записи из таблицы taxon с id=1 и id=5.
    # Требуется вернуть карточки наблюдений соотв. таксонов
    # 
    # Граничный случай, когда нужно выбрать все карточки: nodes="root_"

    dbsession = DBSession()
    try:
        taxons = request.params['nodes']
    except KeyError:
        taxons = ''

    can_i_edit = has_permission('edit', request.context, request)
    can_i_edit = isinstance(can_i_edit, ACLAllowed)

    if taxons:
        taxons = urllib.unquote(taxons)
        taxons = taxons.split(',')

        if "root" in taxons:
            cards = dbsession.query(Cards, Taxon).join(Taxon).all()
        else:
            taxon_id = []
            for taxon in taxons:
                t, id = taxon.split('_')
                taxon_id.append(id)
            # Получим список видов-потомков выбранных таксонов и связанных с ними карточек
            subquery = TAXON_ID_QUERY % (", ".join([ str(num) for num in taxon_id]), TAXON_TYPES[len(TAXON_TYPES)-1])
            qs = """
            SELECT cards.id,cards.species,cards.lat,cards.lon, taxon.name FROM cards  
            INNER JOIN
                taxon
                ON cards.species = taxon.id """ +  ' AND cards.species IN (' +  subquery +');'
            cards = dbsession.query(Cards, Taxon).from_statement(qs).all()

        points = []
        for card, taxon in cards:
            id, spec_id, lat, lon = card.id, card.species, card.lat, card.lon
            name = taxon.name
            if lat and lon:
                if not can_i_edit: # настоящие координаты показывать нельзя
                    # сдвинем координаты перед показом примерно на 10 км в случайном направлении
                    lat = lat + (random()-random())/7
                    lon = lon + (random()-random())/4

                points.append({'lat': lat, 'lon': lon, 'name': name, 'card_id': id, 'spec_id': spec_id})
    else:
        points = {}
    dbsession.close()
    return {'points': points}


@view_config(route_name='cards_download', renderer='string', permission='edit')
def cards_download(request):
    format = id=request.matchdict['format']

    if not format in ['csv', 'shp']:
        return Response()

    try:
        #taxon_list -- список, аналогичный querystring в points_text
        # (taxon_id1,taxon_id2)
        taxons = request.params['taxon_list']
        if taxons == 'root':
            taxon_list = None
        elif taxons != '':
            taxons = urllib.unquote(taxons)
            taxons = taxons.split(',')
            taxons = [t.split('_') for t in taxons]
            taxon_list = [id for (t,id) in taxons]
        else:
            taxon_list = None
    except KeyError:
        taxon_list = None

    cards = Cards.as_join_list(taxon_list)

    if format == 'csv':
        fname = tempfile.mktemp()
        try:
            file = open(fname, 'w')
            writer = csv.writer(file, delimiter = '\t')

            # Сохраним в файл
            for card in cards:
                x = [try_encode(v) for v in card]
                writer.writerow(x)
            file.close()
            # Наверное, стоит архивировать перед передачей. Тут без архивации.
            file = open(fname, 'r')
            data = file.read()
            resname = 'cards.csv'
        finally: # в любом случае удаляем файл
            os.remove(fname)

    elif format == 'shp':
        workdir = tempfile.mkdtemp()
        try:
            driver = ogr.GetDriverByName('ESRI Shapefile')
            sr = osr.SpatialReference()
            sr.ImportFromProj4("+init=epsg:4326")

            ds = driver.CreateDataSource( workdir)
            lyr = ds.CreateLayer('point_out', sr, ogr.wkbPoint)

            # Создадим поля в dbf, при этом 
            # Обрежем имена полей на 10-ти символах для сохранения в dbf
            fieldnames = [name[:10] for name in cards[0]]
            fieldsize = 254
            for name in fieldnames:
                field_defn = ogr.FieldDefn(name, ogr.OFTString)
                field_defn.SetWidth(fieldsize)
                if lyr.CreateField ( field_defn ) != 0:
                    print "Creating Name field failed.\n"

            #Заполним данными
            lon_idx, lat_idx = 37, 38 # номера полей lat,lon в cards
            for row in  cards[1:]: # пропустили загловки
                row = [try_encode(v, 'cp1251') for v in row]
                x = row[lon_idx]
                y = row[lat_idx]
                if x and y:
                    x = float(row[lon_idx])
                    y = float(row[lat_idx])
                    feat = ogr.Feature( lyr.GetLayerDefn())
                    for i, name in enumerate(fieldnames):
                        if row[i]:
                            feat.SetField(name, row[i])
                    pt = ogr.Geometry(ogr.wkbPoint)
                    pt.SetPoint_2D(0, x, y)
                    feat.SetGeometry(pt)
                    if lyr.CreateFeature(feat) != 0:
                        print "Failed to create feature in shapefile.\n"
                    feat.Destroy()
            ds = None

            zipfd = tempfile.NamedTemporaryFile(delete=False, suffix='.zip', prefix='')
            zipa = zipfile.ZipFile(zipfd, 'w')
            for dirname, dirnames, filenames in os.walk(workdir):
                for filename in filenames:
                    zipa.write(os.path.join(dirname, filename), os.path.join(dirname, filename).replace(workdir + os.sep, ''), zipfile.ZIP_DEFLATED)

            zipa.close()
            file = open(zipa.filename, 'r')
            data = file.read()
            resname = 'cards.zip'
        finally:
            # в любом случае подчищаем папку с собранными данными
            shutil.rmtree(workdir)

    return Response(content_type="application/octet-stream",
            content_disposition="attachment; filename=%s" % (resname, ), body=data)



# Выдать данные по конкретной карточке в формате json
@view_config(route_name='cards_view', renderer='json', permission='view')
def table_view(request):
    can_i_edit = has_permission('edit', request.context, request)
    can_i_edit = isinstance(can_i_edit, ACLAllowed)
    user_id = authenticated_userid(request)

    dbsession = DBSession()
    card, user = None, None
    try:
        card = dbsession.query(Cards).filter_by(id=request.matchdict['id']).one()
        user = dbsession.query(User).filter_by(id=user_id).one() if can_i_edit else None
        result = card.as_json_dict()
    except NoResultFound:
        result = {'success': False, 'msg': 'Результатов, соответствующих запросу, не найдено'}


    if not can_i_edit:
        # обнулим координаты перед показом
        result['lat'] = 0
        result['lon'] = 0

    if isinstance(has_permission('admin', request.context, request), ACLAllowed):
        is_editable = True
    else:
        is_editable = card.inserter == user.person_id if user else False

    dbsession.close()
    return {'data': result, 'editable': is_editable, 'success': True}


@view_config(route_name='save_card', renderer='json', permission='edit')
def save_card(request):
    new_data = dict(request.POST)
    id = new_data['id']
    success = True
    try:
        with transaction.manager:
            dbsession = DBSession()
            card = dbsession.query(Cards).filter_by(id=id).one()
            for k,v in new_data.items():
                if v == '': v = None
                if hasattr(card, k): setattr(card, k, v)
            if not 'photo' in new_data.keys(): # Ext не посылает сброшенные значения checkbox
                setattr(card, 'photo', None)
    except:
        success = False
    return {'success': success}

@view_config(route_name='new_card', renderer='json', permission='edit')
def new_card(request):
    new_data = dict(request.POST)
    success = True

    try:
        with transaction.manager:
            dbsession = DBSession()
            card = Cards()
            for k,v in new_data.items():
                if v == '': v = None
                if hasattr(card, k): setattr(card, k, v)
            dbsession.add(card)
    except:
        success = False

    return {'success': success}


@view_config(route_name='get_card_images', renderer='json')
def get_card_images(request):
    card_id = request.matchdict['id']

    images_result = []
    try:
        with transaction.manager:
            dbsession = DBSession()
            photos = dbsession.query(CardsPhoto).filter_by(card_id=card_id).options(joinedload('photo'))
            for photo in photos:
                photo_json = photo.photo.as_json_dict()
                # photo_json['url'] = {}
                # url = urlparse(photo.photo.url)
                # photo_json['url']['name'] =

                images_result.append(photo_json)
    except:
        return HTTPInternalServerError()

    return images_result
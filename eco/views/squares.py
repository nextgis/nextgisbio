# encoding: utf-8
import json
import urllib
import os

import tempfile
import zipfile
import shutil
import csv

from pyramid.response import Response
from pyramid.view import view_config

import sqlalchemy
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm.exc import NoResultFound

import osgeo.ogr as ogr
import osgeo.osr as osr

from eco.models import (
    DBSession,
    Taxon, TAXON_ID_QUERY, TAXON_TYPES,
    Squares,
    Annotation,
    Key_area,
    square_keyarea_association,
)

from eco.utils.try_encode import try_encode


def _get_squares_by_taxonlist(taxons, geomtype='geojson'):
    '''
    Выбор квадратов из БД, на которые приходятся анн.списки таксонов из taxons='taxon_id1,taxon_id2,...'.
    Вернуть по запросу геометрию каждого квадрата в соответствии с типом geomtype = ['geojson', 'wkt']
    '''
    assert geomtype in ['geojson', 'wkt']
    dbsession = DBSession()
    
    if "root" in taxons:
        if geomtype == 'geojson':
            all = dbsession.query(Squares.id, sqlalchemy.func.st_asgeojson(Squares.geom.RAW)).all()
        else:
            all = dbsession.query(Squares.id, sqlalchemy.func.st_astext(Squares.geom.RAW)).all()

    else:
        # Получим список видов-потомков выбранных таксонов
        taxon_id = []
        for taxon in taxons:
            t, id = taxon.split('_')
            taxon_id.append(id)
        
        # Выбираем ключевые участки, где встречен таксон, а по ним --- id квадратов, которые приходятся на эти участки:
        subquery = TAXON_ID_QUERY % (", ".join([ str(num) for num in taxon_id]), TAXON_TYPES[len(TAXON_TYPES)-1])
        
        qs = """ SELECT DISTINCT square_id from square_karea_association WHERE square_karea_association.key_area_id in
        (SELECT DISTINCT key_area.id FROM annotation   
        INNER JOIN
            key_area
            ON annotation.key_area = key_area.id""" + ' AND annotation.species IN (' +  subquery +'));'
        k_set = dbsession.query(Squares.id).from_statement(qs).all()
        k_set = [k[0] for k in k_set]
        if geomtype == 'geojson':
            all =  dbsession.query(Squares.id, sqlalchemy.func.st_asgeojson(Squares.geom.RAW)).filter(Squares.id.in_(k_set)).all()
        else:
            all =  dbsession.query(Squares.id, sqlalchemy.func.st_astext(Squares.geom.RAW)).filter(Squares.id.in_(k_set)).all()

    dbsession.close()
    return all

@view_config(route_name='squares_text', renderer='squares.mak')
def squares_text(request):
    dbsession = DBSession()
    all = dbsession.query(Squares, sqlalchemy.func.st_asgeojson(Squares.geom.RAW)).all()
    squares = []
    for sq, geom in all:
        squares.append({'id': sq.id, 'geom': geom})

    dbsession.close()
    return {'squares' : squares}

@view_config(route_name='square', renderer='json')
def square(request):
    dbsession = DBSession()
    id = request.matchdict['id']
    square = dbsession.query(Squares).filter_by(id=id).one()
    key_areas = [{'id': s.id, 'name': s.name} for s in square.key_areas]

    dbsession.close()
    return {'id': square.id, 'key_areas': key_areas }
    
@view_config(route_name='areal_text', renderer='squares.mak')
def areal_text(request):
    # См. отображение. карточек наблюдений. Тут аналогично.
    #
    # Есть querystring, содержащее строку вида 'nodes=taxon_id1,taxon_id2').
    # Например, "nodes=taxon_1,taxon_5"
    # Это значит, что пользователь выбрал записи из таблицы taxon с id=1 и id=5.
    # Требуется вернуть ареал вида соотв. таксонов
    # 
    # Граничный случай, когда нужно выбрать все виды: nodes="root"
    
    try:
        taxons = request.params['nodes']
    except KeyError:
        taxons = ''
    
    if taxons:
        taxons = urllib.unquote(taxons)
        taxons = taxons.split(',')
        
        all = _get_squares_by_taxonlist(taxons)
            
        squares = []
        for sq_id, geom in all:
            squares.append({'id': sq_id, 'geom': geom})

    else:
        squares = {}
    return {'squares': squares}

@view_config(route_name='areal_download',  permission='edit')
def areal_download(request):
    # См. отображение. карточек наблюдений. Тут аналогично.
    #
    # Есть querystring, содержащее строку вида 'nodes=taxon_id1,taxon_id2').
    # Например, "nodes=taxon_1,taxon_5"
    # Это значит, что пользователь выбрал записи из таблицы taxon с id=1 и id=5.
    # Требуется вернуть ареал вида соотв. таксонов
    # 
    # Граничный случай, когда нужно выбрать все виды: nodes="root"
    try:
        taxons = request.params['nodes']
    except KeyError:
        taxons = 'root'
    
    if taxons:
        taxons = urllib.unquote(taxons)
        taxons = taxons.split(',')        
        all = _get_squares_by_taxonlist(taxons, geomtype='wkt')
    else:
        all = []

    workdir = tempfile.mkdtemp()
    try:
        driver = ogr.GetDriverByName('ESRI Shapefile')
        sr = osr.SpatialReference()
        sr.ImportFromProj4("+init=epsg:3857")
        
        ds = driver.CreateDataSource( workdir)
        lyr = ds.CreateLayer('areal_out', sr, ogr.wkbMultiPolygon)
        
        # Создадим поля в dbf
        field_defn = ogr.FieldDefn('id', ogr.OFTInteger)
        if lyr.CreateField ( field_defn ) != 0:
            print "Creating Name field failed.\n"
        
        #Заполним данными         
        for id, geom in  all:
            feat = ogr.Feature(lyr.GetLayerDefn())
            geom = ogr.CreateGeometryFromWkt(geom)
            feat.SetField('id', id)
            feat.SetGeometry(geom)
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
        resname = 'areal.zip'
        
    finally:
        # в любом случае подчищаем папку с собранными данными
        shutil.rmtree(workdir)
        
    return Response(content_type="application/octet-stream", 
            content_disposition="attachment; filename=%s" % (resname, ), body=data)


@view_config(route_name='s_ka_association_download', renderer='string', permission='admin')
def s_ka_association_download(request):
    dbsession = DBSession()
    
    try:
        all = dbsession.query(square_keyarea_association).all()
    except DBAPIError:
        result = {'success': False, 'msg': 'Ошибка подключения к БД'}
    
    
    names = ['square_id', 'key_area_id']
    rows = [names, ]
    for row in all:
        data = []
        for name in names:
            data.append(try_encode(getattr(row, name)))
        rows.append(data)
        
    fname = tempfile.mktemp()
    try:
        file = open(fname, 'w')
        writer = csv.writer(file, delimiter = '\t')
        writer.writerows(rows)
        file.close()
        file = open(fname, 'r')
        data = file.read()
        resname = 'square_karea_association.csv'
    finally: # в любом случае удаляем файл
        os.remove(fname)

    dbsession.close()
    return Response(content_type="application/octet-stream", 
            content_disposition="attachment; filename=%s" % (resname, ), body=data)

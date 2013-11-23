# encoding: utf-8
import json
import urllib
import os
from random import random

from pyramid.response import Response
from pyramid.view import view_config

from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm.exc import NoResultFound


from eco.models import (
    DBSession,
    Cards, Person, Inforesources,
    Taxon,
    Key_area,
)


def get_paging_params(request_params):
    start, count = None, None
    if ('start' in request_params) and ('count' in request_params):
        start = int(request_params['start'])
        count = int(request_params['count'])
    return start, count


def get_filter_by_name(request_params):
    filter_conditions = []
    if ('name' in request_params) and request_params['name']:
        name = request_params['name']
        if '%' not in name:
            name = ''.join([name, '%'])
        filter_conditions.append(Person.name.ilike(name))
    return filter_conditions


@view_config(route_name='person_name', renderer='json')
def person_name(request):
    dbsession = DBSession()

    start, count = get_paging_params(request.params)
    filter_conditions = get_filter_by_name(request.params)

    numRows = 0
    persons = []
    success = True
    try:
        if start and count:
            persons = dbsession.query(Person.id, Person.name)\
                .filter(*filter_conditions)\
                .order_by(Person.name)\
                .slice(start, start+count)
            numRows = dbsession.query(Person).count()
        else:
            persons = dbsession.query(Person.id, Person.name)\
                .filter(*filter_conditions)\
                .order_by(Person.name)\
                .all()
            numRows = len(persons)
    except DBAPIError:
        success = False

    persons_json = []
    for (id, name) in persons:
        persons_json.append({'id': id, 'name': name})
    return {'items': persons_json, 'success': success, 'numRows': numRows, 'identity': 'id'}
    
    
# Названия инфоресурсов
@view_config(route_name='inforesources_name', renderer='json')
def inforesources_name(request):
    dbsession = DBSession()
    
    # обработка постраничных запросов
    start, limit = None, None
    if request.params.has_key('start') and request.params.has_key('limit'):
        start = int(request.params['start'])
        limit = int(request.params['limit'])
        
    try:
        if start==None or limit==None:
            all = dbsession.query(Inforesources.id, Inforesources.filename).order_by(Inforesources.filename).all()
        else:
            all = dbsession.query(Inforesources.id, Inforesources.filename).order_by(Inforesources.filename).slice(start, start+limit).all()
        count = dbsession.query(Inforesources).count() # нужно получить количество всех записей, а не только выбранных
    except DBAPIError:
        result = {'success': False, 'msg': 'Ошибка подключения к БД'}
    
    rows = []
    for (id, name) in all:
        rows.append({'id': id, 'filename': name})
    return {'data': rows, 'success': True, 'totalCount': count}


# Аннотированные списки по ключевому участку
@view_config(route_name='karea_ann', renderer='json')
def karea_ann(request):
    dbsession = DBSession()
    
    id = request.matchdict['id']
    karea =dbsession.query(Key_area).filter_by(id=id).one()
    
    annotations = []
    for ann in karea.annotations:
        annotations.append({'id': ann.id, 'name': ann.species_link.name, 'species': ann.species})
    
    return {'data': annotations}

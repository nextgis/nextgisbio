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


# ФИО всех научных сотрудников
@view_config(route_name='person_name', renderer='json')
def person_name(request):
    dbsession = DBSession()
    
    # обработка постраничных запросов
    start, limit = None, None
    if request.params.has_key('start') and request.params.has_key('limit'):
        start = int(request.params['start'])
        limit = int(request.params['limit'])
        
    try:
        if start==None or limit==None:
            all = dbsession.query(Person.id, Person.name).order_by(Person.name).all()
        else:
            all = dbsession.query(Person.id, Person.name).order_by(Person.name).slice(start, start+limit).all()
        count = dbsession.query(Person).count() # нужно получить количество всех записей, а не только выбранных
    except DBAPIError:
        result = {'success': False, 'msg': 'Ошибка подключения к БД'}
    
    rows = []
    for (id, name) in all:
        rows.append({'id': id, 'name': name})
    return {'data': rows, 'success': True, 'totalCount': count}
    
    
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

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

import helpers


@view_config(route_name='person_name', renderer='json')
def person_name(request):
    dbsession = DBSession()

    start, count = helpers.get_paging_params(request.params)

    parsed_name = helpers.get_parsed_search_attr(request.params)
    filter_conditions = []
    if parsed_name:
        filter_conditions.append(Person.name.ilike(parsed_name))

    numRows = 0
    persons = []
    success = True
    try:
        if start and count:
            persons = dbsession.query(Person.id, Person.name) \
                .filter(*filter_conditions) \
                .order_by(Person.name) \
                .slice(start, start + count)
            numRows = dbsession.query(Person) \
                .filter(*filter_conditions) \
                .count()
        else:
            persons = dbsession.query(Person.id, Person.name) \
                .filter(*filter_conditions) \
                .order_by(Person.name) \
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

    start, count = helpers.get_paging_params(request.params)

    parsed_filename = helpers.get_parsed_search_attr(request.params, 'filename')
    filter_conditions = []
    if parsed_filename:
        filter_conditions.append(Inforesources.filename.ilike(parsed_filename))


    numRows = 0
    inforesources = []
    success = True
    try:
        if start and count:
            inforesources = dbsession.query(Inforesources.id, Inforesources.filename) \
                .filter(*filter_conditions) \
                .order_by(Inforesources.filename) \
                .slice(start, start + count)
            numRows = dbsession.query(Inforesources) \
                .filter(*filter_conditions) \
                .count()
        else:
            inforesources = dbsession.query(Inforesources.id, Inforesources.filename) \
                .filter(*filter_conditions) \
                .order_by(Inforesources.filename) \
                .all()
            numRows = len(inforesources)
    except DBAPIError:
        success = False

    inforesources_json = []
    for (id, name) in inforesources:
        inforesources_json.append({'id': id, 'filename': name})
    return {'items': inforesources_json, 'success': success, 'numRows': numRows, 'identity': 'id'}


# Аннотированные списки по ключевому участку
@view_config(route_name='karea_ann', renderer='json')
def karea_ann(request):
    dbsession = DBSession()

    id = request.matchdict['id']
    karea = dbsession.query(Key_area).filter_by(id=id).one()

    annotations = []
    for ann in karea.annotations:
        annotations.append({'id': ann.id, 'name': ann.species_link.name, 'species': ann.species})

    return {'data': annotations}

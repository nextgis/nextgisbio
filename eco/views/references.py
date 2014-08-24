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

    numRows = 0
    persons = []
    success = True

    if ('id' in request.params) and request.params['id'].isdigit():
        id = int(request.params['id'])
        try:
            persons = dbsession.query(Person.id, Person.name).filter(Person.id == id).all()
            numRows = 1
        except DBAPIError:
            success = False
    else:
        start, count = helpers.get_paging_params(request.params)
        parsed_name = helpers.get_parsed_search_attr(request.params)
        filter_conditions = []
        if parsed_name:
            filter_conditions.append(Person.name.ilike(parsed_name))

        try:
            if (start is not None) and (count is not None):
                persons = dbsession.query(Person.id, Person.name) \
                    .filter(*filter_conditions) \
                    .order_by(Person.name) \
                    .slice(start, start + count) \
                    .all()
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
    dbsession.close()
    return {'items': persons_json, 'success': success, 'numRows': numRows, 'identifier': 'id'}


# Названия инфоресурсов
@view_config(route_name='inforesources_name', renderer='json')
def inforesources_name(request):
    dbsession = DBSession()

    numRows = 0
    inforesources = []
    success = True

    if ('id' in request.params) and request.params['id'].isdigit():
        id = int(request.params['id'])
        try:
            inforesources = dbsession.query(Inforesources.id, Inforesources.filename)\
                .filter(Inforesources.id == id).all()
            numRows = 1
        except DBAPIError:
            success = False
    else:
        start, count = helpers.get_paging_params(request.params)

        parsed_filename = helpers.get_parsed_search_attr(request.params, 'filename')
        filter_conditions = []
        if parsed_filename:
            filter_conditions.append(Inforesources.filename.ilike(parsed_filename))

        try:
            if (start is not None) and (count is not None):
                inforesources = dbsession.query(Inforesources.id, Inforesources.filename) \
                    .filter(*filter_conditions) \
                    .order_by(Inforesources.filename) \
                    .slice(start, start + count) \
                    .all()
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

    dbsession.close()
    return {
        'items': inforesources_json,
        'success': success,
        'numRows': numRows,
        'identifier': 'id'
    }


# Аннотированные списки по ключевому участку
@view_config(route_name='karea_ann', renderer='json')
def karea_ann(request):
    dbsession = DBSession()

    id = request.matchdict['id']
    karea = dbsession.query(Key_area).filter_by(id=id).one()

    annotations = []
    for ann in karea.annotations:
        annotations.append({'id': ann.id, 'name': ann.species_link.name, 'species': ann.species})

    dbsession.close()
    return {'data': annotations}

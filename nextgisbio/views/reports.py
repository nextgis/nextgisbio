# -*- coding: utf-8 -*-

from pyramid.httpexceptions import HTTPForbidden
from pyramid.httpexceptions import HTTPFound
from pyramid.url import route_url
from pyramid.view import view_config
from pyramid import security
import time

import re

from pyramid.security import remember
from pyramid.security import forget

from sqlalchemy.exc import DBAPIError

from nextgisbio.models import DBSession
from nextgisbio.models.red_books import RedBook, RedBookSpecies
from nextgisbio.models.taxons import Taxon
from nextgisbio.views import _get_red_books
from nextgisbio.utils import dojo


@view_config(route_name='protected_species_list', renderer='reports/protected_species_list.mako')
def protected_species_list(request):
    if 'red_book' in request.GET:
        red_book_selected_id = int(request.GET['red_book'])
    else:
        red_book_selected_id = -1
    return {
        'is_auth': security.authenticated_userid(request),
        'is_admin': security.has_permission('admin', request.context, request),
        'random_int': int(time.time() * 1000),
        'red_books': _get_red_books(),
        'red_book_selected_id': red_book_selected_id
    }


@view_config(route_name='redbook_filter', renderer='json')
def redbook_filter(request):
    dbsession = DBSession()

    query_str = request.params['name'].encode('utf-8').decode('utf-8')
    start = int(request.params['start'])
    count = int(request.params['count'])

    try:
        query_str_upper = query_str.upper()
        aFilter = u"UPPER({0}) LIKE '%{1}%'".format('name', query_str_upper)
        order_by_clauses = []
        order_by_clauses = dojo.parse_sort(request)

        red_books = dbsession.query(RedBook.id, RedBook.name)\
            .filter(aFilter)\
            .order_by(order_by_clauses)\
            .all()

        itemsPage = red_books[start:start + count]

    except DBAPIError:
        return {'success': False, 'msg': 'Ошибка подключения к БД'}

    rows = [{'id': id, 'name': name} for id, name in itemsPage]

    dbsession.close()
    return {'items': rows, 'success': True, 'numRows': len(itemsPage), 'identity': 'id'}


@view_config(route_name='species_by_redbook', renderer='json')
def species_by_redbook(request):
    dbsession = DBSession()

    redbook_id = request.matchdict['redbook_id']

    order_by_clauses = dojo.parse_sort(request)

    species = dbsession.query(Taxon, RedBookSpecies) \
        .join(RedBookSpecies, Taxon.id == RedBookSpecies.specie_id) \
        .filter(RedBookSpecies.red_book_id == redbook_id) \
        .order_by(order_by_clauses) \
        .all()

    rows = [dict(specie[0].as_json_dict().items() + specie[1].as_json_dict().items()) for specie in species]

    dbsession.close()
    return rows
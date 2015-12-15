# encoding: utf-8

import json
import transaction
import itertools

from pyramid.response import Response
from pyramid.view import view_config
from pyramid import security

from sqlalchemy.exc import DBAPIError, IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from nextgisbio.models import (
    DBSession,
    Cards,
    Taxon, Synonym, TAXON_TYPES, TAXON_ALL_QUERY, TAXON_ID_QUERY
    )

from nextgisbio.models import MAMMALIA, AVES, PLANTAE, ARA, ARTHROPODA, MOSS, LICHENES


@view_config(route_name='users_manager', renderer='users/manager.mako')
def users_manager(request):
    if 'red_book' in request.GET:
        red_book_selected_id = int(request.GET['red_book'])
    else:
        red_book_selected_id = -1
    return {
        'title': u'Редактор пользователей',
        'is_auth': security.authenticated_userid(request),
        'is_admin': security.has_permission('admin', request.context, request),
        'random_int': '',
        'red_books': '',
        'red_book_selected_id': red_book_selected_id
    }
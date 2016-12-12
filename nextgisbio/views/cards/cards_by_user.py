# encoding: utf-8

from nextgisbio.models import (
    DBSession, Cards, Taxon, Person, table_by_name
)
from pyramid import security
from pyramid.view import view_config
import pyramid.httpexceptions as exc
from sqlalchemy import or_, asc, desc, and_
from sqlalchemy.orm import aliased
from sqlalchemy.exc import DBAPIError
from sqlalchemy.sql import func
from datetime import datetime

from .. import helpers


@view_config(route_name='cards_by_user', renderer='cards/cards_by_user.mako')
def cards_by_user(request):
    if not security.authenticated_userid(request):
        raise exc.HTTPForbidden()

    session = DBSession()

    query = session.query(
        func.max(Cards.added_date).label('max_date'),
        func.min(Cards.added_date).label('min_date')
    )
    min_max = query.one()
    max_year = min_max.max_date.year
    min_year = min_max.min_date.year

    session.close()

    return {
        'title': u'Отчет о внесении карточек',
        'years': [min_year] if max_year == min_year else range(min_year.year, max_year.year),
        'is_auth': security.authenticated_userid(request),
        'is_admin': security.has_permission('admin', request.context, request)
    }


@view_config(route_name='cards_by_user_jtable_browse', renderer='json')
def cards_jtable_browse(request):
    if not security.authenticated_userid(request):
        raise exc.HTTPForbidden()

    rows_count = 0
    items = []
    success = True

    observer = aliased(Person)
    inserter = aliased(Person)

    aliased_info = {
        'observer': observer,
        'inserter': inserter
    }

    start, count = helpers.get_jtable_paging_params(request.params)
    filter_conditions = _get_filter_conditions(request, aliased_info)
    sorting = _get_sorting_param(request, aliased_info)

    session = DBSession()
    try:
        items = session.query(Person, func.count(Cards.id).label('cards_count')) \
            .join(Cards, Person.id == Cards.observer) \
            .filter(and_(*filter_conditions)) \
            .group_by(Person.id) \
            .order_by(sorting) \
            .slice(start, start+count) \
            .all()
        rows_count = session.query(Person, func.count(Cards.id).label('cards_count')) \
            .join(Cards, Person.id == Cards.observer) \
            .filter(and_(*filter_conditions)) \
            .group_by(Person.id) \
            .count()
    except DBAPIError:
        success = False

    session.close()

    items_json = []
    for row in items:
        item_json = row[0].as_json_dict('inserter__')
        item_json['__cards_count'] = row[1]
        items_json.append(item_json)

    return {
        'Result': 'OK' if success else False,
        'Records': items_json,
        'TotalRecordCount': rows_count
    }


def _get_filter_conditions(request, aliased_info):
    filter_conditions = []
    for field_name in request.POST:
        if field_name == 'years':
            year = int(request.POST['years'])
            filter_conditions.append(Cards.added_date.__ge__(datetime(year, 1, 1)))
            filter_conditions.append(Cards.added_date.__le__(datetime(year, 12, 31)))
            continue

        table_name, field, type, op = field_name.split('__')
        table = _get_table(table_name, aliased_info)

        if type == 'text':
            value = request.POST[field_name]
        elif type == 'int':
            value = int(request.POST[field_name])
        elif type == 'date':
            value = datetime.strptime(request.POST[field_name], '%d.%m.%Y')
        else:
            raise NotImplementedError('Data type "' + type + '" is not supported.')

        if op == 'equal':
            filter_conditions.append(getattr(table, field).__eq__(value))
        elif op == 'like':
            filter_conditions.append(getattr(table, field).like('%%%s%%' % value))
        elif op == 'from':
            filter_conditions.append(getattr(table, field).__ge__(value))
        elif op == 'to':
            filter_conditions.append(getattr(table, field).__le__(value))
        else:
            raise NotImplementedError('Operation type "' + op + '" is not supported.')
    return filter_conditions


def _get_sorting_param(request, aliased_info):
    if 'jtSorting' not in request.GET:
        return asc(Person.name)
    table_name, field_sort = request.GET['jtSorting'].split('__')
    field, order = field_sort.split(' ')

    if not table_name:
        if order == 'ASC':
            return asc(field)
        elif order == 'DESC':
            return desc(field)

    table = _get_table(table_name, aliased_info)

    if order == 'ASC':
        return asc(getattr(table, field))
    elif order == 'DESC':
        return desc(getattr(table, field))


def _get_table(table_name, aliased_info):
    if table_name in aliased_info:
        return aliased_info[table_name]
    else:
        return table_by_name(table_name)

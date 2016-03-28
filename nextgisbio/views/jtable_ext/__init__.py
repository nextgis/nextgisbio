# encoding: utf-8

from pyramid.view import view_config
from sqlalchemy.exc import DBAPIError
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from .. import helpers
from nextgisbio.models import (
    DBSession
)
import transaction


@view_config(route_name='table_browse_jtable', renderer='json')
def table_browse_jtable(request):
    session = DBSession()
    table, table_name = helpers.get_table_by_name(request)
    sorting = request.GET['jtSorting'] if 'jtSorting' in request.GET else 'id asc'

    rows_count = 0
    items = []
    success = True

    if ('id' in request.params) and request.params['id'].isdigit():
        id = int(request.params['id'])
        try:
            items = session.query(table) \
                .filter(table.id == id) \
                .all()
            rows_count = 1
        except DBAPIError:
            success = False
    else:
        start, count = helpers.get_jtable_paging_params(request.params)
        filter_conditions = _get_filter_conditions(request, table)

        try:
            if (start is not None) and (count is not None):
                items = session.query(table) \
                    .filter(or_(*filter_conditions)) \
                    .order_by(sorting) \
                    .slice(start, start+count) \
                    .all()
                rows_count = session.query(table) \
                    .filter(*filter_conditions) \
                    .count()
            else:
                items = session.query(table) \
                    .filter(or_(*filter_conditions)) \
                    .order_by(sorting) \
                    .all()
                rows_count = len(items)
        except DBAPIError:
            success = False

    session.close()

    items_json = []
    for row in items:
        items_json.append(row.as_json_dict())

    return {
        'Result': 'OK' if success else False,
        'Records': items_json,
        'TotalRecordCount': rows_count
    }


def _get_filter_conditions(request, table):
    if 'filter' not in request.POST or 'filter_fields' not in request.POST:
        return []
    if not request.POST['filter'] or not request.POST['filter_fields']:
        return []
    fields = request.POST['filter_fields'].split(',')
    filter_conditions = []
    for field_name in fields:
        filter_conditions.append(getattr(table, field_name).like('%%%s%%' % request.POST['filter']))
    return filter_conditions


@view_config(route_name='table_save_jtable', renderer='json')
def table_item_save(request):
    session = DBSession()
    table, table_name = helpers.get_table_by_name(request)

    if ('id' in request.POST) and request.POST['id'].isdigit():
        item_id = int(request.POST['id'])
        item = session.query(table).get(item_id)
    else:
        item = table()

    for attr in request.POST:
        if attr == 'id':
            continue
        setattr(item, attr, request.POST[attr])

    session.add(item)
    item_as_json = item.as_json_dict()
    transaction.commit()
    session.close()

    return {
        'Result': 'OK',
        'Record': item_as_json
    }


@view_config(route_name='table_delete_jtable', renderer='json')
def table_delete_jtable(request):
    session = DBSession()
    table, table_name = helpers.get_table_by_name(request)

    if ('id' in request.POST) and request.POST['id'].isdigit():
        item_id = int(request.POST['id'])
        item = session.query(table).get(item_id)
    else:
        raise Exception('Deleting item: id is not applied')

    session.delete(item)
    transaction.commit()
    session.close()

    return {
        'Result': 'OK'
    }

# encoding: utf-8

import transaction
from pyramid.view import view_config
from sqlalchemy import or_, asc, desc
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import DBAPIError, IntegrityError

from nextgisbio.models import (
    DBSession, User, Person, table_by_name
)
from .. import helpers


@view_config(route_name='persons_jtable_browse', renderer='json')
def persons_jtable_browse(request):
    session = DBSession()

    rows_count = 0
    items = []
    success = True

    start, count = helpers.get_jtable_paging_params(request.params)
    filter_conditions = _get_filter_conditions(request)
    sorting = _get_sorting_param(request)

    try:
        items = session.query(Person, User) \
            .join(User) \
            .filter(or_(*filter_conditions)) \
            .order_by(sorting) \
            .slice(start, start+count) \
            .all()
        rows_count = session.query(Person) \
            .filter(*filter_conditions) \
            .count()
    except DBAPIError:
        success = False

    session.close()

    items_json = []
    for row in items:
        person = row[0].as_json_dict('person_')
        user = row[1].as_json_dict('user_')
        item_json = person.copy()
        item_json.update(user)
        items_json.append(item_json)

    return {
        'Result': 'OK' if success else False,
        'Records': items_json,
        'TotalRecordCount': rows_count
    }


def _get_filter_conditions(request):
    if 'filter' not in request.POST or 'filter_fields' not in request.POST:
        return []
    if not request.POST['filter'] or not request.POST['filter_fields']:
        return []
    fields = request.POST['filter_fields'].split(',')
    filter_conditions = []
    for field_name in fields:
        table_name, field = field_name.split('_')
        table = table_by_name(table_name)
        filter_conditions.append(getattr(table, field).like('%%%s%%' % request.POST['filter']))
    return filter_conditions


def _get_sorting_param(request):
    if 'jtSorting' not in request.GET:
        return asc(Person.name)
    table_name, field_sort = request.GET['jtSorting'].split('_')
    table = table_by_name(table_name)
    field, order = field_sort.split(' ')
    if order == 'ASC':
        return asc(getattr(table, field))
    elif order == 'DESC':
        return desc(getattr(table, field))


@view_config(route_name='persons_jtable_save', renderer='json')
def table_item_save(request):
    session = DBSession()
    session.expire_on_commit = False

    if ('person_id' in request.POST) and request.POST['person_id'].isdigit():
        person_id = int(request.POST['person_id'])
        person = session.query(Person) \
            .options(joinedload('user')) \
            .filter(Person.id == person_id) \
            .all()[0]
        user = person.user
    else:
        person = Person()
        user = User()
        session.add(user)
        person.user = user

    for attr in request.POST:
        table_name, field = attr.split('_')
        if field == 'id':
            continue
        if table_name == 'person':
            setattr(person, field, request.POST[attr])
        if table_name == 'user':
            setattr(user, field, request.POST[attr])

    session.add(person)

    try:
        transaction.commit()
    except IntegrityError:
        transaction.abort()
        return {
            'Result': 'Error',
            'Message': u'Такой логин уже присутствует в системе'
        }

    person_json = person.as_json_dict('person_')
    user_json = user.as_json_dict('user_')
    item_json = person_json.copy()
    item_json.update(user_json)

    session.close()

    return {
        'Result': 'OK',
        'Record': item_json
    }


@view_config(route_name='persons_jtable_delete', renderer='json')
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


@view_config(route_name='persons_get_users_options', renderer='json')
def persons_get_users_options(request):
    session = DBSession()
    users = session.query(User) \
        .filter(~User.person.has()) \
        .all()
    users_json = [{
        'DisplayText': 'Не присвоен',
        'Value': -1
    }]
    for user in users:
        users_json.append({
            'DisplayText': user.login,
            'Value': user.id
        })
    return {
        'Result': 'OK',
        'Options': users_json
    }

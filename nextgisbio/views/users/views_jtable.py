# encoding: utf-8

import transaction
from pyramid.exceptions import HTTPBadRequest
from pyramid.view import view_config
from sqlalchemy import or_, asc, desc
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import joinedload

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
            .slice(start, start + count) \
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
    person_id = None
    if ('person_id' in request.POST) and request.POST['person_id'].isdigit():
        person_id = int(request.POST['person_id'])

    user_login = request.POST['user_login'] if 'user_login' in request.POST else None
    if not user_login:
        raise HTTPBadRequest('"user_login" is required parameter')

    if not person_id:
        users = DBSession.query(User).filter(User.login == user_login).all()
        if len(users) > 0:
            return {
                'Result': 'Error',
                'Message': u'Такой логин уже присутствует в системе'
            }

    with transaction.manager:
        if person_id:
            person = DBSession.query(Person) \
                .options(joinedload('user')) \
                .filter(Person.id == person_id) \
                .all()[0]
            user = person.user
        else:
            person = Person()
            DBSession.add(person)
            user = User()
            DBSession.add(user)
            person.user = user

        for attr in request.POST:
            table_name, field = attr.split('_')
            if field == 'id':
                continue
            if table_name == 'person':
                setattr(person, field, request.POST[attr])
            if table_name == 'user':
                setattr(user, field, request.POST[attr])

        if 'user_active' in request.POST and request.POST['user_active']:
            user.active = True
        else:
            user.active = False

        if 'user_password' in request.POST and request.POST['user_password']:
            user.password = User.password_hash(request.POST['user_password'])

        DBSession.flush()

        DBSession.refresh(user)
        DBSession.refresh(person)

        person_json = person.as_json_dict('person_')
        user_json = user.as_json_dict('user_')
        item_json = person_json.copy()
        item_json.update(user_json)

    return {
        'Result': 'OK',
        'Record': item_json
    }


@view_config(route_name='persons_jtable_delete', renderer='json')
def table_delete_jtable(request):
    session = DBSession()

    if ('person_id' in request.POST) and request.POST['person_id'].isdigit():
        person_id = int(request.POST['person_id'])
        person = session.query(Person).options(joinedload('user')).get(person_id)
    else:
        raise Exception('Deleting item: id is not applied')

    session.delete(person)
    session.delete(person.user)
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

    session.close()

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

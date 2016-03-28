# encoding: utf-8

from pyramid import security
from pyramid.view import view_config
from sqlalchemy.orm import joinedload

from nextgisbio.models import (
    DBSession, User
)


@view_config(route_name='persons_manager', renderer='users/persons.mako')
def users_manager(request):
    session = DBSession()
    return {
        'title': u'Управление пользователями',
        'users': session.query(User).options(joinedload('person')).all(),
        'is_auth': security.authenticated_userid(request),
        'is_admin': security.has_permission('admin', request.context, request)
    }


@view_config(route_name='persons_manager_get_users', renderer='json')
def persons_manager_get_users(request):
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

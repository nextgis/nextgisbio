# encoding: utf-8

from pyramid import security
from pyramid.view import view_config
import pyramid.httpexceptions as exc
from sqlalchemy.orm import joinedload

from nextgisbio.models import (
    DBSession, User
)


@view_config(route_name='persons_manager', renderer='users/persons.mako')
def users_manager(request):
    if not security.has_permission('admin', request.context, request):
        raise exc.HTTPForbidden()

    session = DBSession()
    users = session.query(User).options(joinedload('person')).all()
    session.close()

    return {
        'title': u'Управление пользователями',
        'users': users,
        'is_auth': security.authenticated_userid(request),
        'is_admin': security.has_permission('admin', request.context, request)
    }

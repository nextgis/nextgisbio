# -*- coding: utf-8 -*-

from pyramid.httpexceptions import HTTPForbidden
from pyramid.httpexceptions import HTTPFound
from pyramid.url import route_url
from pyramid.view import view_config

from pyramid.security import remember
from pyramid.security import forget


from sqlalchemy.orm.exc import NoResultFound

from nextgisbio.models import User, DBSession


@view_config(route_name='login', renderer='login.mak')
@view_config(context=HTTPForbidden, renderer='login.mak')
def login(request):
    message = None

    if hasattr(request, 'exception') and isinstance(request.exception, HTTPForbidden):
        message = u"Недостаточно прав доступа для выполнения указанной операции!"

    login_url = route_url('login', request)
    referrer = request.url
    if referrer == login_url:
        referrer = route_url('home', request)
    next_url = route_url('home', request)
    login = ''
    password = ''
    if 'form.submitted' in request.params:
        login = request.params['login']
        password = request.params['password']

        try:
            dbsession = DBSession()
            user = dbsession.query(User)\
                .filter_by(login=login, password=User.password_hash(password), active=True)\
                .one()
            dbsession.close()
            headers = remember(request, user.id)
            return HTTPFound(location=next_url, headers=headers)
        except NoResultFound:
            pass

        message = u"Неверный логин или пароль!"
    return dict(
        message = message,
        url = request.application_url + '/login',
        next_url = next_url,
        login = login,
        password = password,
        )


@view_config(route_name='logout')
def logout(request):
    headers = forget(request)
    return HTTPFound(location = route_url('home', request), headers = headers)

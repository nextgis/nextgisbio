# encoding: utf-8

import os
import csv
import tempfile
import shutil

from pyramid import security
from pyramid.response import Response
from pyramid.view import view_config
from pyramid.security import has_permission, ACLAllowed, authenticated_userid

from sqlalchemy.exc import DBAPIError


from eco.models import (
    DBSession,
    User,
    table_by_name
)
from eco.models import MultipleResultsFound, NoResultFound

from eco.utils.try_encode import try_encode
import helpers


@view_config(route_name='home', renderer='main.mako', permission='view')
def my_view(request):
    return {
        'is_auth': security.authenticated_userid(request),
        'is_admin': security.has_permission('admin', request.context, request)
    }


# Выдать данные из таблицы в формате json
@view_config(route_name='table_browse', renderer='json')
def table_browse(request):
    dbsession = DBSession()
    tablename = request.matchdict['table']
    try:
        table = table_by_name(tablename)
    except KeyError:
        return {'success': False, 'msg': 'Ошибка: отсутствует таблица с указанным именем'}

    numRows = 0
    items = []
    success = True

    if ('id' in request.params) and request.params['id'].isdigit():
        id = int(request.params['id'])
        try:
            items = dbsession.query(table)\
                .filter(table.id == id)
            numRows = 1
        except DBAPIError:
            success = False
    else:
        start, count = helpers.get_paging_params(request.params)
        parsed_name = helpers.get_parsed_search_attr(request.params, tablename)
        filter_conditions = []
        if parsed_name:
            filter_conditions.append(getattr(table, tablename).ilike(parsed_name))


        try:
            if (start is not None) and (count is not None):
                items = dbsession.query(table)\
                    .filter(*filter_conditions) \
                    .order_by(tablename + ' asc') \
                    .slice(start, start+count)
                numRows = dbsession.query(table) \
                    .filter(*filter_conditions) \
                    .count()
            else:
                items = dbsession.query(table) \
                    .filter(*filter_conditions) \
                    .order_by(tablename + ' asc') \
                    .all()
                numRows = len(items)
        except DBAPIError:
            success = False

    items_json = []
    for row in items:
        items_json.append(row.as_json_dict())

    return {
        'items': items_json,
        'success': success,
        'numRows': numRows,
        'identifier': 'id'
    }


# Выдать данные по конкретной записи из таблицы в формате json
@view_config(route_name='table_view', renderer='json')
def table_view(request):
    can_i_edit = has_permission('edit', request.context, request)
    can_i_edit = isinstance(can_i_edit, ACLAllowed)
    user_id = authenticated_userid(request)

    try:
        model = table_by_name(request.matchdict['table'])
    except KeyError:
        return {'success': False, 'msg': 'Ошибка: отсутствует таблица с указанным именем'}
        
    session = DBSession()
    try:
        entity = session.query(model).filter_by(id=request.matchdict['id']).one()
        user = session.query(User).filter_by(id=user_id).one() if can_i_edit else None
        result = {'data': entity.as_json_dict(), 'success': True}
    except NoResultFound:
        result = {'success': False, 'msg': 'Результатов, соответствующих запросу, не найдено'}

    if hasattr(entity, 'inserter'):
        if isinstance(has_permission('admin', request.context, request), ACLAllowed):
            is_editable = True
        else:
            is_editable = entity.inserter == user.person_id if user else False
    else:
        is_editable = True
    result['editable'] = is_editable

    return result




# Выдать данные из таблицы в формате csv
@view_config(route_name='table_download', renderer='string', permission='admin')
def table_download(request):
    dbsession = DBSession()
    modelname = request.matchdict['table']
    try:
        model = table_by_name(modelname)
    except KeyError:
        return {'success': False, 'msg': 'Ошибка: отсутствует таблица с указанным именем'}
    
    try:
            all = dbsession.query(model).all()
    except DBAPIError:
        result = {'success': False, 'msg': 'Ошибка подключения к БД'}
    
    
    names = []
    for c in model.__table__.columns:
        names.append(c.name)
    rows = [names, ]
    for row in all:
        data = []
        for name in names:
            data.append(try_encode(getattr(row, name)))
        rows.append(data)
        
    fname = tempfile.mktemp()
    try:
        file = open(fname, 'w')
        writer = csv.writer(file, delimiter = '\t')
        writer.writerows(rows)
        file.close()
        file = open(fname, 'r')
        data = file.read()
        resname = modelname + '.csv'
    finally: # в любом случае удаляем файл
        os.remove(fname)
        
    return Response(content_type="application/octet-stream", 
            content_disposition="attachment; filename=%s" % (resname, ), body=data)

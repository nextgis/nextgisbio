# encoding: utf-8

import os
import csv
import urllib
import tempfile

from pyramid.response import Response
from pyramid.view import view_config
from pyramid.security import has_permission, ACLAllowed
import transaction

from nextgisbio.models import (
    DBSession,
    Annotation,
    Taxon, TAXON_ID_QUERY, TAXON_TYPES,
    Squares
)
from nextgisbio.utils.try_encode import try_encode
from . import table_view


@view_config(route_name='annotation', request_method='GET', renderer='json')
def get_anlist(request):
    request.matchdict['id'] = request.matchdict['id']
    request.matchdict['table'] = 'annotation'
    return table_view(request)


@view_config(route_name='annotation', request_method='POST', renderer='json', permission='edit')
def save_anlist(request):
    dbsession = DBSession()
    
    new_data = dict(request.POST)
    annotation_id = request.matchdict['id']
    
    success = True
    try:
        anlist = dbsession.query(Annotation).filter_by(id=annotation_id).one()
        for k,v in new_data.items():
            if v == '': v = None
            if hasattr(anlist, k): setattr(anlist, k, v)
        dbsession.flush()
    except :
        success = False
    return {'success': success}


@view_config(route_name='new_anlist', request_method='PUT',  renderer='json', permission='edit')
def new_anlist(request):
    new_data = dict(request.POST)
    success = True

    try:
        import transaction
        with transaction.manager:
            dbsession = DBSession()
            anlist = Annotation()
            for k,v in new_data.items():
                if v == '': v = None
                if hasattr(anlist, k): setattr(anlist, k, v)
            dbsession.add(anlist)
    except:
        success = False
    return {'success': success}


@view_config(route_name='annotation', request_method='DELETE', renderer='json', permission='edit')
def delete_anlist(request):
    annotation_id = request.matchdict['id']
    success = True
    try:
        with transaction.manager:
            dbsession = DBSession()
            annotation = dbsession.query(Annotation).filter_by(id=annotation_id).one()
            dbsession.delete(annotation)
    except:
        success = False
    return {'success': success}


@view_config(route_name='anns_download', renderer='string', permission='edit')
def anns_download(request):
    format = id=request.matchdict['format']
    
    if not format in ['csv', 'shp']:
        return Response()
    
    try:
        #taxon_list -- список, аналогичный querystring в view.cards.points_text
        # (taxon_id1,taxon_id2)
        taxons = request.params['taxon_list']
        if taxons == 'root':
            taxon_list = None
        elif taxons != '':
            taxons = urllib.unquote(taxons)
            taxons = taxons.split(',')
            taxons = [t.split('_') for t in taxons]
            taxon_list = [id for (t,id) in taxons]
        else:
            taxon_list = None
    except KeyError:
        taxon_list = None
    
    anns = Annotation.as_join_list(taxon_list)
    
    if format == 'csv':
        fname = tempfile.mktemp()
        try:
            file = open(fname, 'w')
            writer = csv.writer(file, delimiter = '\t')
            
            # Сохраним в файл
            for ann in anns:
                x = [try_encode(v) for v in ann]
                writer.writerow(x)
            file.close()
            # Наверное, стоит архивировать перед передачей. Тут без архивации.
            file = open(fname, 'r')
            data = file.read()
            resname = 'annotations.csv'
        finally: # в любом случае удаляем файл
            os.remove(fname)
            
    elif format == 'shp':
        print 'Not implemented'

    return Response(content_type="application/octet-stream", 
            content_disposition="attachment; filename=%s" % (resname, ), body=data)


@view_config(route_name='anns_text', renderer='json')
def anns_text(request):
    # Есть querystring, содержащее строку вида 'nodes=taxon_id1,taxon_id2').
    # Например, "nodes=taxon_1,taxon_5"
    # Это значит, что пользователь выбрал записи из таблицы taxon с id=1 и id=5.
    # Требуется вернуть аннотированные списки соотв. таксонов
    # 
    # Граничный случай, когда нужно выбрать все списки: nodes="root_"
    
    dbsession = DBSession()
    
    # Ключевые участки по квадрату:
    id = request.matchdict['id']
    square = dbsession.query(Squares).filter_by(id=id).one()
    key_areas = [str(s.id) for s in square.key_areas]
    key_areas = ", ".join(key_areas)
    
    try:
        taxons_id = request.params['nodes']
    except KeyError:
        taxons_id = ''
        
    can_i_edit = has_permission('edit', request.context, request)
    can_i_edit = isinstance(can_i_edit, ACLAllowed)
    
    if taxons_id:
        taxons_id = urllib.unquote(taxons_id)
        taxons_id = taxons_id.split(',')
        
        if "root" in taxons_id:
            anns = dbsession.query(Annotation,Taxon).join(Taxon).all()
            qs = """
            SELECT annotation.id,annotation.species, taxon.name FROM annotation  
            INNER JOIN
                taxon
                ON annotation.species = taxon.id """ + ' AND annotation.key_area IN ( %s ) ;' % (key_areas, )
            anns = dbsession.query(Annotation, Taxon).from_statement(qs).all()
        else:
            # Получим список видов-потомков выбранных таксонов и связанных с ними аннотаций из ключевых участков квадрата id
            subquery = TAXON_ID_QUERY % (", ".join([ str(num) for num in taxons_id]), TAXON_TYPES[len(TAXON_TYPES)-1])
            qs = """
            SELECT annotation.id,annotation.species, taxon.name FROM annotation  
            INNER JOIN
                taxon
                ON annotation.species = taxon.id """ + ' AND annotation.key_area IN ( %s ) ' % (key_areas, ) +  ' AND annotation.species IN (' +  subquery +');'
            anns = dbsession.query(Annotation, Taxon).from_statement(qs).all()
        
        squares = []
        for ann, taxon in anns:
            id, spec_id= ann.id, ann.species
            name = taxon.name
            squares.append({'name': name, 'ann_id': id, 'spec_id': spec_id})
    else:
        points = {}
    dbsession.close()
    return {'data': squares}

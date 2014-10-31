# encoding: utf-8

import json
import transaction
import itertools

from pyramid.response import Response
from pyramid.view import view_config
from pyramid import security

from sqlalchemy.exc import DBAPIError, IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from eco.models import (
    DBSession,
    Cards,
    Taxon, Synonym, TAXON_TYPES, TAXON_ALL_QUERY, TAXON_ID_QUERY
    )

from eco.models import MAMMALIA, AVES, PLANTAE, ARA, ARTHROPODA, MOSS, LICHENES
import helpers


@view_config(route_name='taxon_cbtree', renderer='json')
def taxon_cbtree(request):
    path_name = 'path' if 'path' in request.params else 'basePath'
    hierarchical_path = request.params[path_name].replace('"', '')

    if hierarchical_path == '.':
        parent_id = None
    else:
        parent_id = int(str.split(str(hierarchical_path), '/')[-1])

    dbsession = DBSession()
    parent_taxon = dbsession.query(Taxon).filter_by(id=parent_id).first()
    children_taxons = dbsession.query(Taxon).filter_by(parent_id=parent_id).order_by(Taxon.name).all()
    dbsession.close()

    if hierarchical_path == '.':
        block = {
            'name': '.',
            'path': hierarchical_path,
            'directory': True,
            'total': 1,
            'status': 200,
            'items': [{
                          'name': '.',
                          'id': -1,
                          'path': hierarchical_path,
                          'directory': True
                      }]
        }
    else:
        block = {
            'name': parent_taxon.name,
            'path': hierarchical_path,
            'directory': True,
            'total': 1,
            'status': 200,
            'items': []
        }

    children_taxons_json = []
    for taxon in children_taxons:
        children_taxons_json.append(_taxon_to_node(hierarchical_path, taxon))

    if hierarchical_path == '.':
        block['items'][0]['children'] = children_taxons_json
    else:
        block['items'] = children_taxons_json

    return block if block else children_taxons_json


def _taxon_to_node(path, taxon):
    node = {
        'id': taxon.id,
        'path': path + '/' + str(taxon.id),
        'name': taxon.name
    }

    if taxon.is_last_taxon():
        node['is_specie'] = True
    else:
        node['directory'] = True
    if taxon.author:
        node['author'] = taxon.author
    return node


# Отдать прямые потомки таксона в виде, пригодном для использования в Ext.treepanel:
@view_config(route_name='taxon_direct_child', renderer='json')
def direct_child(request):
    # Ext посылает запрос, содержащий строку вида 'node'='taxon_идентификатор')
    # например, 'node'='taxon_1', где id = id записи в таблице taxons
    # (об идентификаторах см. ниже, в цикле,
    # где в ответ на запрос выдаются дочерние узлы с идентификаторами)

    # Два граничных случая:
    # taxon == 'root': Корень дерева таксонов, childern=все записи из Kingdom
    # taxon.is_last_taxon == True: конец иерархии (это последний таксон) => leaf:=True
    node = request.params['node']

    dbsession = DBSession()
    try:
        if node == 'root':
            childern = dbsession.query(Taxon).filter_by(parent_id=None).all()
        else:
            node = node.split('_')
            id = int(node[1])
            childern = dbsession.query(Taxon).filter_by(parent_id=id).all()
            dbsession.close()
    except NoResultFound:
        dbsession.close()
        return {'success': False, 'msg': 'Результатов, соответствующих запросу, не найдено'}


    # Генерируем описания узлов для Ext.treepanel
    rows = []
    for taxon in childern:
        node = {}
        # Ext хочет получать информацию из поля 'text'
        # Сформируем это поле из названия и автора
        author = taxon.author if taxon.author else ''
        is_last = taxon.is_last_taxon()

        node['id'] = 'taxon_' + str(taxon.id)
        node['leaf'] = is_last
        if is_last:
            node['text'] = "<b>%s</b> %s" % (taxon.name, author)
        else:
            node['text'] = "%s %s" % (taxon.name, author)
        rows.append(node)
    return rows


# Выдать данные из таблиц taxon,synonym в формате json согласно фильтру
@view_config(route_name='taxon_filter', renderer='json')
def taxon_filter(request):
    query_str = request.params['name'].encode('utf-8').decode('utf-8')
    start = int(request.params['start'])
    count = int(request.params['count'])

    # Нужно выдернуть номера id, названия таксонов и авторов (для синонимов) из таблиц таксонов и синонимов
    dbsession = DBSession()
    try:
        query_str_upper = query_str.upper()
        # ищем в таблице таксонов:
        aFilter = u"UPPER({0}) LIKE '%{1}%'".format('name', query_str_upper)
        tax_all = dbsession.query(Taxon.id, Taxon.name, Taxon.author).filter(aFilter).all()

        aFilter = u"UPPER({0}) LIKE '%{1}%'".format('russian_name', query_str_upper)
        rus_all = dbsession.query(Taxon.id, Taxon.russian_name, Taxon.author).filter(aFilter).all()

        # ищем в таблице синонимов:
        aFilter = u"UPPER({0}) LIKE '%{1}%'".format('synonym', query_str_upper)
        s_all = dbsession.query(Synonym.species_id, Synonym.synonym, Synonym.author).filter(aFilter).all()

        all = [tax_all + s_all + rus_all][0]
        itemsPage = all[start:start + count]
        dbsession.close()
    except DBAPIError:
        dbsession.close()
        return {'success': False, 'msg': 'Ошибка подключения к БД'}


    rows = []
    if all:
        rec_id = itertools.count()
        rows = [{'recId': rec_id.next(), 'id': id, 'name': name, 'author': author} for id, name, author in itemsPage]
    return {'items': rows, 'success': True, 'numRows': len(all), 'identity': 'id'}


# Выдать данные из таблиц taxon,synonym в формате json согласно фильтру
@view_config(route_name='species_filter', renderer='json')
def species_filter(request):
    with transaction.manager:
        dbsession = DBSession()
        try:
            query_str = request.params['name']
        except KeyError:
            query_str = ''
        taxon_id = request.matchdict['id']
        taxon_type = request.matchdict['type']

        species_types = {'mammalia': MAMMALIA, 'aves': AVES, 'plantae': PLANTAE, 'ara': ARA,
                         'arthropoda': ARTHROPODA, 'moss': MOSS, 'lichenes': LICHENES}
        try:
            sp = species_types[taxon_type]
        except KeyError:
            return {'success': False, 'msg': 'Неверный вид организма'}

        known_tax, all_taxons, all_russian_name, all_synonyms = [], [], [], []
        success = True
        try:
            # Если id известен, выберем запись:
            if ('id' in request.params) and request.params['id']:
                taxon_id = int(request.params['id'])
                known_tax = dbsession.query(Taxon.id, Taxon.name, Taxon.author, Taxon.source).filter(
                    Taxon.id == taxon_id).all()
            else:
                if query_str or query_str == '':
                    target = dbsession.query(Taxon).filter(Taxon.name.in_(sp)).all()
                    target_ids = [t.id for t in target]
                    target_ids = ", ".join([str(num) for num in target_ids])

                    qs = TAXON_ALL_QUERY % (target_ids, TAXON_TYPES[len(TAXON_TYPES) - 1])
                    subquery = " AND UPPER(%s) LIKE '%s%s%s' ORDER BY name" % ('name', '%', query_str.upper(), '%')
                    qs = qs + subquery + ';'
                    all_taxons = dbsession.query(Taxon.id, Taxon.name, Taxon.author, Taxon.source).from_statement(qs).all()

                    qs = TAXON_ALL_QUERY % (target_ids, TAXON_TYPES[len(TAXON_TYPES) - 1])
                    subquery = " AND UPPER(%s) LIKE '%s%s%s' ORDER BY russian_name" % ('russian_name', '%', query_str.upper(), '%')
                    qs = qs + subquery + ';'
                    all_russian_name = dbsession.query(Taxon.id, Taxon.russian_name, Taxon.author, Taxon.source).from_statement(qs).all()

                    subquery = TAXON_ID_QUERY % (target_ids, TAXON_TYPES[len(TAXON_TYPES) - 1])
                    synonyms_query = "SELECT * FROM synonym WHERE UPPER(%s) LIKE '%s%s%s' AND species_id IN ( %s) ORDER BY synonym;" % \
                           ('synonym', '%', query_str.upper(), '%', subquery)

                    all_synonyms = dbsession.query(Synonym.species_id, Synonym.synonym, Synonym.author,
                                            Synonym.source).from_statement(synonyms_query).all()
        except DBAPIError:
            success = False

    taxons = known_tax + all_taxons + all_russian_name + all_synonyms
    numRows = len(taxons)

    start, count = helpers.get_paging_params(request.params)
    if (start is not None) and (count is not None):
        taxons = taxons[start:start + count]

    taxons_json = []
    if taxons:
        taxons_json = [{'id': id, 'name': name} for id, name, author, source in taxons]

    return {
        'items': taxons_json,
        'success': success,
        'numRows': numRows,
        'identifier': 'id'
    }


@view_config(route_name='taxon_parent_path', renderer='json')
def parent_path(request):
    taxon_id = request.matchdict['id']

    taxons = Taxon.parent_taxons(taxon_id)
    path = [t.id for t in taxons]

    return {'success': True, 'path': path}

# Выборка видов из БД
@view_config(route_name='species_name', renderer='json')
def species_name(request):
    with transaction.manager:
        dbsession = DBSession()
        species_types = {'mammalia': MAMMALIA, 'aves': AVES, 'plantae': PLANTAE, 'ara': ARA,
                         'arthropoda': ARTHROPODA, 'moss': MOSS, 'lichenes': LICHENES}
        rows = []
        rec_id = itertools.count()
        try:
            for sp in species_types.keys():
                slist = species_types[sp]
                target = dbsession.query(Taxon).filter(Taxon.name.in_(slist)).all()
                target_ids = [t.id for t in target]
                tax_all = Taxon.species_by_taxon(target_ids)
                rows = rows + [
                    {'recId': rec_id.next(),
                     'id': row['id'],
                     'name': row['name'],
                     'author': row['author'],
                     'source': row['source'],
                     'organism': sp, 'synonim': False
                    }
                    for row in tax_all]
                # соберем синонимы:
                syn = dbsession.query(Synonym.species_id, Synonym.synonym, Synonym.author, Synonym.source).filter(
                    Synonym.species_id.in_([row['id'] for row in tax_all])).all()
                rows = rows + [
                    {'recId': rec_id.next(),
                     'id': row[0],
                     'name': row[1],
                     'author': row[2],
                     'source': row[3],
                     'organism': sp, 'synonim': True
                    }
                    for row in syn]
        except DBAPIError:
            result = {'success': False, 'msg': 'Ошибка подключения к БД'}

    return {'data': rows, 'success': True, 'totalCount': len(rows)}

# тип таксона по его id
@view_config(route_name='taxon_type', renderer='json')
def taxon_type(request):
    taxon_id = request.matchdict['id']

    with transaction.manager:
        dbsession = DBSession()
        p = dbsession.query(Taxon).filter(Taxon.id == taxon_id).one()

        types = {'mammalia': p.is_mammalia(), 'aves': p.is_aves(), 'plantae': p.is_plantae(), 'ara': p.is_ara(),
                 'arthropoda': p.is_arthropoda(), 'moss': p.is_moss(), 'lichenes': p.is_lichenes()}

    return types


@view_config(route_name='taxons_editor', renderer='taxons/editor.mako', permission='admin')
def taxons_editor(request):
    import time
    return {
        'is_auth': security.authenticated_userid(request),
        'is_admin': security.has_permission('admin', request.context, request),
        'random_int': int(time.time() * 1000)
    }


@view_config(route_name='get_taxon_tree_childrens', renderer='json')
def taxon_tree(request):
    taxon_parent_id = request.matchdict['taxon_parent_id']

    parent_id = None
    if taxon_parent_id != 'root':
        parent_id = int(taxon_parent_id)

    with transaction.manager:
        dbsession = DBSession()
        parent_taxon = dbsession.query(Taxon).filter_by(id=parent_id).first()
        children_taxons = dbsession.query(Taxon).filter_by(parent_id=parent_id).all()

        if taxon_parent_id == 'root':
            parent_taxon_json = {
                'id': 'root',
                'name': 'Все таксоны'
            }
        else:
            parent_taxon_json = parent_taxon.as_json_dict()

        if taxon_parent_id == 'root':
            parent_taxon_json['id'] = 'root'

        children_taxons_json = []
        for taxon in children_taxons:
            children_taxons_json.append(_taxon_to_json(taxon))
        parent_taxon_json['children'] = children_taxons_json

    return parent_taxon_json


def _taxon_to_json(taxon):
    taxon_json = taxon.as_json_dict()

    if not taxon.is_last_taxon():
        taxon_json['children'] = True

    return taxon_json


@view_config(route_name='get_taxon', renderer='json')
def get_taxon(request):
    id = int(request.matchdict['id'])
    parent_taxons = Taxon.parent_taxons(id)


def create_taxon(request):
    new_data = dict(request.POST)

    dbsession = DBSession()
    taxon = Taxon()

    for k, v in new_data.items():
        if v == '': v = None
        if hasattr(taxon, k): setattr(taxon, k, v)
    dbsession.add(taxon)
    dbsession.flush()
    dbsession.refresh(taxon)

    return {'item': taxon.as_json_dict()}


def update_taxon(request):
    new_data = dict(request.POST)
    taxon_id = new_data['id']

    with transaction.manager:
        dbsession = DBSession()

        taxon = dbsession.query(Taxon).filter_by(id=taxon_id).one()
        for k, v in new_data.items():
            if v == '':
                v = None
            if hasattr(taxon, k):
                setattr(taxon, k, v)
        taxon_json = taxon.as_json_dict()

    return {'item': taxon_json}


def delete_taxon(request):
    id = int(request.body.split('=')[1])

    dbsession = DBSession
    taxon = dbsession.query(Taxon).filter_by(id=id).one()
    parent_id = taxon.parent_id
    try:
        dbsession.query(Taxon).filter_by(id=id).delete()
    except IntegrityError:
        request.response.status = 500
        return {'success': False, 'error': 'IntegrityError'}

    return {'id': parent_id}


from pyramid.response import Response
from pyramid.view import view_defaults


@view_defaults(route_name='taxon_tree')
class TaxonTree(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', renderer='json')
    def get(self):
        return Response('get')

    @view_config(request_method='POST', renderer='json')
    def post(self):
        return update_taxon(self.request)

    @view_config(request_method='PUT', renderer='json')
    def put(self):
        return create_taxon(self.request)

    @view_config(request_method='DELETE', renderer='json')
    def delete(self):
        return delete_taxon(self.request)


@view_defaults(route_name='synonyms_by_taxon')
class Synonyms(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', renderer='json')
    def get(self):
        sessions = DBSession()
        taxon_id = int(self.request.matchdict['taxon_id'])
        synonyms = sessions.query(Synonym).filter_by(species_id=taxon_id).all()
        return [synonym.as_json_dict() for synonym in synonyms]

    @view_config(request_method='POST', renderer='json')
    def post(self):
        synonym_dict = dict(self.request.json)
        with transaction.manager:
            dbsession = DBSession()
            dbsession.query(Synonym).filter_by(id=synonym_dict['id']).update(synonym_dict)
        return synonym_dict

    @view_config(request_method='PUT', renderer='json')
    def put(self):
        new_synonym_dict = dict(self.request.POST)
        with transaction.manager:
            dbsession = DBSession()
            synonym = Synonym()
            for k, v in new_synonym_dict.items():
                if v == '': v = None
                if hasattr(synonym, k): setattr(synonym, k, v)
            synonym.species_id = int(self.request.matchdict['taxon_id'])
            dbsession.add(synonym)

    @view_config(request_method='DELETE', renderer='json')
    def delete(self):
        with transaction.manager:
            sessions = DBSession()
            synonym_id = int(self.request.matchdict['synonym_id'])
            sessions.query(Synonym).filter_by(id=synonym_id).delete()


@view_config(route_name='get_synonyms', renderer='json')
def get_synonyms(request):
    sessions = DBSession()
    taxon_id = int(request.matchdict['taxon_id'])
    synonyms = sessions.query(Synonym).filter_by(species_id=taxon_id).all()
    synonyms_json = [synonym.as_json_dict() for synonym in synonyms]
    count_synonyms = len(synonyms_json)
    request.response.headerlist = [('Content-Range', '{0}-{1}/{2}'.format(0, count_synonyms, count_synonyms))]
    return synonyms_json
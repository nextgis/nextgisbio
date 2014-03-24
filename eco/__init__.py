# encoding: utf-8

from pyramid.config import Configurator
from sqlalchemy import engine_from_config

from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.session import UnencryptedCookieSessionFactoryConfig


from eco.models import DBSession
from eco.security import RootFactory, groupfinder


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    
    my_session_factory = UnencryptedCookieSessionFactoryConfig('sosecret')
    authn_policy = AuthTktAuthenticationPolicy('sosecret', callback=groupfinder)
    authz_policy = ACLAuthorizationPolicy()
    
    config = Configurator(
        settings=settings,
        root_factory=my_session_factory,
        authentication_policy=authn_policy,
        authorization_policy=authz_policy
    )
    
    
    config.add_static_view('static', 'eco:static', cache_max_age=3600)
    config.add_static_view('contrib', 'eco:contrib', cache_max_age=3600)
    
    config.add_route('home', '/', factory=RootFactory)
    config.add_route('taxons_editor', '/taxons/editor', factory=RootFactory)

    config.add_route('login', '/login', factory=RootFactory)
    config.add_route('logout', '/logout', factory=RootFactory)


    config.add_route('taxon_filter', '/taxon/filter', factory=RootFactory)
    config.add_route('species_name', '/species', factory=RootFactory)
    config.add_route('taxon_direct_child', '/taxon/direct_child',      factory=RootFactory)
    config.add_route('taxon_parent_path', '/taxon/parent_path/{id}',  factory=RootFactory)
    config.add_route('taxon_type', '/taxon/type/{id}',       factory=RootFactory)
    config.add_route('taxon_cbtree', '/cbtree/taxons', factory=RootFactory)
    config.add_route('get_taxon_tree_childrens', '/tree/taxons/{taxon_parent_id}', factory=RootFactory)
    config.add_route('taxon_tree', '/tree/taxons/', factory=RootFactory)
    config.add_route('get_taxon', '/taxon/{id}', factory=RootFactory)

    # reports
    config.add_route('protected_species_list', '/reports/protected_species_list', factory=RootFactory)
    config.add_route('redbook_filter', '/redbook/filter', factory=RootFactory)
    config.add_route('species_by_redbook', '/species/redbook/{redbook_id}', factory=RootFactory)

    # Фильтр видов по его типу, подстроки названия и (если указан) id
    config.add_route('species_filter',    '/species/{type}/{id:[0-9]*}',       factory=RootFactory)
    
    
    # Карточки наблюдений, где был описан определенный таксон:
    config.add_route('points_text',         '/points_text/',            factory=RootFactory)

    # Экспорт карточек наблюдений
    config.add_route('cards_download',  '/cards_download/{format}/',    factory=RootFactory)
    # Создание новой карточки наблюдения 
    config.add_route('new_card',            '/cards/new',               factory=RootFactory)
    # Сохранить карточку после редактирования
    config.add_route('save_card',           '/cards/save',         factory=RootFactory)
    # Карточка наблюдений в формате json
    config.add_route('cards_view',          '/cards/{id}',              factory=RootFactory)
    
    # Аннотированные списки в квадрате № id, с описанем определенного таксона:
    config.add_route('anns_text',         '/anns_text/square/{id}',     factory=RootFactory)
    # Экспорт аннотированных списков
    config.add_route('anns_download',  '/anns_download/{format}/',      factory=RootFactory)
    # Создание нового анн. списка
    config.add_route('new_anlist',          '/annotation/new',          factory=RootFactory)
    # Сохранить анн. список после редактирования
    config.add_route('save_anlist',         '/annotation/save',    factory=RootFactory)
    

    # Квадраты и ключевые участки
    config.add_route('squares_text',        '/squares_text/',           factory=RootFactory)
    # Квадрат и ключевые участки, на которые он попадает
    config.add_route('square',              '/square/{id}',             factory=RootFactory)
    # Аннотации по ключевому участку
    config.add_route('karea_ann',           '/key_area/{id}/ann',       factory=RootFactory)
    
    # Квадраты, где был найден определенный таксон:
    config.add_route('areal_text',          '/areal_text/',             factory=RootFactory)
    # Квадраты, где был найден определенный таксон:
    config.add_route('areal_download',      '/areal/download/',         factory=RootFactory)
    
    # Выдать данные из таблицы связей квадраты-КУ в формате csv
    config.add_route('s_ka_association_download',  'association_download',       factory=RootFactory)

    # Справочники:
    config.add_route('person_name',         '/person_name',             factory=RootFactory)
    # Инфоресурсы
    config.add_route('inforesources_name',  'inforesources_name',       factory=RootFactory)
    
    # Выдать данные из таблицы в формате json
    config.add_route('table_browse',        '{table}_browse',           factory=RootFactory)

    # Выдать данные по конкретной записи из таблицы в формате json:
    config.add_route('table_view',          '/{table}/{id}',            factory=RootFactory)
    
    # Выдать данные из таблицы в формате csv
    config.add_route('table_download',        '{table}_download',       factory=RootFactory)

    config.scan()
    
    return config.make_wsgi_app()


# encoding: utf-8

from pyramid.security import Allow, Everyone
from pyramid.security import ALL_PERMISSIONS, DENY_ALL

from eco.models import DBSession, User
    
def groupfinder(user_id, request):
    groups = []
    for group_member in DBSession.query(User).filter_by(id=user_id).all():
        groups.append('group:' + group_member.role)
    return groups

class RootFactory(object):
    __acl__ = [ (Allow, Everyone, 'view'),
                (Allow, 'group:editor', 'edit'),
                (Allow, 'group:admin', ('edit', 'admin')),
                
                DENY_ALL 
            ]
                
    def __init__(self, request):
        pass

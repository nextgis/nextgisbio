# encoding: utf-8

import datetime


class JsonifyMixin:
    def __init__(self):
        pass

    def as_json_dict(self, prefix, **init):
        json_dict = dict()
        for c in self.__table__.columns:
            column_name = c.name
            v = getattr(self, column_name)
            if isinstance(v, datetime.datetime):
                v = v.isoformat()
            if prefix:
                column_name = '{}{}'.format(prefix, column_name)
            json_dict[column_name] = v
        
        for k, v in init.items():
            if prefix:
                k = '{}{}'.format(prefix, k)
            json_dict[k] = v
                 
        return json_dict

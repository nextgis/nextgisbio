# encoding: utf-8

import datetime


class JsonifyMixin:
    def as_json_dict(self, **init):
        d = dict()
        for c in self.__table__.columns:
            v = getattr(self, c.name)
            if isinstance(v, datetime.datetime): v = v.isoformat()
            d[c.name] = v
        
        for k, v in init.items():
            d[k] = v
                 
        return d

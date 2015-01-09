# encoding: utf-8

# конвертация unicode -> кодировка
def try_encode(v,coding = 'utf-8'):
    if type(v)!=type(u''):
         return v
    try:
        result = v.encode(coding)
    except UnicodeError: 
        result = 'Encoding problem'
    return result

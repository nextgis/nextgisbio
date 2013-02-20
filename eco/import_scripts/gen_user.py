# encoding: utf-8

'''
Скрипт генерирует sql код для вставки нового пользователя в БД.
'''

from optparse import OptionParser
import hashlib

def unquote(s):
    '''
    Производит замену кавычек в строке:
        ' -> ''
    '''
    s = [x if x!="'" else "''" for x in s]
    return ''.join(s)


def generate_sql(user, password, role):
    '''
    print user, hashlib.sha1(password), role
    '''
    s = 'INSERT INTO "user" (login, password, role) VALUES (\'%s\', \'%s\', \'%s\');' % (user, hashlib.sha1(password).hexdigest(), role)
    print s
    

def main():
    usage = "usage: %prog -u USERNAME -p PASSWORD -r ROLE"
    parser = OptionParser(usage = usage)

    parser.add_option("-u", "--user", dest="user",
        action='store', type="string", help="new login (username)")
    parser.add_option("-p", "--password", dest="passw",
        action='store', type="string", help="uset password")
    parser.add_option("-r", "--role", dest="role",
        action='store', type="string", help="user role")

    (options, args) = parser.parse_args()
    
    if options.user == None or options.passw == None or options.role == None:
        parser.error("incorrect number of arguments")
    
    generate_sql(options.user, options.passw, options.role)

if __name__ == "__main__":
    main()

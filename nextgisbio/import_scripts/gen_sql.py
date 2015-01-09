# encoding: utf-8

'''
Скрипт генерирует sql код для импорта данных.

'''

from optparse import OptionParser
import csv

def unquote(s):
    '''
    Производит замену кавычек в строке:
        ' -> ''
    '''
    s = [x if x!="'" else "''" for x in s]
    return ''.join(s)


def generate_sql(infile, outfile, tabname, delim='\t', id_next_val=True, id_seq=None):
    '''
    Чтение данных из csv файла с разделителями delim и
    генерация sql кода для вставки строк в таблицу tabname.
    Названия колонок берутся из первой строки infile.
    id_next_val -- вставлять ли в колонку id автоинкрементное значение идентификатора,
        если значение id в записи отсутствует
    id_seq -- название автоинкрементной последовательности для генерации идентификаторов. 
        Если id_seq=None, то сгенерировать название по стандартной схеме: id_seq = tabname+'_id_seq'
    '''
    try:
        infile = open(infile)
    except IOError:
        print 'No such file: ' + infile
        exit(1)
    try:
        outfile = open(outfile, 'w')
    except IOError:
        print "Can't open file for writing: " + outfile
        exit(1)
    
    reader = csv.reader(infile, delimiter=delim)
    names = reader.next()
    id_number = names.index('id') # Номер колонки id в файле
    if not id_seq:
        id_seq = tabname+'_id_seq'
    
    records = [line for line in reader]
    
    cols = ', '.join(names)
    for row in records:
        data = [ 'null' if x == '' else ("'"+unquote(x)+"'") for x in row]
        if id_next_val and data[id_number] == 'null':
            # nextval('cards_id_seq')
            data[id_number] = "nextval('%s')" % (id_seq ,)
        data = ', '.join(data)
        template = "INSERT INTO %s (%s) VALUES (%s);\n" % (tabname, cols, data)
        outfile.write(template)

def main():
    usage = "usage: %prog -i INPUTFILE -o OUTPUTFILE -t TABLENAME"
    parser = OptionParser(usage = usage)

    parser.add_option("-i", "--input", dest="infile",
        action='store', type="string", help="read csv from INPUT file")
    parser.add_option("-o", "--output", dest="outfile",
        action='store', type="string", help="write SQL to OUTPUT file")
    parser.add_option("-t", "--table", dest="tabname",
        action='store', type="string", help="save data into table TABNAME")

    (options, args) = parser.parse_args()
    
    if options.infile == None or options.outfile == None or options.tabname == None:
        parser.error("incorrect number of arguments")
    
    generate_sql(options.infile, options.outfile, options.tabname)

if __name__ == "__main__":
    main()

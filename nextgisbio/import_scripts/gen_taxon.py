# encoding: utf-8

import os
import sys
import csv
from optparse import OptionParser

import transaction
from sqlalchemy import engine_from_config
from pyramid.paster import (
    get_appsettings,
    setup_logging,
)
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound

from nextgisbio.models import DBSession, Base
from nextgisbio.models import Taxon


def read_data(filename, delim='\t'):
    results = []
    try:
        infile = open(filename)
    except IOError:
        print 'No such file: ' + infile
        exit(1)
    
    # Ожидаем увидеть в файле строки, состоящие из колонок:
    #'Kingdom', 'Kingdom_source', 'Kingdom_author', 'Phylum', 'Phylum_source', 'Phylum_author', 'Class', 'Class_source', 'Class_author', 'Order', 'Order_source', 'Order_author', 'Family', 'Family_source', 'Family_author', 'Genus', 'Genus_source', 'Genus_author', 'Species','Species_source', 'Species_author'
    reader = csv.reader(infile, delimiter=delim)
    names = reader.next()
    records = [line for line in reader]
    for k, k_s, k_a, p, p_s, p_a, c, c_s, c_a, o, o_s, o_a, f, f_s, f_a, g, g_s, g_a, s, s_s, s_a in records:
        results.append({
            'Kingdom': k, 'Kingdom_source': k_s, 'Kingdom_author': k_a, 
            'Phylum': p, 'Phylum_source': p_s, 'Phylum_author': p_a, 
            'Class': c, 'Class_source': c_s, 'Class_author': c_a, 
            'Order': o, 'Order_source': o_s, 'Order_author': o_a, 
            'Family': f, 'Family_source': f_s, 'Family_author': f_a, 
            'Genus': g, 'Genus_source': g_s, 'Genus_author': g_a, 
            'Species': s, 'Species_source': s_s, 'Species_author': s_a
        })
    return results
    
def gen_sql(records):
    with transaction.manager:
        for r in records:
            id = None
            for t in 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species':
                try:
                    print t, r[t]
                    taxon = DBSession.query(Taxon).filter_by(taxon_type = t, name = r[t], parent_id = id).one()
                    print taxon
                except NoResultFound:
                    taxon = Taxon(taxon_type = t, name = r[t], parent_id = id, author=r[t+'_author'], source=r[t+'_source'])
                    DBSession.add(taxon)
                    DBSession.flush()
                id = taxon.id
                print taxon.id, taxon.taxon_type, taxon.name, taxon.parent_id
                 
                

def main(argv=sys.argv):
    usage = 'usage: %prog -i INPUTFILE  -c <config_uri>\n (example: "%prog -i data.scv  development.ini")'
    parser = OptionParser(usage = usage)
    parser.add_option("-i", "--input", dest="infile",
        action='store', type="string", help="read csv from INPUT file")
    parser.add_option("-c", "--config", dest="config",
        action='store', type="string", help="config file")
        
    (options, args) = parser.parse_args()
    if options.infile == None or options.config == None:
        parser.error("incorrect number of arguments")
    config_uri = options.config
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    
    # Заполним таблицы данными:
    gen_sql(read_data(options.infile))
       
       
if __name__ == "__main__":
    main()

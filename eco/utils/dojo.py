import re


def parse_sort(request, default='name asc'):
    order_by_clauses = None
    for key, val in request.params.iteritems():
        if key.startswith('sort('):
            order_by_clauses = []
            m = re.search(r"\(([A-Za-z0-9_+\-, ]+)\)", key)
            if m:
                clauses = m.group(0)[1:-1].split(',')
                for clause in clauses:
                    direcion = None
                    if clause[0] == ' ':
                        direcion = 'asc'
                    elif clause[0] == '-':
                        direcion = 'desc'
                    order_by_clauses.append('{0} {1}'.format(clause[1:-1] + clause[-1], direcion))
    if order_by_clauses:
        order_by_clauses = ','.join(order_by_clauses)
    else:
        order_by_clauses = 'name asc'
    return order_by_clauses
def get_paging_params(request_params):
    start, count = None, None
    if ('start' in request_params) and request_params['start'].isdigit() and \
            ('count' in request_params) and request_params['count'].isdigit():
        start = int(request_params['start'])
        count = int(request_params['count'])
    return start, count


def get_parsed_search_attr(request_params, attr_name='name'):
    parsed_name = None
    if (attr_name in request_params) and request_params[attr_name]:
        parsed_name = request_params[attr_name]
        if '%' not in parsed_name:
            parsed_name = ''.join([parsed_name, '%'])
    return parsed_name
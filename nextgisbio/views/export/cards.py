# encoding: utf-8

import os
from datetime import datetime
from tempfile import NamedTemporaryFile

import pypandoc
import pyramid.httpexceptions as exc
from pyramid import security
from pyramid.renderers import render_to_response
from pyramid.response import FileResponse
from pyramid.view import view_config
from nextgisbio.models import DBSession, Cards, Taxon
from nextgisbio.views.cards.views_jtable import cards_jtable_browse


@view_config(route_name='export_cards_table')
def cards_table(request):
    if not security.authenticated_userid(request):
        raise exc.HTTPForbidden()

    output_format = request.GET['format']

    result = cards_jtable_browse(request)

    if output_format not in _get_formats():
        raise exc.HTTPException('Format "' + output_format + '" not supported')

    params = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'result': result
    }

    html = render_to_response('export/cards-export.mako', params, request=request)

    # with open('nextgisbio/templates/export/cards.tex', 'r') as tex_file:
    #     tex_tmpl = tex_file.read()

    file_object = NamedTemporaryFile(suffix='.' + output_format)

    extra_args = (
        '--smart',
        '--standalone',
        '--latex-engine=xelatex',
        # '-c', '/home/karavanjo/projects/nextgis/bio/nextgisbio/nextgisbio/static/css/main.css',
        '-V', 'mainfont:Linux Libertine O',
        '-V', 'geometry:top=2cm, bottom=2cm, left=2cm, right=2cm'
    )

    pypandoc.convert(html.body, output_format, format='markdown', outputfile=file_object.name, extra_args=extra_args)

    return FileResponse(os.path.abspath(file_object.name))


def _get_formats():
    return {
        'pdf': True,
        'docx': True,
        'rtf': True,
        'odt': True
    }

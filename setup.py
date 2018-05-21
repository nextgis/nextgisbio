import os
from subprocess import check_output, CalledProcessError
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.md')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

try:
    gv = check_output(['gdal-config', '--version']).strip()
except CalledProcessError:
    gv = None

requires = [
    'pyramid',
    'pyramid_mako',
    'SQLAlchemy==0.8.7',
    'transaction',
    'pyramid_tm',
    'pyramid_debugtoolbar',
    'zope.sqlalchemy==0.7.6',
    'waitress',
    'psycopg2',
    'GeoAlchemy',
    'pygdal' + (('>=' + gv + '.0,<=' + gv + '.9999') if gv else ''),
    'shapely',
    'Pillow',
    'sphinx',
    'pypandoc',
    'python-docx'
    ]

setup(name='nextgisbio',
      version='0.10',
      description='nextgisbio',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='NextGIS',
      author_email='info@nextgis.ru',
      url='https://github.com/nextgis/nextgisbio',
      keywords='web pyramid nextgis biodiversity GIS',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      test_suite='nextgisbio',
      install_requires=requires,
      entry_points="""\
      [paste.app_factory]
      main = nextgisbio:main
      [console_scripts]
      initialize_ngbio_db = nextgisbio.scripts.initializedb:main
      dump_ngbio_db = nextgisbio.scripts.dump:main
      verify_data_by_csv = nextgisbio.scripts.verify_data_by_csv:main
      """,
      )


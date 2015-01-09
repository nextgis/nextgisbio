import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid',
    'pyramid_mako',
    'SQLAlchemy',
    'transaction',
    'pyramid_tm',
    'pyramid_debugtoolbar',
    'zope.sqlalchemy',
    'waitress',
    'psycopg2',
    'GeoAlchemy',
    #'GDAL',
    'shapely',
    'Pillow'
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
      author='',
      author_email='',
      url='',
      keywords='web wsgi bfg pylons pyramid',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      test_suite='nextgisbio',
      install_requires=requires,
      entry_points="""\
      [paste.app_factory]
      main = nextgisbio:main
      [console_scripts]
      initialize_eco_db = nextgisbio.scripts.initializedb:main
      """,
      )


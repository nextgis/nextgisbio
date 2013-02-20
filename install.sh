#!/bin/sh

PROJ_HOME=$(pwd)
GDAL_VER=$(gdal-config --version)

virtualenv --no-site-packages env
${PROJ_HOME}/env/bin/pip install -e ./

${PROJ_HOME}/env/bin/pip install --no-install GDAL==$GDAL_VER
cd ${PROJ_HOME}/env/build/GDAL/
${PROJ_HOME}/env/bin/python setup.py build_ext --include-dirs=/usr/include/gdal/
${PROJ_HOME}/env/bin/pip install --no-download GDAL
cd ${PROJ_HOME}

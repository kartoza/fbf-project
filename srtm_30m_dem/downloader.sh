#!/bin/bash
# You need to create a username and password from https://urs.earthdata.nasa.gov//users/new
# You can run the script by specifying the base_url, username, password like ./downloader.sh http://foobar username pass

BASE_URL=https://e4ftl01.cr.usgs.gov/MEASURES/SRTMGL1.003/2000.02.11/
USERNAME='addloe@gmail.com'
PASSWORD='CaXa3HWzW1V7olAHKxqd'

if [ -n "$1" ]
then
    BASE_URL=$1
fi

if [ -n "$2" ]
then
    USERNAME=$1
fi

if [ -n "$3" ]
then
    PASSWORD=$1
fi

function create_dir() {
DATA_PATH=$1

if [[ ! -d ${DATA_PATH} ]];
then
    echo "Creating" ${DATA_PATH}  "directory"
    mkdir -p ${DATA_PATH}
else
    echo ${DATA_PATH} "exists - skipping creation"
fi
}

resources_dir="output"
work_dir=`pwd`

create_dir ${resources_dir}
create_dir ${work_dir}/archives

pushd ${resources_dir}

for file in `cat ../data.txt`;do wget --user ${USERNAME} --password ${PASSWORD} --progress=bar:force:noscroll \
    -c --no-check-certificate ${BASE_URL}/${file};
done



for file in `ls *.zip`; do
    unzip ${file} &&  mv ${file} ../archives
done

gdalbuildvrt indonesia_srtm_30m.vrt  *.hgt

gdalwarp -of GTiff -tr 0.0002777777777777788 -0.0002777777777777788 -tap \
-cutline ../../docker-osm-examples/indonesia-buildings/docker-osm-settings/clip/clip.shp -cl clip \
-crop_to_cutline -dstnodata -9999.0 -multi -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=9 -co BIGTIFF=YES \
indonesia_srtm_30m.vrt indonesia_clip.tif

gdaladdo --config BIGTIFF_OVERVIEW YES indonesia_clip.tif 2 4 8 16 32 64 128 256 512

# Assumes you have postgis installed on the host running this or the docker container for this
raster2pgsql -s 4326 -I -C -M indonesia_clip.tif -F -t 100x100 public.dem > elevation.sql
psql -d gis -p 5432 -U docker -h localhost -f elevation.sql




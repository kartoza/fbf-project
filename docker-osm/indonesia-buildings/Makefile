PROJECT_ID := indonesia-buildings-osm-mirror
COMPOSE := -f docker-compose.yml

SHELL := /bin/bash

# ----------------------------------------------------------------------------
#    P R O D U C T I O N     C O M M A N D S
# ----------------------------------------------------------------------------
deploy: run-docker-osm-setting run import-clip
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Bringing up docker osm instance and loading clip region"
	@echo "------------------------------------------------------------------"

run: run-docker-osm-setting 
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Bringing up docker osm instance "
	@echo "------------------------------------------------------------------"
	@docker-compose -f docker-compose.yml -p $(PROJECT_ID) up -d --no-recreate

run-docker-osm-setting:
	@echo "------------------------------------------------------------------"
	@echo "Get setting of "
	@echo "------------------------------------------------------------------"
	$(MAKE) -C docker-osm-settings osm-settings

import-clip:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Importing clip shapefile into the database"
	@echo "------------------------------------------------------------------"
	@docker-compose -p $(PROJECT_ID) exec imposm apt update
	@docker-compose -p $(PROJECT_ID) exec imposm apt install -y gdal-bin
	@docker-compose -p $(PROJECT_ID) exec imposm /usr/bin/ogr2ogr -progress -skipfailures -lco GEOMETRY_NAME=geom -nlt PROMOTE_TO_MULTI -f PostgreSQL PG:"host=db user=docker password=docker dbname=gis" /home/settings/clip/clip.shp


kill:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Killing in production mode"
	@echo "------------------------------------------------------------------"
	@docker-compose $(COMPOSE) -p $(PROJECT_ID) kill

rm: kill
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Removing production instance!!! "
	@echo "------------------------------------------------------------------"
	@docker-compose $(COMPOSE) -p $(PROJECT_ID) rm

rm-volumes:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Removing all volumes!!!! "
	@echo "------------------------------------------------------------------"
	@docker volume rm $(PROJECT_ID)_osm-postgis-data $(PROJECT_ID)_import_queue $(PROJECT_ID)_import_done $(PROJECT_ID)_cache

logs:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Show logs of stack status"
	@echo "------------------------------------------------------------------"
	@docker-compose -f docker-compose.yml -p $(PROJECT_ID) logs -f

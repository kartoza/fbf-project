PROJECT_ID := indonesia-buildings-osm-mirror
osm-settings:
	@echo
	@echo "------------------------------------------------------------------"
	@echo "Status in production mode"
	@echo "------------------------------------------------------------------"
	@docker build -t "$(PROJECT_ID)-profile:latest" .
	@docker run -d --name $(PROJECT_ID)_profile $(PROJECT_ID)-profile
	@docker cp $(PROJECT_ID)_profile:/settings ../docker-osm-settings
	@docker rm -f $(PROJECT_ID)_profile
	@cd ..

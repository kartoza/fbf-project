-- Updates for all tables
-- These are mandatory first
ALTER table osm_buildings add column building_type character varying (100);
ALTER table osm_buildings add column building_type_score double precision;
ALTER table osm_buildings add column building_area  double precision;
ALTER TABLE osm_buildings add column building_area_score double precision;
ALTER table osm_buildings add column building_material_score double precision;
ALTER TABLE osm_buildings add column building_road_length double precision;
ALTER TABLE osm_buildings add column building_road_density_score double precision;
ALTER table osm_buildings add column total_vulnerability double precision;
ALTER TABLE osm_roads add column road_type character varying (50);
ALTER table osm_waterways add column waterway_id integer;

-- These ones are secondary can be run at some point in time
ALTER table osm_buildings add column building_river_distance  double precision;
ALTER table osm_buildings add column building_distance_score double precision;
ALTER table osm_buildings add column vertical_river_distance double precision;
ALTER table osm_buildings add column building_elevation double precision;
ALTER TABLE osm_buildings add column building_river_distance_score double precision;
ALTER table osm_roads add column roads_id integer;

-- new schema tables
CREATE table flood_map (
    id serial primary key ,
    place_name character varying (255),
    notes character varying (255),
    return_period timestamp,
    measuring_station_id integer
);



create table forecast_flood_event (
  id serial primary key ,
  flood_map_id integer references flood_map(id),
  acquisition_date timestamp not null default now(),
  forecast_date timestamp ,
  source character varying (255),
  notes character varying (255),
  link text
);

create table depth_class (
    id serial primary key ,
    min_m double precision,
    max_m double precision,
    label character varying (255)
);

create table flooded_area (
    id serial primary key ,
    depth_class integer references depth_class(id),
    geometry geometry(MultiPolygon,4326)
);

create table flooded_areas (
    id serial primary key ,
    flood_map_id integer references flood_map(id),
    flooded_area_id integer references flooded_area (id)
);




create table forecast_flood_event_buildings (
    id serial primary key ,
    fd_osm_id bigint not null ,
    building_id int not null ,
    forecast_flood_event_id integer  references forecast_flood_event(id),
    foreign key (building_id, fd_osm_id)references osm_buildings(id, osm_id),
    depth_class_id integer references  depth_class(id)
);


create table flood_event_villages (
    id serial primary key ,
    forecast_flood_event_id integer  references forecast_flood_event(id),
    village_id double precision references village(village_code),
    depth_class_id integer references depth_class(id),
    building_count integer
);

create table flood_event_sub_districts (
    forecast_flood_event_id integer  references forecast_flood_event(id),
    village_id integer references sub_district(sub_dc_code),
    depth_class_id integer references depth_class(id)
);

create table flood_event_districts (
    forecast_flood_event_id integer  references forecast_flood_event(id),
    village_id integer references district(dc_code),
    depth_class_id integer references depth_class(id)
);


-- Add a trigger function to notify QGIS of DB changes
CREATE FUNCTION public.notify_qgis() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN NOTIFY qgis;
        RETURN NULL;
        END;
    $$;

-- Create  functions here to update db records

CREATE OR REPLACE FUNCTION building_types_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
    CASE
           WHEN new.amenity ILIKE '%school%' OR new.amenity ILIKE '%kindergarten%' THEN 'School'
           WHEN new.amenity ILIKE '%university%' OR new.amenity ILIKE '%college%' THEN 'University/College'
           WHEN new.amenity ILIKE '%government%' THEN 'Government'
           WHEN new.amenity ILIKE '%clinic%' OR new.amenity ILIKE '%doctor%' THEN 'Clinic/Doctor'
           WHEN new.amenity ILIKE '%hospital%' THEN 'Hospital'
           WHEN new.amenity ILIKE '%fire%' THEN 'Fire Station'
           WHEN new.amenity ILIKE '%police%' THEN 'Police Station'
           WHEN new.amenity ILIKE '%public building%' THEN 'Public Building'
           WHEN new.amenity ILIKE '%worship%' and (religion ILIKE '%islam' or religion ILIKE '%muslim%')
               THEN 'Place of Worship - Islam'
           WHEN new.amenity ILIKE '%worship%' and religion ILIKE '%budd%' THEN 'Place of Worship - Buddhist'
           WHEN new.amenity ILIKE '%worship%' and religion ILIKE '%unitarian%' THEN 'Place of Worship - Unitarian'
           WHEN new.amenity ILIKE '%mall%' OR new.amenity ILIKE '%market%' THEN 'Supermarket'
           WHEN new.landuse ILIKE '%residential%' OR new.use = 'residential' THEN 'Residential'
           WHEN new.landuse ILIKE '%recreation_ground%' OR (leisure IS NOT NULL AND leisure != '') THEN 'Sports Facility'
           -- run near the end
           WHEN new.amenity = 'yes' THEN 'Residential'
           WHEN new.use = 'government' AND new."type" IS NULL THEN 'Government'
           WHEN new.use = 'residential' AND new."type" IS NULL THEN 'Residential'
           WHEN new.use = 'education' AND new."type" IS NULL THEN 'School'
           WHEN new.use = 'medical' AND new."type" IS NULL THEN 'Clinic/Doctor'
           WHEN new.use = 'place_of_worship' AND new."type" IS NULL THEN 'Place of Worship'
           WHEN new.use = 'school' AND new."type" IS NULL THEN 'School'
           WHEN new.use = 'hospital' AND new."type" IS NULL THEN 'Hospital'
           WHEN new.use = 'commercial' AND new."type" IS NULL THEN 'Commercial'
           WHEN new.use = 'industrial' AND new."type" IS NULL THEN 'Industrial'
           WHEN new.use = 'utility' AND new."type" IS NULL THEN 'Utility'
           -- Add default type
           WHEN new."type" IS NULL THEN 'Residential'
        END
    INTO new.building_type
    FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE OR REPLACE FUNCTION building_recode_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
     SELECT

        CASE
            WHEN new.building_type = 'Clinic/Doctor' THEN 0.7
            WHEN new.building_type = 'Commercial' THEN 0.7
            WHEN new.building_type = 'School' THEN 1
            WHEN new.building_type = 'Government' THEN 0.7
            WHEN new.building_type ILIKE 'Place of Worship%' THEN 0.5
            WHEN new.building_type = 'Residential' THEN 1
            WHEN new.building_type = 'Police Station' THEN 0.7
            WHEN new.building_type = 'Fire Station' THEN 0.7
            WHEN new.building_type = 'Hospital' THEN 0.7
            WHEN new.building_type = 'Supermarket' THEN 0.7
            WHEN new.building_type = 'Sports Facility' THEN 0.3
            WHEN new.building_type = 'University/College' THEN 1.0
            ELSE 0.3
        END
     INTO new.building_type_score
     FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE FUNCTION building_area_mapper() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.building_area:=ST_Area(geometry::GEOGRAPHY) ;
  RETURN NEW;
  END
  $$;

CREATE FUNCTION total_vulnerability() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.total_vulnerability:=((new.building_type_score + new.building_material_score + new.building_area_score) / 3);
  RETURN NEW;
  END
  $$;


CREATE OR REPLACE FUNCTION building_area_score_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
  SELECT
        CASE
            WHEN new.building_area <= 10 THEN 1
            WHEN new.building_area > 10 and new.building_area <= 30 THEN 0.7
            WHEN new.building_area > 30 and new.building_area <= 100 THEN 0.5
            WHEN new.building_area > 100 THEN 0.3
            ELSE 0.3
        END
  INTO new.building_area_score
  FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;


CREATE OR REPLACE FUNCTION building_materials_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT

    CASE
        WHEN new."building:material" ILIKE 'brick%' THEN 0.5
        WHEN new."building:material" = 'concrete' THEN 0.1
        ELSE 0.3
    END
    INTO new.building_material_score
    FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

-- this will be replaced by the one Gavin has given me
CREATE OR REPLACE FUNCTION building_road_density_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
            total_length
    INTO new.building_road_length
    FROM (WITH clipping AS
            (SELECT
            ST_Intersection(v.geometry,m.geom) AS intersection_geom,
            v.*,
            m.osm_id as osm_fid
            FROM
              osm_roads as v,
             (select osm_id,st_buffer(ST_SetSRID(ST_Extent(new.geometry),4326)::geography,1000) as geom
FROM osm_buildings   group by geometry,osm_id )
             as m
            WHERE
              ST_Intersects(v.geometry, m.geom) and v.road_type in
                                                    ('trunk','road','secondary','trunk_link','secondary_link',
                                                     'tertiary_link', 'primary', 'residential', 'primary_link',
'motorway_link','motorway')    )
            (SELECT osm_fid,sum(st_length(intersection_geom)) as total_length FROM clipping group by osm_fid)
             ) foo WHERE foo.osm_fid = osm_buildings.osm_id;
  RETURN NEW;

  END
  $$;

CREATE OR REPLACE FUNCTION road_type_mapping () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
    CASE
           WHEN new.type ILIKE 'motorway' OR new.type ILIKE 'highway' or new.type ILIKE 'trunk'
               then 'Motorway or highway'
           WHEN new.type ILIKE 'motorway_link' then 'Motorway link'
           WHEN new.type ILIKE 'primary' then 'Primary road'
           WHEN new.type ILIKE 'primary_link' then 'Primary link'
           WHEN new.type ILIKE 'tertiary' then 'Tertiary'
           WHEN new.type ILIKE 'tertiary_link' then 'Tertiary link'
           WHEN new.type ILIKE 'secondary' then 'Secondary'
           WHEN new.type ILIKE 'secondary_link' then 'Secondary link'
           WHEN new.type ILIKE 'living_street' OR new.type ILIKE 'residential' OR new.type ILIKE 'yes'
                    OR new.type ILIKE 'road' OR new.type ILIKE 'unclassified' OR new.type ILIKE 'service'
           OR new.type ILIKE '' OR new.type IS NULL then 'Road, residential, living street, etc.'
           WHEN new.type ILIKE 'track' then "type" = 'Track'
           WHEN new.type ILIKE 'cycleway' OR new.type ILIKE 'footpath' OR new.type ILIKE 'pedestrian'
                    OR new.type ILIKE 'footway' OR new.type ILIKE 'path' then  "type" = 'Cycleway, footpath, etc.'
        END
    INTO new.road_type
    FROM osm_roads
    ;
  RETURN NEW;
  END
  $$;

 -- WATERWAY COUNT For Features within a flood polygon---
CREATE OR REPLACE VIEW osm_waterways_flood_count_v as
SELECT count(*), foo.flood_id, foo.waterway_id FROM (
WITH water_class as (
     SELECT a.waterway, b.id as waterway_id, a.geometry FROM osm_waterways as a , waterway_type_class as b
       WHERE b.waterway_class = a.waterway
   )
   SELECT waterway,waterway_id,b.id as flood_id FROM water_class as a inner join osm_flood as b
       on ST_Within(a.geometry,b.geometry)
) foo group by foo.flood_id,foo.waterway_id order by foo.flood_id;

-- ROADS COUNT For Features within a flood polygon---
CREATE OR REPLACE VIEW osm_roads_flood_count_v as
SELECT count(*), foo.flood_id, foo.road_id FROM (
WITH road_class as (
   SELECT b.road_class, b.id as road_id, a.geometry FROM osm_roads as a, road_type_class as b
       WHERE b.road_class = a.road_type
   )
   SELECT road_class, road_id,b.id as flood_id FROM road_class as a inner join osm_flood as b
       on ST_Within(a.geometry,b.geometry)
) foo group by foo.flood_id, foo.road_id order by foo.flood_id;

-- BUILDINGS COUNT For Features within a flood polygon--
CREATE OR REPLACE VIEW osm_buildings_intersect_v as
  SELECT b.id as flood_id, a.building_id, a.building_type_score, a.building_material_score, a.building_area_score,
         a.building_road_density_score, a.total_vulnerability
    FROM filtered_osm_buildings_mv as a inner join osm_flood as b on ST_Within(a.geometry,b.geometry) and ST_Within(a.geometry,b.geometry) ;

-- Functions to refresh materialized views
CREATE FUNCTION refresh_osm_build_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY osm_buildings_mv ;
    RETURN NULL;
  END
  $$;


CREATE FUNCTION refresh_osm_roads_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY osm_roads_mv;
    RETURN NULL;
  END
  $$;

CREATE FUNCTION refresh_osm_waterways_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY osm_waterways_mv ;
    RETURN NULL;
  END
  $$;

CREATE FUNCTION refresh_filtered_buildings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY filtered_osm_buildings_mv ;
    RETURN NULL;
  END
  $$;

-- Vulnerability reporting and mapping for Buildings


-- Initial Updates for all tables


-- Initial update for osm_building_type
update osm_buildings set building_type = 'School' WHERE amenity ILIKE '%school%' OR amenity ILIKE '%kindergarten%' ;
update osm_buildings set building_type = 'University/College'   WHERE amenity ILIKE '%university%' OR amenity ILIKE '%college%' ;
update osm_buildings set building_type = 'Government'  WHERE amenity ILIKE '%government%' ;
update osm_buildings set building_type = 'Clinic/Doctor'  WHERE amenity ILIKE '%clinic%' OR amenity ILIKE '%doctor%' ;
update osm_buildings set building_type = 'Hospital' WHERE amenity ILIKE '%hospital%' ;
update osm_buildings set building_type = 'Fire Station'  WHERE amenity ILIKE '%fire%' ;
update osm_buildings set building_type = 'Police Station' WHERE amenity ILIKE '%police%' ;
update osm_buildings set building_type = 'Public Building' WHERE amenity ILIKE '%public building%' ;
update osm_buildings set building_type = 'Place of Worship -Islam' WHERE amenity ILIKE '%worship%' and (religion ILIKE '%islam' or religion ILIKE '%muslim%');
update osm_buildings set building_type = 'Residential'  WHERE amenity = 'yes' ;
update osm_buildings set building_type = 'Place of Worship -Buddhist' WHERE amenity ILIKE '%worship%' and religion ILIKE '%budd%';
update osm_buildings set building_type = 'Place of Worship -Unitarian'  WHERE amenity ILIKE '%worship%' and religion ILIKE '%unitarian%' ;
update osm_buildings set building_type = 'Supermarket'  WHERE amenity ILIKE '%mall%' OR amenity ILIKE '%market%' ;
update osm_buildings set building_type = 'Residential'  WHERE landuse ILIKE '%residential%' OR use = 'residential';
update osm_buildings set building_type = 'Sports Facility' WHERE landuse ILIKE '%recreation_ground%' OR (leisure IS NOT NULL AND leisure != '') ;
           -- run near the end
update osm_buildings set building_type = 'Government'  WHERE use = 'government' AND "type" IS NULL ;
update osm_buildings set building_type = 'Residential'  WHERE use = 'residential' AND "type" IS NULL ;
 update osm_buildings set building_type = 'School'  WHERE use = 'education' AND "type" IS NULL ;
update osm_buildings set building_type = 'Clinic/Doctor' WHERE use = 'medical' AND "type" IS NULL ;
 update osm_buildings set building_type = 'Place of Worship'  WHERE use = 'place_of_worship' AND "type" IS NULL ;
 update osm_buildings set building_type = 'School'   WHERE use = 'school' AND "type" IS NULL ;
 update osm_buildings set building_type = 'Hospital'   WHERE use = 'hospital' AND "type" IS NULL ;
 update osm_buildings set building_type = 'Commercial'   WHERE use = 'commercial' AND "type" IS NULL ;
 update osm_buildings set building_type = 'Industrial'   WHERE use = 'industrial' AND "type" IS NULL ;
 update osm_buildings set building_type = 'Utility'   WHERE use = 'utility' AND "type" IS NULL ;
           -- Add default type
 update osm_buildings set building_type = 'Residential'  WHERE "type" IS NULL ;



-- reclassify road type for osm_roads

update osm_roads set road_type = 'Motorway or highway' WHERE  type ILIKE 'motorway' OR type ILIKE 'highway' or type ILIKE 'trunk' ;
update osm_roads set road_type = 'Motorway link' WHERE  type ILIKE 'motorway_link' ;
update osm_roads set road_type = 'Primary road' WHERE  type ILIKE 'primary';
update osm_roads set road_type = 'Primary link' WHERE  type ILIKE 'primary_link' ;
update osm_roads set road_type = 'Tertiary' WHERE  type ILIKE 'tertiary';
update osm_roads set road_type = 'Tertiary link' WHERE  type ILIKE 'tertiary_link';
update osm_roads set road_type = 'Secondary' WHERE  type ILIKE 'secondary';
update osm_roads set road_type = 'Secondary link' WHERE  type ILIKE 'secondary_link';
update osm_roads set road_type = 'Road, residential, living street, etc.' WHERE  type ILIKE 'living_street' OR type ILIKE 'residential' OR type ILIKE 'yes' OR type ILIKE 'road' OR type ILIKE 'unclassified' OR type ILIKE 'service'
           OR type ILIKE '' OR type IS NULL;

update osm_roads set road_type = "type" = 'Track' WHERE  type ILIKE 'track';
update osm_roads set road_type =  "type" = 'Cycleway, footpath, etc.' WHERE  type ILIKE 'cycleway' OR type ILIKE 'footpath' OR type ILIKE 'pedestrian' OR type ILIKE 'footway' OR type ILIKE 'path';



-- Initial update to recode the building_type calculated above for osm_building_type

update osm_buildings set building_type_score = 0.7 WHERE building_type = 'Clinic/Doctor';
update osm_buildings set building_type_score = 0.7 WHERE building_type = 'Commercial';
update osm_buildings set building_type_score = 1.0 WHERE building_type = 'School';
update osm_buildings set building_type_score = 0.7 WHERE building_type = 'Government';
update osm_buildings set building_type_score = 0.5 WHERE building_type ILIKE 'Place of Worship%' ;
update osm_buildings set building_type_score = 1.0 WHERE building_type = 'Residential';
update osm_buildings set building_type_score = 0.7 WHERE building_type = 'Police Station' ;
update osm_buildings set building_type_score = 0.7 WHERE building_type = 'Fire Station';
update osm_buildings set building_type_score = 0.7 WHERE building_type = 'Hospital';
update osm_buildings set building_type_score = 0.7 WHERE building_type = 'Supermarket';
update osm_buildings set building_type_score = 0.3 WHERE building_type = 'Sports Facility';
update osm_buildings set building_type_score = 1.0 WHERE building_type = 'University/College';
update osm_buildings set building_type_score = 0.3 WHERE building_type_score is null;

-- Create a column to store the area for osm_buildings

update osm_buildings set building_area  = ST_Area(geometry::GEOGRAPHY) ;

-- Initial updates to update the building_area

update osm_buildings set building_area_score  = 1   WHERE building_area <= 10;
update osm_buildings set building_area_score  = 0.7 WHERE building_area > 10 and building_area <= 30;
update osm_buildings set building_area_score  = 0.5 WHERE building_area > 30 and building_area <= 100;
update osm_buildings set building_area_score  = 0.3 WHERE building_area > 100;


-- reclassify building material to create building_material score

update osm_buildings set building_material_score = 0.5 WHERE "building:material" ILIKE 'brick%';
update osm_buildings set building_material_score = 0.1 WHERE "building:material" = 'concrete';
update osm_buildings set building_material_score = 0.3 WHERE building_material_score is null;






-- Update to calculate the road density length (still to write the recoding function )

WITH clipped AS (
                 SELECT m.osm_id, area_sq_km, ST_Intersection(m.geom, v.geometry::geography) AS clipped_geom
                 FROM building_buffer m
                 JOIN osm_roads v ON ST_Intersects(m.geom, v.geometry::geography)

             ),
             agg AS  (
                 SELECT osm_id, (sum(st_length(clipped_geom))/max(area_sq_km))::int AS density_m_per_sq_km
                    FROM clipped

                    GROUP BY osm_id
             )
        UPDATE osm_buildings a SET building_road_density = density_m_per_sq_km
                 FROM agg
                 WHERE a.osm_id = agg.osm_id;

-- Initial updates to update the building_road_density

update osm_buildings set building_road_density_score  = 1   WHERE building_road_density <= 5;
update osm_buildings set building_road_density_score  = 0.8 WHERE building_road_density > 5 and building_road_density <= 15;
update osm_buildings set building_road_density_score  = 0.5 WHERE building_road_density > 15 and building_road_density <= 50;
update osm_buildings set building_road_density_score  = 0.3 WHERE building_road_density > 50 and building_road_density <= 200;
update osm_buildings set building_road_density_score  = 0.1 WHERE building_road_density > 200;

-- Create m views or views for FBIS dashboards
--- Create lookup tables for each distinct type we use for classification in front end
CREATE TABLE building_type_class (id serial, building_class character varying (100));
CREATE TABLE road_type_class (id serial, road_class character varying (100));
CREATE TABLE waterway_type_class (id serial, waterway_class character varying (100));

INSERT INTO building_type_class (building_class) select distinct(building_type) FROM osm_buildings;
INSERT INTO road_type_class (road_class) select distinct(road_type) FROM osm_roads;
INSERT INTO waterway_type_class (waterway_class) select distinct(waterway) FROM osm_waterways;

update osm_roads set roads_id = foo.roads_id from (
     select b.id as roads_id, a.osm_id from osm_roads a, road_type_class b
  WHERE a.road_type::text = b.road_class::text
     ) foo where foo.osm_id = osm_roads.osm_id;


 update osm_waterways set waterway_id = foo.id from (
 	SELECT a.osm_id, b.id
   FROM osm_waterways a,
    waterway_type_class b
  WHERE a.waterway::text = b.waterway_class::text
 	) foo where foo.osm_id = osm_waterways.osm_id;


-- Default count for all buildings by building_type - This is the default count shown in the dashboard

CREATE MATERIALIZED VIEW osm_buildings_mv as
SELECT a.building_type , COUNT (building_type), b.id as building_id
FROM osm_buildings as a, building_type_class as b
WHERE a.building_type = b.building_class
GROUP BY a.building_type,b.id;

CREATE UNIQUE INDEX mv_idx_building_type ON osm_buildings_mv (building_type);
CREATE  INDEX mv_idx_buildings_id ON osm_buildings_mv (building_id);



-- Default count for all roads by road_type - This is the default count shown in the dashboard
CREATE MATERIALIZED VIEW osm_roads_mv as
SELECT a.road_type , COUNT (road_type), b.id as road_id
FROM osm_roads as a, road_type_class as b
WHERE a.road_type = b.road_class
GROUP BY a.road_type,b.id;


CREATE UNIQUE INDEX mv_idx_road_type ON osm_roads_mv (road_type);
CREATE  INDEX mv_idx_road_id ON osm_roads_mv (road_id);


-- Default count for all waterways by waterway - This is the default count shown in the dashboard

CREATE MATERIALIZED VIEW osm_waterways_mv as
SELECT a.waterway , COUNT (waterway), b.id as waterway_id
FROM osm_waterways as a, waterway_type_class as b
WHERE a.waterway = b.waterway_class
GROUP BY a.waterway,b.id;

CREATE UNIQUE INDEX mv_idx_waterway_type ON osm_waterways_mv (waterway);
CREATE  INDEX mv_idx_waterway_id ON osm_waterways_mv (waterway_id);

-- Create OSM Flood layer for inserting FROM dashboard

CREATE TABLE public.osm_flood (
    id SERIAL,
    geometry public.geometry(MultiPolygon,4326),
    name character varying(80)
);

CREATE INDEX idx_osm_flood on osm_flood using gist (geometry);
CREATE INDEX id_osm_flood_name on osm_flood (name);
CREATE INDEX idx_osm_road on osm_roads (road_type);
CREATE INDEX idx_osm_building on osm_buildings (building_type);
CREATE INDEX idx_osm_waterway on osm_waterways (waterway);
CREATE INDEX idx_osm_bd_score on osm_buildings (building_type_score);

-- This is the WMS buildings layer being served and filtered in the dashboard
CREATE MATERIALIZED VIEW filtered_osm_buildings_mv as
    select a.osm_id,a.building_type,a.building_type_score,a.building_material_score,a.building_area_score,
           a.building_road_density_score,a.total_vulnerability, b.id as building_id,a.geometry FROM osm_buildings as a ,building_type_class as b WHERE
a."amenity" not in ('grass','meadow', 'forest','farm','farm_auxiliary','farmland',
'farmyard', 'woods','industrial')  and "building_area" < 7000 and building_type is not null and a.building_type=b.building_class;

CREATE UNIQUE INDEX mv_idx_ft_buildings ON filtered_osm_buildings_mv (osm_id);
CREATE  INDEX mv_idx_ft_buildings ON filtered_osm_buildings_mv (building_type_score);
CREATE  INDEX mv_idy_ft_bd_mt_score ON filtered_osm_buildings_mv (building_material_score);
CREATE  INDEX mv_idy_ft_bd_area_score ON filtered_osm_buildings_mv (building_area_score);
CREATE  INDEX mv_idy_ft_bd_rd_score ON filtered_osm_buildings_mv (building_road_density_score);
CREATE  INDEX mv_idy_ft_bd_vuln_score ON filtered_osm_buildings_mv (total_vulnerability);

-- This is the WMS waterways layer being served and filtered in the dashboard
CREATE MATERIALIZED VIEW filtered_osm_waterways_mv as
    select osm_id,waterway, b.id as waterway_id,a.geometry FROM osm_waterways as a ,waterway_type_class as b WHERE
 a.waterway=b.waterway_class;

CREATE UNIQUE INDEX mv_idx_ft_osm_id ON filtered_osm_waterways_mv (osm_id);
CREATE  INDEX mv_idn_ft_waterways_water ON filtered_osm_waterways_mv (waterway);
CREATE  INDEX mv_idn_ft_waterways_id ON filtered_osm_waterways_mv (waterway_id);

-- This is the WMS roads layer being served and filtered in the dashboard
CREATE MATERIALIZED VIEW filtered_osm_roads_mv as
    select osm_id,road_type, b.id as roads_id,a.geometry FROM osm_roads as a ,road_type_class as b WHERE
 a.road_type=b.road_class;

CREATE UNIQUE INDEX mv_idz_ft_osm_id ON filtered_osm_roads_mv (osm_id);
CREATE  INDEX mv_idn_fz_roads_cond ON filtered_osm_roads_mv (road_type);
CREATE  INDEX mv_idn_fz_roads_id ON filtered_osm_roads_mv (roads_id);

-- views to use when creating flood polygons

  CREATE OR REPLACE VIEW osm_buildings_flood_v as

    SELECT d.id as flood_id , c.osm_id, c.building_type_score,c.building_material_score,c.building_area_score,
           c.building_road_density_score,c.total_vulnerability , c.geometry from filtered_osm_buildings_mv as c
               inner join osm_flood as d on ST_Intersects(c.geometry,d.geometry);

   CREATE OR REPLACE VIEW osm_waterways_flood_v as

    SELECT d.id as flood_id , c.osm_id,c.waterway, c.geometry from filtered_osm_waterways_mv as c inner join
        osm_flood as d on ST_Intersects(c.geometry,d.geometry);


-- View for intersection between uploaded flood layer and osm_roads
   CREATE OR REPLACE VIEW flood_roads_bbox_v as

    SELECT d.id as flood_id , c.osm_id, c.geometry from osm_roads as c inner join flood as d
        on ST_Intersects(c.geometry,d.geometry);

-- All triggers will come in the last part
-- Based on the tables defined in the mapping.yml create triggers



CREATE TRIGGER notify_admin
  AFTER INSERT OR UPDATE OR DELETE  ON public.osm_admin
    FOR EACH STATEMENT EXECUTE PROCEDURE public.notify_qgis();

    CREATE TRIGGER notify_buildings
  AFTER INSERT OR UPDATE OR DELETE  ON public.osm_buildings
    FOR EACH STATEMENT EXECUTE PROCEDURE public.notify_qgis();


    CREATE TRIGGER notify_roads
  AFTER INSERT OR UPDATE OR DELETE  ON public.osm_roads
    FOR EACH STATEMENT EXECUTE PROCEDURE public.notify_qgis();

    CREATE TRIGGER notify_waterways
  AFTER INSERT OR UPDATE OR DELETE  ON public.osm_waterways
    FOR EACH STATEMENT EXECUTE PROCEDURE public.notify_qgis();

CREATE TRIGGER building_type_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_types_mapper ();

CREATE TRIGGER st_building_recoder BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_recode_mapper();

CREATE TRIGGER area_recode_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_area_mapper();

CREATE TRIGGER building_material_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_materials_mapper();


CREATE TRIGGER buildings_stats_rf BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE refresh_osm_build_stats();

CREATE TRIGGER roads_stats_rf BEFORE INSERT OR UPDATE ON osm_roads FOR EACH ROW EXECUTE PROCEDURE refresh_osm_roads_stats();

CREATE TRIGGER waterways_stats_rf BEFORE INSERT OR UPDATE ON osm_waterways FOR EACH ROW EXECUTE PROCEDURE refresh_osm_waterways_stats();

CREATE TRIGGER road_length_calc BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_road_density_mapper () ;

CREATE TRIGGER z_filtered_osm_build_tg BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
   refresh_filtered_buildings() ;

-- All the following logic is not being used in the Dashboard but should exists in the DB anyway

-- Function to update the distance FROM a river to the centroid of the building

update osm_buildings set building_river_distance =foo.distance FROM (SELECT ST_Distance(ST_Centroid(st_transform(geometry,3857)), st_transform(rt.geometry,3857)) as distance

         FROM   osm_waterways AS rt
         ORDER BY
               st_transform(geometry,3857) <-> st_transform(rt.geometry,3857)
         LIMIT  1) foo;



--- Reclassify building_river_distance to create building_river_distance_score

update osm_buildings set building_river_distance_score = 1.0 WHERE building_river_distance > 0 and building_river_distance <= 100;
update osm_buildings set building_river_distance_score = 0.7 WHERE building_river_distance > 100 and building_river_distance <= 300;
update osm_buildings set building_river_distance_score = 0.5 WHERE building_river_distance > 300 and building_river_distance <= 500;
update osm_buildings set building_river_distance_score = 0.3 WHERE building_river_distance > 500;
update osm_buildings set building_river_distance_score = 0.3 WHERE building_river_distance is null;

-- update to calculate the elevation of the nearest river in relation to  building centroid

update osm_buildings set vertical_river_distance =ST_VALUE(foo.rast, foo.geom)
    FROM (WITH location as (
        SELECT ST_X(st_centroid(geometry)) as latitude,ST_Y(st_centroid(geometry)) as longitude,
        ST_SetSRID(St_MakePoint(ST_X(st_centroid(geometry)),ST_Y(st_centroid(geometry))),4326) as geom
         FROM osm_buildings )
        SELECT ST_LineInterpolatePoint(b.geometry, 0.5) as geom, e.rast FROM location as a , osm_waterways as b, dem as e
        WHERE ST_Intersects(e.rast, a.geom)
        ORDER BY a.geom <-> b.geometry
        LIMIT  1) foo;



-- update to calculate the elevation of a building's centroid FROM a raster cell

update osm_buildings set building_elevation =foo.height

    FROM (WITH centroid as (
 select ST_SetSRID(St_MakePoint(ST_X(st_centroid(geometry)),ST_Y(st_centroid(geometry))),4326) as geom FROM osm_buildings
 )
 SELECT ST_VALUE(e.rast, b.geom) as height
  FROM dem e , centroid as b
    WHERE ST_Intersects(e.rast, b.geom)) foo;




-- create a function that recodes the values of the building elevation against the river elevation (low_lying_area_score)

UPDATE osm_buildings set low_lying_area_score = 1.0 WHERE (building_elevation - vertical_river_distance) <= 0;
UPDATE osm_buildings set low_lying_area_score = 0.8 WHERE (building_elevation - vertical_river_distance) > 0 and (building_elevation - vertical_river_distance) <= 1;
UPDATE osm_buildings set low_lying_area_score = 0.5 WHERE (building_elevation - vertical_river_distance) > 1 and (building_elevation - vertical_river_distance) <= 2;
UPDATE osm_buildings set low_lying_area_score = 0.1 WHERE (building_elevation - vertical_river_distance) > 2;


CREATE OR REPLACE FUNCTION river_distance_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
     SELECT ST_Distance(ST_Centroid(st_transform(NEW.geometry),3857), st_transform(rt.geometry,3857))
         INTO   NEW.building_river_distance
         FROM   osm_waterways AS rt
         ORDER BY
                st_transform(NEW.geometry,3857) <-> st_transform(rt.geometry,3857)
         LIMIT  1;

     RETURN NEW;
   END
  $$;

CREATE TRIGGER river_distance_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    river_distance_mapper ();


CREATE OR REPLACE FUNCTION river_distance_recode_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        CASE
            WHEN new.building_river_distance > 0 and new.building_river_distance <= 100 THEN 1.0
            WHEN new.building_river_distance > 100 and new.building_river_distance <= 300  THEN 0.7
            WHEN new.building_river_distance > 300 and new.building_river_distance <= 500  THEN 0.5
            WHEN new.building_river_distance > 500 THEN 0.3
            ELSE 0.3
        END
    INTO new.building_river_distance_score
    FROM osm_buildings
    ;
  RETURN NEW;

  END
  $$;

CREATE TRIGGER st_river_recode BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    river_distance_recode_mapper ();

CREATE OR REPLACE FUNCTION river_elevation_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
            ST_VALUE(rast, geom)
    INTO new.vertical_river_distance
    FROM (WITH location as (
        SELECT ST_X(st_centroid(new.geometry)) as latitude,ST_Y(st_centroid(new.geometry)) as longitude,
        ST_SetSRID(St_MakePoint(ST_X(st_centroid(new.geometry)),ST_Y(st_centroid(new.geometry))),4326) as geom
         FROM osm_buildings )
        SELECT st_line_interpolate_point(b.geometry, 0.5) as geom, e.rast FROM location as a , osm_waterways as b, dem as e
        WHERE ST_Intersects(e.rast, a.geom)
        ORDER BY a.geom <-> b.geometry
        LIMIT  1) foo;
  RETURN NEW;

  END
  $$;

CREATE TRIGGER river_elevation_calc BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    river_elevation_mapper () ;

CREATE OR REPLACE FUNCTION building_elevation_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
            height
    INTO new.building_elevation
    FROM (WITH centroid as (
 select ST_SetSRID(St_MakePoint(ST_X(st_centroid(new.geometry)),ST_Y(st_centroid(new.geometry))),4326) as geom FROM osm_buildings
 )
 SELECT ST_VALUE(e.rast, b.geom) as height
  FROM dem e , centroid as b
    WHERE ST_Intersects(e.rast, b.geom)) foo;
  RETURN NEW;

  END
  $$;
CREATE TRIGGER building_elevation_calc BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_elevation_mapper () ;

CREATE OR REPLACE FUNCTION elevation_recode_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        CASE
            WHEN (new.building_elevation - new.vertical_river_distance) <= 0  THEN 1.0
            WHEN (new.building_elevation - new.vertical_river_distance) > 0 and (new.building_elevation - new.vertical_river_distance) <= 1   THEN 0.8
            WHEN (new.building_elevation - new.vertical_river_distance) > 1 and (new.building_elevation - new.vertical_river_distance) <= 2  THEN 0.5
            WHEN (new.building_elevation - new.vertical_river_distance) > 2 THEN 0.1
            ELSE 0.3
        END
    INTO new.elevation_area_score
    FROM osm_buildings
    ;
  RETURN NEW;

  END
  $$;

CREATE TRIGGER st_elevation_recoder BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    elevation_recode_mapper () ;


-- count number or roads intersecting Surabaya
CREATE VIEW osm_roads_surabaya_stats as
SELECT type, COUNT(osm_id) FROM (
    SELECT DISTINCT ON (a.osm_id) a.osm_id, a.type
    FROM osm_roads as a
    INNER JOIN osm_admin as b ON ST_Intersects(a.geometry, b.geometry) WHERE b.name = 'Surabaya'
) subquery
GROUP BY type ;


-- count number of rivers intersecting surabaya
CREATE OR REPLACE VIEW osm_rivers_surabaya_stats as
SELECT waterway, COUNT(osm_id) FROM (
    SELECT DISTINCT ON (a.osm_id) a.osm_id, a.waterway
    FROM osm_waterways as a
    INNER JOIN osm_admin as b ON ST_Intersects(a.geometry, b.geometry) WHERE b.name = 'Surabaya'
) subquery
GROUP BY waterway ;

-- count number of buildings intersecting surabaya
CREATE OR REPLACE VIEW osm_buildings_surabaya_stats as
SELECT building_type, COUNT(osm_id) FROM (
    SELECT DISTINCT ON (a.osm_id) a.osm_id, a.building_type
    FROM osm_buildings as a
    INNER JOIN osm_admin as b ON ST_Intersects(a.geometry, b.geometry) WHERE b.name = 'Surabaya'
) subquery
GROUP BY building_type ;

-- Find all the names of admin areas intersecting a flood layer

create view flood_admin_areas_intersect_v as
select b.name as village_name,c.name as province_name, d.name as district_name,
e.name as sub_district_name, a.id as flood_id from osm_flood as a join village as b on
st_intersects(b.geom,a.geometry) join province as c on c.prov_code = b.prov_code
join district as d on d.dc_code = b.dc_code
join sub_district as e on e.sub_dc_code = b.sub_dc_code;


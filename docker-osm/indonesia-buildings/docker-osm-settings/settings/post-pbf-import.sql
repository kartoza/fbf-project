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
ALTER table osm_buildings add column village_id double precision references village (village_code);
ALTER table osm_buildings add column sub_district_id numeric references  sub_district(sub_dc_code);
ALTER table osm_buildings add column district_id double precision references public.district (dc_code);

-- OSM DB Reclassification based on some criteria

-- Recode building type to follow OSM Reporter classes
update osm_buildings set building_type = 'School' WHERE amenity ILIKE '%school%' OR amenity ILIKE '%kindergarten%' ;
update osm_buildings set building_type = 'University/College'   WHERE amenity ILIKE '%university%' OR amenity ILIKE '%college%' ;
update osm_buildings set building_type = 'Government'  WHERE amenity ILIKE '%government%' ;
update osm_buildings set building_type = 'Clinic/Doctor'  WHERE amenity ILIKE '%clinic%' OR amenity ILIKE '%doctor%' ;
update osm_buildings set building_type = 'Hospital' WHERE amenity ILIKE '%hospital%' ;
update osm_buildings set building_type = 'Fire Station'  WHERE amenity ILIKE '%fire%' ;
update osm_buildings set building_type = 'Police Station' WHERE amenity ILIKE '%police%' ;
update osm_buildings set building_type = 'Public Building' WHERE amenity ILIKE '%public building%' ;
update osm_buildings set building_type = 'Place of Worship -Islam' WHERE amenity ILIKE '%worship%'
                                                        and (religion ILIKE '%islam' or religion ILIKE '%muslim%');
update osm_buildings set building_type = 'Residential'  WHERE amenity = 'yes' ;
update osm_buildings set building_type = 'Place of Worship -Buddhist' WHERE amenity ILIKE '%worship%' and religion ILIKE '%budd%';
update osm_buildings set building_type = 'Place of Worship -Unitarian'  WHERE amenity ILIKE '%worship%' and religion ILIKE '%unitarian%' ;
update osm_buildings set building_type = 'Supermarket'  WHERE amenity ILIKE '%mall%' OR amenity ILIKE '%market%' ;
update osm_buildings set building_type = 'Residential'  WHERE landuse ILIKE '%residential%' OR use = 'residential';
update osm_buildings set building_type = 'Sports Facility' WHERE landuse ILIKE '%recreation_ground%'
                                                              OR (leisure IS NOT NULL AND leisure != '') ;
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



-- reclassify road type for osm_roads to match OSM reporter

update osm_roads set road_type = 'Motorway or highway' WHERE  type ILIKE 'motorway' OR
                                                             type ILIKE 'highway' or type ILIKE 'trunk' ;
update osm_roads set road_type = 'Motorway link' WHERE  type ILIKE 'motorway_link' ;
update osm_roads set road_type = 'Primary road' WHERE  type ILIKE 'primary';
update osm_roads set road_type = 'Primary link' WHERE  type ILIKE 'primary_link' ;
update osm_roads set road_type = 'Tertiary' WHERE  type ILIKE 'tertiary';
update osm_roads set road_type = 'Tertiary link' WHERE  type ILIKE 'tertiary_link';
update osm_roads set road_type = 'Secondary' WHERE  type ILIKE 'secondary';
update osm_roads set road_type = 'Secondary link' WHERE  type ILIKE 'secondary_link';
update osm_roads set road_type = 'Road, residential, living street, etc.' WHERE  type ILIKE 'living_street' OR type
ILIKE 'residential' OR type ILIKE 'yes' OR type ILIKE 'road' OR type ILIKE 'unclassified' OR type ILIKE 'service'
           OR type ILIKE '' OR type IS NULL;

update osm_roads set road_type = "type" = 'Track' WHERE  type ILIKE 'track';
update osm_roads set road_type =  "type" = 'Cycleway, footpath, etc.' WHERE  type ILIKE 'cycleway' OR
            type ILIKE 'footpath' OR type ILIKE 'pedestrian' OR type ILIKE 'footway' OR type ILIKE 'path';



-- update  building_type to match Vulnerability indicators.

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

-- Calculate area of OSM buildings to use later when recoding

update osm_buildings set building_area  = ST_Area(geometry::GEOGRAPHY) ;

-- Recode buildings based on calculated area to match vulnerability indicators in FBF.

update osm_buildings set building_area_score  = 1   WHERE building_area <= 10;
update osm_buildings set building_area_score  = 0.7 WHERE building_area > 10 and building_area <= 30;
update osm_buildings set building_area_score  = 0.5 WHERE building_area > 30 and building_area <= 100;
update osm_buildings set building_area_score  = 0.3 WHERE building_area > 100;


-- Reclassify building material to create building_material score to map vulnerability indicators

update osm_buildings set building_material_score = 0.5 WHERE "building:material" ILIKE 'brick%';
update osm_buildings set building_material_score = 0.1 WHERE "building:material" = 'concrete';
update osm_buildings set building_material_score = 0.3 WHERE building_material_score is null;

-- Update to calculate the road density

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

-- Recode building road density to create a score for FBF vulnerability

update osm_buildings set building_road_density_score  = 1   WHERE building_road_density <= 5;
update osm_buildings set building_road_density_score  = 0.8 WHERE building_road_density > 5 and building_road_density <= 15;
update osm_buildings set building_road_density_score  = 0.5 WHERE building_road_density > 15 and building_road_density <= 50;
update osm_buildings set building_road_density_score  = 0.3 WHERE building_road_density > 50 and building_road_density <= 200;
update osm_buildings set building_road_density_score  = 0.1 WHERE building_road_density > 200;


--- Create lookup tables for each distinct type we use for classification in front end
CREATE TABLE building_type_class (id serial, building_class character varying (100));
CREATE TABLE road_type_class (id serial, road_class character varying (100));
CREATE TABLE waterway_type_class (id serial, waterway_class character varying (100));

INSERT INTO building_type_class (building_class) select distinct(building_type) FROM osm_buildings;
INSERT INTO road_type_class (road_class) select distinct(road_type) FROM osm_roads;
INSERT INTO waterway_type_class (waterway_class) select distinct(waterway) FROM osm_waterways;

-- Update roads, waterways to include id columns


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


 update osm_buildings set building_id = foo.id from (
 	SELECT a.osm_id, b.id
   FROM osm_buildings a,
    building_type_class b
  WHERE a.building_type::text = b.building_class::text
 	) foo where foo.osm_id = osm_buildings.osm_id;


-- Functions to use to update new records with the same mappings as above



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


-- Create tables for FBF based on schema diagram in repo.

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


CREATE table flood_map (
    id serial primary key ,
    place_name character varying (255),
    notes character varying (255),
    return_period timestamp,
    measuring_station_id integer
);

create table trigger_status (
    id serial primary key ,
    name character varying  (255) unique
);

create table progress_status (
    id serial primary key ,
    status character varying (50) unique
);

create table flood_event (
  id serial primary key ,
  flood_map_id integer references flood_map(id),
  acquisition_date timestamp not null default now(),
  forecast_date timestamp ,
  source character varying (255),
  notes character varying (255),
  link text,
  trigger_status character varying  (255) references trigger_status(name),
  spreadsheet BYTEA,
  progress character varying (50) references progress_status(status)
);


create table flood_event_buildings (
    id serial primary key ,
    flood_event_id integer  references flood_event(id),
    building_id integer references  osm_buildings(osm_id),
    depth_class_id integer references  depth_class(id)
);


create table flood_event_village_summary (
    id serial primary key ,
    village_id double precision references village (village_code),
    flood_event_id integer  references flood_event(id),
    vulnerability_total_score double precision,
    building_count integer,
    flooded_building_count integer,
    residential_building_count integer,
    residential_flooded_building_count integer,
    clinic_dr_building_count integer,
    clinic_dr_flooded_building_count integer,
    fire_station_building_count integer,
    fire_station_flooded_building_count integer,
    school_building_count integer,
    school_flooded_building_count integer,
    university_building_count integer,
    university_flooded_building_count integer,
    government_building_count integer,
    government_flooded_building_count integer,
    hospital_building_count integer,
    hospital_flooded_building_count integer,
    buddist_building_count integer,
    buddist_flooded_building_count integer,
    islam_building_count integer,
    islam_flooded_building_count integer,
    police_station_building_count integer,
    police_flooded_building_count integer,
    trigger_status character varying(255) references trigger_status(name)
);


create table flood_event_sub_district_summary (
    id serial primary key ,
    sub_district_id numeric references sub_district (sub_dc_code),
    flood_event_id integer  references flood_event(id),
    vulnerability_total_score double precision,
    building_count integer,
    flooded_building_count integer,
    residential_building_count integer,
    residential_flooded_building_count integer,
    clinic_dr_building_count integer,
    clinic_dr_flooded_building_count integer,
    fire_station_building_count integer,
    fire_station_flooded_building_count integer,
    school_building_count integer,
    school_flooded_building_count integer,
    university_building_count integer,
    university_flooded_building_count integer,
    government_building_count integer,
    government_flooded_building_count integer,
    hospital_building_count integer,
    hospital_flooded_building_count integer,
    buddist_building_count integer,
    buddist_flooded_building_count integer,
    islam_building_count integer,
    islam_flooded_building_count integer,
    police_station_building_count integer,
    police_flooded_building_count integer,
    trigger_status character varying(255) references trigger_status(name)
);



create table flood_event_district_summary (
    id serial primary key ,
    district_id double precision references district(dc_code),
    flood_event_id integer  references flood_event(id),
    vulnerability_total_score double precision,
    building_count integer,
    flooded_building_count integer,
    residential_building_count integer,
    residential_flooded_building_count integer,
    clinic_dr_building_count integer,
    clinic_dr_flooded_building_count integer,
    fire_station_building_count integer,
    fire_station_flooded_building_count integer,
    school_building_count integer,
    school_flooded_building_count integer,
    university_building_count integer,
    university_flooded_building_count integer,
    government_building_count integer,
    government_flooded_building_count integer,
    hospital_building_count integer,
    hospital_flooded_building_count integer,
    buddist_building_count integer,
    buddist_flooded_building_count integer,
    islam_building_count integer,
    islam_flooded_building_count integer,
    police_station_building_count integer,
    police_flooded_building_count integer,
    trigger_status character varying(255) references trigger_status(name)
);

INSERT INTO public.flood_event_village_summary(
    village_id,
    flood_event_id,
    vulnerability_total_score,
    building_count,
    flooded_building_count,
    residential_building_count,
    residential_flooded_building_count,
    clinic_dr_building_count,
    clinic_dr_flooded_building_count,
    fire_station_building_count,
    fire_station_flooded_building_count,
    school_building_count,
    school_flooded_building_count,
    university_building_count,
    university_flooded_building_count,
    government_building_count,
    government_flooded_building_count,
    hospital_building_count,
    hospital_flooded_building_count,
    buddist_building_count,
    buddist_flooded_building_count,
    islam_building_count,
    islam_flooded_building_count,
    police_station_building_count,
    police_flooded_building_count)

select
    a.village_code,
    b.flood_event_id,
    c.total_vulnerability,
    d.building_count,
    e.flooded_building_count,
    f.residential_building_count,
    g.residential_flooded_building_count,
    h.clinic_dr_building_count,
    i.clinic_dr_flooded_building_count,
    j.fire_station_building_count,
    k.fire_station_flooded_building_count,
    l.school_building_count,
    m.school_flooded_building_count,
    n.university_building_count,
    o.university_flooded_building_count,
    p.government_building_count,
    q.government_flooded_building_count,
    r.hospital_building_count,
    s.hospital_flooded_building_count,
    t.buddist_building_count,
    u.buddist_flooded_building_count,
    v.islam_building_count,
    w.islam_flooded_building_count,
    x.police_station_building_count,
    y.police_flooded_building_count
FROM
     ( select b.village_code from flood_event_areas_v a  join village b on st_intersects(a.geometry, b .geom) where a.flood_event_id = 15 ) a,
    ( select a.flood_event_id from flood_event_areas_v a  join village b on st_intersects(a.geometry, b .geom) where a.flood_event_id = 15 ) b,
    ( with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select sum(b.total_vulnerability) as total_vulnerability  from osm_buildings as b join agg
 as c on st_intersects(b.geometry,c.geom) group by c.geom) c,
    ( with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry) group by c.geom) d,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) group by d.geom) e,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as residential_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry) where a.building_type = 'Residential' group by c.geom
) f,
    (select count(*) as residential_flooded_building_count from osm_buildings as a join flood_event_areas_v b on st_intersects(a.geometry,b.geometry)
        where b.flood_event_id = 15 and a.building_type = 'Residential') g,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as clinic_dr_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry) where a.building_type = 'Clinic/Doctor' group by c.geom
) h,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as clinic_dr_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'Clinic/Doctor' group by d.geom) i,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as fire_station_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry) where a.building_type = 'Fire Station' group by c.geom
) j,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as fire_station_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'Fire Station' group by d.geom) k,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as school_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry) where a.building_type = 'School' group by c.geom) l,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as school_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'School' group by d.geom) m,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as university_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry) where a.building_type = 'University/College' group by c.geom) n,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as university_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'University/College' group by d.geom) o,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as government_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry) where a.building_type = 'Government' group by c.geom) p,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as government_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'Government' group by d.geom) q,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as hospital_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry)
        where a.building_type = 'Hospital' group by c.geom) r,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as hospital_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'Hospital' group by d.geom) s,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as buddist_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry)
        where a.building_type = 'Place of Worship - Buddhist' group by c.geom) t,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as buddist_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'Place of Worship - Buddhist' group by d.geom) u,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as islam_building_count from osm_buildings a join agg c on st_intersects ( c.geom,a.geometry)
        where a.building_type = 'Place of Worship - Islam' group by c.geom) v,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as islam_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'Place of Worship - Islam' group by d.geom) w,
    (with agg as ( select a.geom  from village  as a join flood_event_areas_v b on st_intersects(a.geom,b.geometry) where b.flood_event_id = 15)
        select count(a.osm_id) as police_station_building_count from osm_buildings a join agg c
        on st_intersects ( c.geom,a.geometry) where a.building_type = 'Police Station' group by c.geom) x,
    (with agg as (select a.geom  from village  as a join flood_event_areas_v b on st_within(b.geometry,a.geom) where b.flood_event_id = 15)
        select count(a.osm_id) as police_flooded_building_count
        from osm_buildings as a join agg as d on st_intersects(a.geometry,d.geom) where a.building_type = 'Police Station' group by d.geom) y;

-- Activation status function

CREATE FUNCTION activation_status () RETURNS trigger
   LANGUAGE plpgsql AS $$
    BEGIN
        update flood_event_village_summary set
        trigger_status = 'pre-activation'
            where  ((flooded_building_count::decimal/ building_count::decimal) * 100) >= 20;
     RETURN NEW;
    end;
    $$;

-- Trigger to activate the activation_status.
CREATE TRIGGER fd_village_summary_act_status_tg AFTER INSERT OR UPDATE ON flood_event_village_summary FOR EACH ROW EXECUTE PROCEDURE activation_status();


-- Function to calculate activation status based on lead times
CREATE FUNCTION activation_status_lead_times () RETURNS trigger
   LANGUAGE plpgsql AS $$
    BEGIN
    with flood as (
        select b.acquisition_date,a.flood_event_id from flood_event_village_summary as a  join  flood_event b
        on b.id=a.flood_event_id
    ),
    times as (select flood_event_id, (CURRENT_DATE - acquisition_date::DATE) as num_days from flood)
    update flood_event_village_summary a set trigger_status = 'activation' from times b
    where b.num_days <= 3 and  b.flood_event_id = a.flood_event_id;
    RETURN new;
    end ;
    $$;

CREATE TRIGGER fd_village_ld_act_status_tg AFTER INSERT OR UPDATE ON flood_event_village_summary FOR EACH ROW EXECUTE PROCEDURE activation_status_lead_times();

-- Function to calculate the flood forecast date

create OR REPLACE function flood_event_newest_forecast_f(forecast_date_start timestamp without time zone, forecast_date_end timestamp without time zone) returns TABLE(forecast_date_str text, acquisition_date_str text, trigger_status_id int)
  language plpgsql
as
$$
begin return query
        select distinct on (forecast_date_str) a.forecast_date_str, a.acquisition_date_str, a.trigger_status
        from (
            select id, to_char(forecast_date, 'YYYY-MM-DD') as forecast_date_str, to_char(acquisition_date, 'YYYY-MM-DD') as acquisition_date_str, trigger_status from flood_event
            where forecast_date >= forecast_date_start and forecast_date < forecast_date_end AND forecast_date IS NOT NULL
	) as a ORDER BY a.forecast_date_str DESC, a.acquisition_date_str DESC;
    end;
$$;

-- function for creating a spreadsheet using plython3u
create OR REPLACE function flood_event_spreadsheet(flood_event_id integer) returns TABLE(spreadsheet_content text)
  language plpgsql
as
$$
begin return query
        select encode(spreadsheet, 'base64') as spreadsheet_content from flood_event where id=flood_event_id;
    end;
$$;

-- Flooded event buildings map view. Added by Tim to show when we select a flood.
create or replace view vw_flood_event_buildings_map as
select b.geometry, b.building_type, b.district_id, b.sub_district_id, b.village_id, feb.depth_class_id, feb.flood_event_id
	from osm_buildings as b, flood_event_buildings as feb;
comment on view vw_flood_event_buildings_map is 'Flooded event buildings map view. Added by Tim to show when we select a flood.';


-- Reporting for vulnerability indicators

CREATE MATERIALIZED VIEW public.flood_event_village_summary_mv
TABLESPACE pg_default
AS
 SELECT a.id,
    a.flood_event_id,
    a.vulnerability_total_score,
    a.building_count,
    a.flooded_building_count,
    a.residential_building_count,
    a.residential_flooded_building_count,
    a.clinic_dr_building_count,
    a.clinic_dr_flooded_building_count,
    a.fire_station_building_count,
    a.fire_station_flooded_building_count,
    a.school_building_count,
    a.school_flooded_building_count,
    a.university_building_count,
    a.university_flooded_building_count,
    a.government_building_count,
    a.government_flooded_building_count,
    a.hospital_building_count,
    a.hospital_flooded_building_count,
    a.buddist_building_count,
    a.buddist_flooded_building_count,
    a.islam_building_count,
    a.islam_flooded_building_count,
    a.police_station_building_count,
    a.police_flooded_building_count,
    a.village_id,
    b.name,
    b.dc_code,
    b.sub_dc_code
   FROM flood_event_village_summary a,
    village b
  WHERE b.village_code = a.village_id
WITH DATA;

CREATE MATERIALIZED VIEW public.flood_event_sub_district_summary_mv
TABLESPACE pg_default
AS
 SELECT a.id,
    a.flood_event_id,
    a.vulnerability_total_score,
    a.building_count,
    a.flooded_building_count,
    a.residential_building_count,
    a.residential_flooded_building_count,
    a.clinic_dr_building_count,
    a.clinic_dr_flooded_building_count,
    a.fire_station_building_count,
    a.fire_station_flooded_building_count,
    a.school_building_count,
    a.school_flooded_building_count,
    a.university_building_count,
    a.university_flooded_building_count,
    a.government_building_count,
    a.government_flooded_building_count,
    a.hospital_building_count,
    a.hospital_flooded_building_count,
    a.buddist_building_count,
    a.buddist_flooded_building_count,
    a.islam_building_count,
    a.islam_flooded_building_count,
    a.police_station_building_count,
    a.police_flooded_building_count,
    a.sub_district_id,
    b.name,
    b.dc_code
   FROM flood_event_sub_district_summary a,
    sub_district b
  WHERE b.sub_dc_code = a.sub_district_id
WITH DATA;

CREATE MATERIALIZED VIEW public.flood_event_district_summary_mv
TABLESPACE pg_default
AS
 SELECT a.id,
    a.flood_event_id,
    a.vulnerability_total_score,
    a.building_count,
    a.flooded_building_count,
    a.residential_building_count,
    a.residential_flooded_building_count,
    a.clinic_dr_building_count,
    a.clinic_dr_flooded_building_count,
    a.fire_station_building_count,
    a.fire_station_flooded_building_count,
    a.school_building_count,
    a.school_flooded_building_count,
    a.university_building_count,
    a.university_flooded_building_count,
    a.government_building_count,
    a.government_flooded_building_count,
    a.hospital_building_count,
    a.hospital_flooded_building_count,
    a.buddist_building_count,
    a.buddist_flooded_building_count,
    a.islam_building_count,
    a.islam_flooded_building_count,
    a.police_station_building_count,
    a.police_flooded_building_count,
    b.name
   FROM flood_event_district_summary a,
    district b
  WHERE a.district_id = b.dc_code
WITH DATA;

CREATE MATERIALIZED VIEW exposed_buildings_mv as
    with flood_event as (
SELECT
    d.id AS flood_event_id,
    a.depth_class,
	a.geometry
   FROM flooded_area a
     JOIN flooded_areas b ON a.id = b.flooded_area_id
     JOIN flood_map c ON c.id = b.flood_map_id
     JOIN flood_event d ON d.flood_map_id = c.id)
select row_number() OVER () AS id,b.flood_event_id, b.depth_class,c.total_vulnerability from flood_event b join
osm_buildings  c on st_intersects(c.geometry,b.geometry) ;


-- Populate the flood event buildings - need to convert it to function

 create materialized view flood_event_buildings_mv as
with intersections as (SELECT a.geometry,d.id AS flood_event_id, a.depth_class FROM flooded_area a
     JOIN flooded_areas b ON a.id = b.flooded_area_id
     JOIN flood_map c ON c.id = b.flood_map_id
     JOIN flood_event d ON d.flood_map_id = c.id)
select row_number() OVER () AS id,b.osm_id as building_id,a.flood_event_id,a.depth_class,b.district_id,
       b.sub_district_id,b.village_id, b.building_type,b.total_vulnerability,b.geometry from intersections a
join osm_buildings b on st_intersects(a.geometry,b.geometry);

CREATE UNIQUE INDEX id_db_mv
  ON flood_event_buildings_mv (id);
create index building_id_mv   ON flood_event_buildings_mv (building_id);
create index flood_event_id_mv   ON flood_event_buildings_mv (flood_event_id);
create index district_id_mv   ON flood_event_buildings_mv (district_id);
create index sub_district_id_mv   ON flood_event_buildings_mv (sub_district_id);
create index village_id_mv   ON flood_event_buildings_mv (village_id);


CREATE FUNCTION refresh_flood_event_buildings_mv() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY flood_event_buildings_mv WITH DATA ;
    RETURN NULL;
  END
  $$;

CREATE TRIGGER flood_event_buildings_mv_tg AFTER INSERT  ON flood_event
FOR EACH ROW EXECUTE PROCEDURE refresh_flood_event_buildings_mv();


CREATE FUNCTION refresh_exposed_buildings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW exposed_buildings_mv WITH DATA ;
    RETURN NULL;
  END
  $$;

CREATE TRIGGER exposed_buildings_tg AFTER INSERT OR UPDATE ON flood_event
FOR EACH ROW EXECUTE PROCEDURE refresh_exposed_buildings();

CREATE FUNCTION refresh_village_summary() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW flood_event_village_summary_mv WITH DATA ;
    RETURN NULL;
  END
  $$;

CREATE FUNCTION refresh_sub_district_summary() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW flood_event_sub_district_summary_mv WITH DATA ;
    RETURN NULL;
  END
  $$;


CREATE FUNCTION refresh_district_summary() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW flood_event_district_summary_mv WITH DATA ;
    RETURN NULL;
  END
  $$;

CREATE TRIGGER event_village_summary_tg AFTER INSERT OR UPDATE ON flood_event_village_summary
FOR EACH ROW EXECUTE PROCEDURE refresh_village_summary();

CREATE TRIGGER event_sub_district_summary_tg AFTER INSERT OR UPDATE ON flood_event_sub_district_summary
FOR EACH ROW EXECUTE PROCEDURE refresh_sub_district_summary();

CREATE TRIGGER event_district_summary_tg AFTER INSERT OR UPDATE ON flood_event_district_summary
FOR EACH ROW EXECUTE PROCEDURE refresh_district_summary();

CREATE TRIGGER building_type_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_types_mapper ();

CREATE TRIGGER st_building_recoder BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_recode_mapper();

CREATE TRIGGER area_recode_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_area_mapper();

CREATE TRIGGER building_material_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_materials_mapper();

CREATE TRIGGER road_density_calc BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_road_density_mapper () ;


-- Generic SQL
-- Add a trigger function to notify QGIS of DB changes
CREATE FUNCTION public.notify_qgis() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN NOTIFY qgis;
        RETURN NULL;
        END;
    $$;

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




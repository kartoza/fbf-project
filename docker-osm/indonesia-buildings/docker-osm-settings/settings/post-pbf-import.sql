-- Add a trigger function to notify QGIS of DB changes
CREATE FUNCTION public.notify_qgis() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN NOTIFY qgis;
        RETURN NULL;
        END;
    $$;

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

-- Vulnerability reporting and mapping for Buildings

ALTER table osm_buildings add column building_type character varying (100);


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
               THEN 'Place of Worship -Islam'
           WHEN new.amenity ILIKE '%worship%' and religion ILIKE '%budd%' THEN 'Place of Worship -Buddhist'
           WHEN new.amenity ILIKE '%worship%' and religion ILIKE '%unitarian%' THEN 'Place of Worship -Unitarian'
           WHEN new.amenity ILIKE '%mall%' OR new.amenity ILIKE '%market%' THEN 'Supermarket'
           WHEN new.landuse ILIKE '%residential%' OR new.use = 'residential' THEN 'Residential'
           WHEN new.landuse ILIKE '%recreation_ground%' OR (leisure IS NOT NULL AND leisure != '') THEN 'Sports Facility'
           -- run near the end
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

CREATE TRIGGER building_type_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_types_mapper ();



-- Function to recode buildings that have been reclassified above using the function building_types_mapper ()
ALTER table osm_buildings add column building_type_recode numeric;

CREATE OR REPLACE FUNCTION building_recode_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
     SELECT

        CASE
            WHEN new.building_type = 'accomodation' THEN 0.5
            WHEN new.building_type = 'Commercial' THEN 0.5
            WHEN new.building_type = 'School' THEN 1
            WHEN new.building_type = 'Government' THEN 0.5
            WHEN new.building_type = 'multipurpose' THEN 0.3
            WHEN new.building_type = 'Place of Worship' THEN 0.5
            WHEN new.building_type = 'Residential' THEN 1
            WHEN new.building_type = 'ruko' THEN 1
            WHEN new.building_type = 'shop' THEN 0.5
            WHEN new.building_type = 'storage' THEN 0.5
            ELSE 0.3
        END
     INTO new.building_type_recode
     FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER st_building_recoder BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_recode_mapper();

-- Create a column to hold the recoded calculated area in the table
ALTER table osm_buildings add column area_recode numeric;

CREATE OR REPLACE FUNCTION building_area_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
	SELECT
        CASE
            WHEN ST_Area(new.geometry::GEOGRAPHY) <= 100 THEN 1
            WHEN ST_Area(new.geometry::GEOGRAPHY) > 100 and ST_Area(new.geometry::GEOGRAPHY) <= 300 THEN 0.7
            WHEN ST_Area(new.geometry::GEOGRAPHY) > 300 and ST_Area(new.geometry::GEOGRAPHY) <= 500 THEN 0.5
            WHEN ST_Area(new.geometry::GEOGRAPHY) > 500 THEN 0.3
            ELSE 0.3
        END
	INTO new.area_recode
	FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER area_recode_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_area_mapper();

-- Create a column to hold the building materials class in the table
ALTER table osm_buildings add column building_material_recode numeric;

CREATE OR REPLACE FUNCTION building_materials_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT

    CASE
        WHEN new."building:material" = 'brick' THEN 0.5
        WHEN new."building:material" = 'glass' THEN 0.3
        ELSE 0.3
        END
    INTO new.building_material_recode
    FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER building_material_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_materials_mapper();

-- Function to calculate the distance from a river to the centroid of the building
ALTER table osm_buildings add column river_distance numeric;

CREATE OR REPLACE FUNCTION river_distance_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
     SELECT ST_Distance(ST_Centroid(NEW.geometry)::GEOGRAPHY, rt.geometry::GEOGRAPHY)
         INTO   NEW.river_distance
         FROM   osm_waterways AS rt
         ORDER BY
                NEW.geometry <-> rt.geometry
         LIMIT  1;

     RETURN NEW;
   END
  $$;

CREATE TRIGGER river_distance_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    river_distance_mapper ();

--- Add a new column for river_distance record
ALTER table osm_buildings add column river_distance_recode numeric;

CREATE OR REPLACE FUNCTION river_distance_recode_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        CASE
            WHEN new.river_distance > 0 and new.river_distance <= 100 THEN 1.0
            WHEN new.river_distance > 100 and new.river_distance <= 300  THEN 0.7
            WHEN new.river_distance > 300 and new.river_distance <= 500  THEN 0.5
            WHEN new.river_distance > 500 THEN 0.3
            ELSE 0.3
        END
    INTO new.river_distance_recode
    FROM osm_buildings
    ;
  RETURN NEW;

  END
  $$;

CREATE TRIGGER st_river_recode BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    river_distance_recode_mapper ();


-- count number or roads intersecting Surabaya
CREATE VIEW osm_roads_surabaya_stats as
SELECT type, COUNT(osm_id) FROM (
    SELECT DISTINCT ON (a.osm_id) a.osm_id, a.type
    FROM osm_roads as a
    INNER JOIN osm_admin as b ON ST_Intersects(a.geometry, b.geometry) where b.name = 'Surabaya'
) subquery
GROUP BY type order by count;


-- count number of rivers intersecting surabaya
CREATE OR REPLACE VIEW osm_rivers_surabaya_stats as
SELECT waterway, COUNT(osm_id) FROM (
    SELECT DISTINCT ON (a.osm_id) a.osm_id, a.waterway
    FROM osm_waterways as a
    INNER JOIN osm_admin as b ON ST_Intersects(a.geometry, b.geometry) where b.name = 'Surabaya'
) subquery
GROUP BY waterway order by count;

-- count number of buildings intersecting surabaya
CREATE OR REPLACE VIEW osm_buildings_surabaya_stats as
SELECT building_type, COUNT(osm_id) FROM (
    SELECT DISTINCT ON (a.osm_id) a.osm_id, a.building_type
    FROM osm_buildings as a
    INNER JOIN osm_admin as b ON ST_Intersects(a.geometry, b.geometry) where b.name = 'Surabaya'
) subquery
GROUP BY building_type order by count;

-- Create function to calculate the elevation of the nearest river in relation to  building centroid
ALTER table osm_buildings add column river_elevation numeric;

CREATE OR REPLACE FUNCTION river_elevation_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
            ST_VALUE(rast, geom)
    INTO new.river_elevation
    FROM (WITH location as (
        SELECT ST_X(st_centroid(new.geometry)) as latitude,ST_Y(st_centroid(new.geometry)) as longitude,
        ST_SetSRID(St_MakePoint(ST_X(st_centroid(new.geometry)),ST_Y(st_centroid(new.geometry))),4326) as geom
         FROM osm_buildings )
        SELECT st_line_interpolate_point(b.geometry, 0.5) as geom, e.rast from location as a , osm_waterways as b, dem as e
        WHERE ST_Intersects(e.rast, a.geom)
        ORDER BY a.geom <-> b.geometry
        LIMIT  1) foo;
  RETURN NEW;

  END
  $$;

CREATE TRIGGER river_elevation_calc BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    river_elevation_mapper () ;

-- create a function to calculate the elevation of a building's centroid
ALTER table osm_buildings add column building_elevation numeric;

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

-- create a function that recodes the values of the building elevation against the river elevation
ALTER table osm_buildings add column low_lying_area_score numeric;


CREATE OR REPLACE FUNCTION elevation_recode_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        CASE
            WHEN (new.building_elevation - new.river_elevation) <= 0  THEN 1.0
            WHEN (new.building_elevation - new.river_elevation) > 0 and (new.building_elevation - new.river_elevation) <= 1   THEN 0.8
            WHEN (new.building_elevation - new.river_elevation) > 1 and (new.building_elevation - new.river_elevation) <= 2  THEN 0.5
            WHEN (new.building_elevation - new.river_elevation) > 2 THEN 0.1
            ELSE 0.3
        END
    INTO new.low_lying_area_score
    FROM osm_buildings
    ;
  RETURN NEW;

  END
  $$;

CREATE TRIGGER st_elevation_recoder BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    elevation_recode_mapper () ;

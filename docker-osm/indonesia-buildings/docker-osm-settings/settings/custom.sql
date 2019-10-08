ALTER table osm_buildings add column building_type character varying (100);


CREATE OR REPLACE FUNCTION building_types_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    new.building_type :=
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
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER types_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_types_mapper ();

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

-- Create columns to use to keep recoded values
ALTER table osm_buildings add column building_type_recode numeric;

CREATE OR REPLACE FUNCTION building_recode_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    new.building_type_recode =

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
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER type_recode BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_recode_mapper();

-- Create a column to hold the calculated area in the table
ALTER table osm_buildings add column area_recode numeric;

CREATE OR REPLACE FUNCTION building_area_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    new.area_recode :=

    CASE
        WHEN ST_Area(st_transform(new.geometry,3857)) <= 100 THEN 1
        WHEN ST_Area(st_transform(new.geometry,3857)) > 100 and ST_Area(st_transform(new.geometry,3857)) <= 300 THEN 0.7
        WHEN ST_Area(st_transform(new.geometry,3857)) > 300 and ST_Area(st_transform(new.geometry,3857)) <= 500 THEN 0.5
        WHEN ST_Area(st_transform(new.geometry,3857)) > 500 THEN 0.3
        ELSE 0.3
        END
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER area_recode_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_area_mapper();

-- Create a column to hold the building materials class in the table
ALTER table osm_buildings add column walls_recode numeric;

CREATE OR REPLACE FUNCTION building_walls_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    new.walls_recode =

    CASE
        WHEN new."building:material" = 'brick' THEN 0.5
        WHEN new."building:material" = 'glass' THEN 0.3
        ELSE 0.3
        END
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER walls_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_walls_mapper();

-- Create a column to hold the centroid distance to the nearest river
ALTER table osm_buildings add column river_distance numeric;

CREATE OR REPLACE FUNCTION river_distance_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    new.river_distance := subquery.distance

                        FROM (with center as (
                            select st_transform(st_centroid(geometry),3857) as geom, osm_id from
                            osm_buildings )
                            select st_distance(a.geom,st_transform(b.geometry,3857)) as distance
                            from center as a, osm_waterways as b
                                order by st_transform(b.geometry,3857) <-> a.geom
                                limit 1) AS subquery ;
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
    new.river_distance_recode :=
        CASE
        WHEN new.river_distance > 0 and <= 100 THEN 1.0
        WHEN new.river_distance > 100 and <= 300  THEN 0.7
        WHEN new.river_distance > 300 and <= 500  THEN 0.5
        WHEN new.river_distance > 500 THEN 0.3
        ELSE 0.3
        END
    ;
  RETURN NEW;

  END
  $$;

CREATE TRIGGER river_recode_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    river_distance_recode_mapper ();



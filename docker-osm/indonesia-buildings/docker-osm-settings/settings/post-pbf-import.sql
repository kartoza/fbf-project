-- Add a trigger function to notify QGIS of DB changes
CREATE OR REPLACE FUNCTION public.notify_qgis() RETURNS trigger
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

-- Initial Update
update osm_buildings set building_type =
  CASE
           WHEN amenity ILIKE '%school%' OR amenity ILIKE '%kindergarten%' THEN 'School'
           WHEN amenity ILIKE '%university%' OR amenity ILIKE '%college%' THEN 'University/College'
           WHEN amenity ILIKE '%government%' THEN 'Government'
           WHEN amenity ILIKE '%clinic%' OR amenity ILIKE '%doctor%' THEN 'Clinic/Doctor'
           WHEN amenity ILIKE '%hospital%' THEN 'Hospital'
           WHEN amenity ILIKE '%fire%' THEN 'Fire Station'
           WHEN amenity ILIKE '%police%' THEN 'Police Station'
           WHEN amenity ILIKE '%public building%' THEN 'Public Building'
           WHEN amenity ILIKE '%worship%' and (religion ILIKE '%islam' or religion ILIKE '%muslim%')
               THEN 'Place of Worship -Islam'
           WHEN amenity ILIKE '%worship%' and religion ILIKE '%budd%' THEN 'Place of Worship -Buddhist'
           WHEN amenity ILIKE '%worship%' and religion ILIKE '%unitarian%' THEN 'Place of Worship -Unitarian'
           WHEN amenity ILIKE '%mall%' OR amenity ILIKE '%market%' THEN 'Supermarket'
           WHEN landuse ILIKE '%residential%' OR use = 'residential' THEN 'Residential'
           WHEN landuse ILIKE '%recreation_ground%' OR (leisure IS NOT NULL AND leisure != '') THEN 'Sports Facility'
           -- run near the end
           WHEN use = 'government' AND "type" IS NULL THEN 'Government'
           WHEN use = 'residential' AND "type" IS NULL THEN 'Residential'
           WHEN use = 'education' AND "type" IS NULL THEN 'School'
           WHEN use = 'medical' AND "type" IS NULL THEN 'Clinic/Doctor'
           WHEN use = 'place_of_worship' AND "type" IS NULL THEN 'Place of Worship'
           WHEN use = 'school' AND "type" IS NULL THEN 'School'
           WHEN use = 'hospital' AND "type" IS NULL THEN 'Hospital'
           WHEN use = 'commercial' AND "type" IS NULL THEN 'Commercial'
           WHEN use = 'industrial' AND "type" IS NULL THEN 'Industrial'
           WHEN use = 'utility' AND "type" IS NULL THEN 'Utility'
           -- Add default type
           WHEN "type" IS NULL THEN 'Residential'
        END;


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
ALTER table osm_buildings add column building_type_score numeric;

update osm_buildings set building_type_score =
  CASE
            WHEN building_type = 'accomodation' THEN 0.5
            WHEN building_type = 'Commercial' THEN 0.5
            WHEN building_type = 'School' THEN 1
            WHEN building_type = 'Government' THEN 0.5
            WHEN building_type = 'multipurpose' THEN 0.3
            WHEN building_type = 'Place of Worship' THEN 0.5
            WHEN building_type = 'Residential' THEN 1
            WHEN building_type = 'ruko' THEN 1
            WHEN building_type = 'shop' THEN 0.5
            WHEN building_type = 'storage' THEN 0.5
            ELSE 0.3
        END;

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
     INTO new.building_type_score
     FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER st_building_recoder BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_recode_mapper();

-- Create a column to hold the recoded calculated area in the table
ALTER table osm_buildings add column low_lying_area_score  numeric;

update osm_buildings set low_lying_area_score  =
        CASE
            WHEN ST_Area(geometry::GEOGRAPHY) <= 100 THEN 1
            WHEN ST_Area(geometry::GEOGRAPHY) > 100 and ST_Area(geometry::GEOGRAPHY) <= 300 THEN 0.7
            WHEN ST_Area(geometry::GEOGRAPHY) > 300 and ST_Area(geometry::GEOGRAPHY) <= 500 THEN 0.5
            WHEN ST_Area(geometry::GEOGRAPHY) > 500 THEN 0.3
            ELSE 0.3
        END;

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
  INTO new.low_lying_area_score
  FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER area_recode_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_area_mapper();

-- Create a column to hold the building materials class in the table
ALTER table osm_buildings add column building_material_score numeric;

update osm_buildings set building_material_score =
  CASE
        WHEN "building:material" = 'brick' THEN 0.5
        WHEN "building:material" = 'glass' THEN 0.3
        ELSE 0.3
    END;

CREATE OR REPLACE FUNCTION building_materials_mapper () RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
    SELECT

    CASE
        WHEN new."building:material" = 'brick' THEN 0.5
        WHEN new."building:material" = 'glass' THEN 0.3
        ELSE 0.3
    END
    INTO new.building_material_score
    FROM osm_buildings
    ;
  RETURN NEW;
  END
  $$;

CREATE TRIGGER building_material_mapper BEFORE INSERT OR UPDATE ON osm_buildings FOR EACH ROW EXECUTE PROCEDURE
    building_materials_mapper();


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


-- direct aggregate to avoid building double count
with non_flooded_count_selection as (
--   Make a table that aggregates sub district building counts
    select b.district_id,
           b.sub_district_id,
           sum(b.building_type_count)           as building_count,
           sum(b.residential_building_count)    as residential_building_count,
           sum(b.clinic_dr_building_count)      as clinic_dr_building_count,
           sum(b.fire_station_building_count)   as fire_station_building_count,
           sum(b.school_building_count)         as school_building_count,
           sum(b.university_building_count)     as university_building_count,
           sum(b.government_building_count)     as government_building_count,
           sum(b.hospital_building_count)       as hospital_building_count,
           sum(b.police_station_building_count) as police_station_building_count
    from (

--      get distinct combination of district_id, sub_district_id, village_id
--      this will be used to aggregate up to sub_district_id
        select distinct district_id,
                          sub_district_id,
                          village_id,
                          building_type_count,

                          case
                              when building_type = 'Residential'
                                  then building_type_count
                              else 0 end as residential_building_count,
                          case
                              when building_type = 'Clinic'
                                  then building_type_count
                              else 0 end as clinic_dr_building_count,
                          case
                              when building_type = 'Fire Station'
                                  then building_type_count
                              else 0 end as fire_station_building_count,
                          case
                              when building_type = 'School'
                                  then building_type_count
                              else 0 end as school_building_count,
                          case
                              when building_type = 'University'
                                  then building_type_count
                              else 0 end as university_building_count,
                          case
                              when building_type = 'Government'
                                  then building_type_count
                              else 0 end as government_building_count,
                          case
                              when building_type = 'Hospital'
                                  then building_type_count
                              else 0 end as hospital_building_count,
                          case
                              when building_type = 'Police Station'
                                  then building_type_count
                              else 0 end as police_station_building_count

          from mv_non_flooded_flood_summary
--        avoid faulty rows (where the id's are null)
          where district_id is not null
            and sub_district_id is not null
            and village_id is not null) as b
--  aggregate by sub district
    group by district_id, sub_district_id
),
--   Make a table that aggregates sub district flooded building counts
     flooded_count_selection as (
         select flood_event_id,
                district_id,
                sub_district_id,
                sum(a.building_type_count)           as flooded_building_count,
                sum(a.residential_building_count)    as residential_flooded_building_count,
                sum(a.clinic_dr_building_count)      as clinic_dr_flooded_building_count,
                sum(a.fire_station_building_count)   as fire_station_flooded_building_count,
                sum(a.school_building_count)         as school_flooded_building_count,
                sum(a.university_building_count)     as university_flooded_building_count,
                sum(a.government_building_count)     as government_flooded_building_count,
                sum(a.hospital_building_count)       as hospital_flooded_building_count,
                sum(a.police_station_building_count) as police_station_flooded_building_count,
                sum(total_vulnerability_score)       as total_vulnerability_score
         from (
--      get distinct combination of district_id, sub_district_id, village_id
--      this will be used to aggregate up to sub_district_id
             select distinct flood_event_id,
                               district_id,
                               sub_district_id,
                               village_id,
                               building_type_count,

                               case
                                   when building_type = 'Residential'
                                       then building_type_count
                                   else 0 end as residential_building_count,
                               case
                                   when building_type = 'Clinic'
                                       then building_type_count
                                   else 0 end as clinic_dr_building_count,
                               case
                                   when building_type = 'Fire Station'
                                       then building_type_count
                                   else 0 end as fire_station_building_count,
                               case
                                   when building_type = 'School'
                                       then building_type_count
                                   else 0 end as school_building_count,
                               case
                                   when building_type = 'University'
                                       then building_type_count
                                   else 0 end as university_building_count,
                               case
                                   when building_type = 'Government'
                                       then building_type_count
                                   else 0 end as government_building_count,
                               case
                                   when building_type = 'Hospital'
                                       then building_type_count
                                   else 0 end as hospital_building_count,
                               case
                                   when building_type = 'Police Station'
                                       then building_type_count
                                   else 0 end as police_station_building_count,

                               total_vulnerability_score
               from mv_flooded_flood_summary
--        avoid faulty rows (where the id's are null)
               where district_id is not null
                 and sub_district_id is not null
                 and village_id is not null) as a
--  aggregate by sub district and flood_event_id
         group by district_id, sub_district_id, flood_event_id
     ),
     flooded_aggregate_count as (
-- combines flooded count information and total building information
         select a.flood_event_id,
                a.district_id,
                a.sub_district_id,
                a.flooded_building_count,
                b.building_count,
                b.residential_building_count,
                b.clinic_dr_building_count,
                b.fire_station_building_count,
                b.school_building_count,
                b.university_building_count,
                b.government_building_count,
                b.hospital_building_count,
                b.police_station_building_count,

                a.residential_flooded_building_count,
                a.clinic_dr_flooded_building_count,
                a.fire_station_flooded_building_count,
                a.school_flooded_building_count,
                a.university_flooded_building_count,
                a.government_flooded_building_count,
                a.hospital_flooded_building_count,
                a.police_station_flooded_building_count,
                a.total_vulnerability_score
         from flooded_count_selection as a
                  join non_flooded_count_selection b
                       on a.district_id = b.district_id and a.sub_district_id = b.sub_district_id
     )

select flooded_aggregate_count.flood_event_id,
       flooded_aggregate_count.district_id,
       flooded_aggregate_count.sub_district_id,
       flooded_aggregate_count.building_count,
       flooded_aggregate_count.flooded_building_count,
       flooded_aggregate_count.total_vulnerability_score,
       flooded_aggregate_count.residential_flooded_building_count,
       flooded_aggregate_count.clinic_dr_flooded_building_count,
       flooded_aggregate_count.fire_station_flooded_building_count,
       flooded_aggregate_count.school_flooded_building_count,
       flooded_aggregate_count.university_flooded_building_count,
       flooded_aggregate_count.government_flooded_building_count,
       flooded_aggregate_count.hospital_flooded_building_count,
       flooded_aggregate_count.police_station_flooded_building_count,

       flooded_aggregate_count.residential_building_count,
       flooded_aggregate_count.clinic_dr_building_count,
       flooded_aggregate_count.fire_station_building_count,
       flooded_aggregate_count.school_building_count,
       flooded_aggregate_count.university_building_count,
       flooded_aggregate_count.government_building_count,
       flooded_aggregate_count.hospital_building_count,
       flooded_aggregate_count.police_station_building_count
from flooded_aggregate_count

# Running PostImport Script

The SQL scripts references admin areas for a country based on OSM
categories. Currently we load the following data set 

* Village
* district
* sub-district

All sourced from https://data.humdata.org/dataset

The following list depicts the unique identifiers for each layer

* village - village_code
* district - dc-code
* sub-district - sub_dc_code

If you intent to scale this to other countries ensure that the 
column names are consistent with the above otherwise you would 
have to refactor some of the SQL commands.

## Pre Loading

Before running this script it is assumed that the admin boundaries
have already been loaded into the database. There are various ways
of loading the data into the database. 

* Either load them into a local DB and dump them as SQL and run
the SQL script on DB startup as depicted https://github.com/kartoza/docker-postgis/tree/develop#running-sql-scripts-on-container-startup




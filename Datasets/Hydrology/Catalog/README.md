# Hydrology Data Catalog

At the moment we only requested station names list for area near Karawang - Bekasi.
That means, we requested all station names list in DKI Jakarta province, and West Java (Jawa Barat) Province.

- DKI Jakarta.xlsx: Hydrology catalog of DKI Jakarta
- Debit Jawa Barat.xlsx: Hydrology catalog of West Java
- Curah hujan_DKI Jakarta.xls: rainfall catalog of DKI Jakarta
- Curah hujan_Jawa Barat.xls: rainfall catalog of West Java
- Klimatologi_Wilayah Tengah.xls: climate station list in Central portion of Indonesia


# Helper script

In addition to dataset, we provided a python helper script `lat_lon_epsg_converter.py` which runs using Python 3.
This script is used to convert station point location in above catalog, which is in the format of sexagecimal degree:

```
{lat_degree} {lat_minute} {lat_second} {lat_bearing} {lon_degree} {lon_minute} {lon_second} {lon_bearing}
example:
06 12 42 LS  106 45 18 BT
```

Into a standard lat lon degrees to be used in CSV column, so it can be consumed by QGIS as coordinate.

To use the the script, run with the following parameter

```
python3 lat_lon_epsg_converter.py <input_file> <output_x_file> <output_y_file>
```

Where:

`input_file`: is a file with lists of coordinates in sexagecimal. Each coordinate is separated with newline. So each line is a coordinate. You can easily copy coordinates column from the catalog data and paste it in a new file to make a list of coordinates.
`output_x_file`: is the output of the script. It contains the X coordinate, which is the longitude. Each X coordinate is separated by newline. You can copy the content of this file and pasted it in a longitude column in your target CSV file.
`output_y_file`: same format with `output_x_file`, but this one is for the corresponding y coordinate, which is the latitude.

 

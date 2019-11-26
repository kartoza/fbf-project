# Districts Candidates

This dataset is the result of GIS processing from various dataset, which is 
mainly from InaRISK. 

Summary of methodology:

1. Collect Flood Risk map from InaRISK (Raster map, indicator from 0 to 1)
2. Reclassify for only values 0.6 above that we are interested in
3. Perform zonal histogram for each class above 0.6 with 0.1 increment, reclassify the value as integer percentage, e.g, 0.6 becomes 60
4. Do weighted scoring for total pixel times the pixel reclassified value, e.g. score = histo_NODATA * 0 + histo_70 * 0.7 + histo_80 * 0.8 + histo_90 * 0.9
5. Sort and aggregate with districts boundaries, priority by highest scores
6. Compare and select based on RBI (Risk report) from 2013 and 2016, to select only District with high risk and highest population risked.

Result is 31 primary District and 13 secondary districts.

This districts were used as a base to validate the methodology and are expected to be the districts where data is most available.

GIS operation were done automated using QGIS Processing to be replicated easily when the data changes.

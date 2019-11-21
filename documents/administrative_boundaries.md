# Administrative boundaries

InaRISK provide ArcGIS REST Services for Indonesian boundaries:

The service endpoints:

http://service1.inarisk.bnpb.go.id:6080/arcgis/rest/services/basemap/batas_administrasi/MapServer

WFS endpoints:
http://service1.inarisk.bnpb.go.id:6080/arcgis/services/basemap/batas_administrasi/MapServer/WFSServer?request=GetCapabilities&service=WFS


It will contain 4 layers of different administrative levels:

- Batas Provinsi: Province level
- Batas Kabupaten: District level
- Batas Kecamatan: Subdistrict level
- Batas Desa: Village level


When doing local analysis, it's best to mirror these layer first to avoid hitting InaRISK database too often.

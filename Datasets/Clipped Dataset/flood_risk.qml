<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="3.9.0-Master" styleCategories="AllStyleCategories" hasScaleBasedVisibilityFlag="0" minScale="1e+08" maxScale="0">
  <flags>
    <Identifiable>1</Identifiable>
    <Removable>1</Removable>
    <Searchable>1</Searchable>
  </flags>
  <customproperties>
    <property key="WMSBackgroundLayer" value="false"/>
    <property key="WMSPublishDataSourceUrl" value="false"/>
    <property key="embeddedWidgets/count" value="0"/>
    <property key="identify/format" value="Value"/>
  </customproperties>
  <pipe>
    <rasterrenderer classificationMin="0.6" type="singlebandpseudocolor" classificationMax="1" opacity="1" alphaBand="-1" band="1">
      <rasterTransparency/>
      <minMaxOrigin>
        <limits>None</limits>
        <extent>WholeRaster</extent>
        <statAccuracy>Estimated</statAccuracy>
        <cumulativeCutLower>0.02</cumulativeCutLower>
        <cumulativeCutUpper>0.98</cumulativeCutUpper>
        <stdDevFactor>2</stdDevFactor>
      </minMaxOrigin>
      <rastershader>
        <colorrampshader colorRampType="INTERPOLATED" classificationMode="1" clip="0">
          <colorramp name="[source]" type="gradient">
            <prop k="color1" v="255,245,240,255"/>
            <prop k="color2" v="103,0,13,255"/>
            <prop k="discrete" v="0"/>
            <prop k="rampType" v="gradient"/>
            <prop k="stops" v="0.13;254,224,210,255:0.26;252,187,161,255:0.39;252,146,114,255:0.52;251,106,74,255:0.65;239,59,44,255:0.78;203,24,29,255:0.9;165,15,21,255"/>
          </colorramp>
          <item alpha="255" color="#fff5f0" label="0.6" value="0.6"/>
          <item alpha="255" color="#fee0d2" label="0.652" value="0.652"/>
          <item alpha="255" color="#fcbba1" label="0.704" value="0.704"/>
          <item alpha="255" color="#fc9272" label="0.756" value="0.756"/>
          <item alpha="255" color="#fb6a4a" label="0.808" value="0.808"/>
          <item alpha="255" color="#ef3b2c" label="0.86" value="0.86"/>
          <item alpha="255" color="#cb181d" label="0.912" value="0.912"/>
          <item alpha="255" color="#a50f15" label="0.96" value="0.96"/>
          <item alpha="255" color="#67000d" label="1" value="1"/>
        </colorrampshader>
      </rastershader>
    </rasterrenderer>
    <brightnesscontrast brightness="0" contrast="0"/>
    <huesaturation saturation="0" colorizeStrength="100" colorizeOn="1" colorizeBlue="0" grayscaleMode="0" colorizeGreen="0" colorizeRed="255"/>
    <rasterresampler maxOversampling="2"/>
  </pipe>
  <blendMode>6</blendMode>
</qgis>

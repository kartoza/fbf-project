<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="3.9.0-Master" hasScaleBasedVisibilityFlag="0" minScale="1e+08" styleCategories="AllStyleCategories" maxScale="0">
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
    <rasterrenderer alphaBand="-1" band="1" type="singlebandpseudocolor" opacity="1" classificationMin="0.6" classificationMax="1">
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
        <colorrampshader clip="0" colorRampType="INTERPOLATED" classificationMode="1">
          <colorramp type="gradient" name="[source]">
            <prop v="255,245,240,255" k="color1"/>
            <prop v="103,0,13,255" k="color2"/>
            <prop v="0" k="discrete"/>
            <prop v="gradient" k="rampType"/>
            <prop v="0.13;254,224,210,255:0.26;252,187,161,255:0.39;252,146,114,255:0.52;251,106,74,255:0.65;239,59,44,255:0.78;203,24,29,255:0.9;165,15,21,255" k="stops"/>
          </colorramp>
          <item color="#fff5f0" alpha="255" label="0.6" value="0.6"/>
          <item color="#fee0d2" alpha="255" label="0.652" value="0.652"/>
          <item color="#fcbba1" alpha="255" label="0.704" value="0.704"/>
          <item color="#fc9272" alpha="255" label="0.756" value="0.756"/>
          <item color="#fb6a4a" alpha="255" label="0.808" value="0.808"/>
          <item color="#ef3b2c" alpha="255" label="0.86" value="0.86"/>
          <item color="#cb181d" alpha="255" label="0.912" value="0.912"/>
          <item color="#a50f15" alpha="255" label="0.96" value="0.96"/>
          <item color="#67000d" alpha="255" label="1" value="1"/>
        </colorrampshader>
      </rastershader>
    </rasterrenderer>
    <brightnesscontrast contrast="0" brightness="0"/>
    <huesaturation colorizeRed="255" colorizeGreen="0" colorizeBlue="0" colorizeOn="1" colorizeStrength="100" grayscaleMode="0" saturation="0"/>
    <rasterresampler maxOversampling="2"/>
  </pipe>
  <blendMode>6</blendMode>
</qgis>

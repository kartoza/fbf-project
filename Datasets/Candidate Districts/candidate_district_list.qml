<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis minScale="1e+08" simplifyDrawingTol="1" styleCategories="AllStyleCategories" readOnly="0" maxScale="0" labelsEnabled="0" simplifyAlgorithm="0" simplifyLocal="1" simplifyDrawingHints="1" simplifyMaxScale="1" version="3.9.0-Master" hasScaleBasedVisibilityFlag="0">
  <flags>
    <Identifiable>1</Identifiable>
    <Removable>1</Removable>
    <Searchable>1</Searchable>
  </flags>
  <renderer-v2 type="categorizedSymbol" symbollevels="0" forceraster="0" attr="CANDIDATE_CLASS" enableorderby="0">
    <categories>
      <category value="SECONDARY" symbol="0" label="SECONDARY" render="true"/>
      <category value="PRIMARY" symbol="1" label="PRIMARY" render="true"/>
    </categories>
    <symbols>
      <symbol alpha="1" clip_to_extent="1" type="fill" force_rhr="0" name="0">
        <layer pass="0" locked="0" class="SimpleFill" enabled="1">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="252,141,89,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="35,35,35,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" force_rhr="0" name="1">
        <layer pass="0" locked="0" class="SimpleFill" enabled="1">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="179,0,0,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="35,35,35,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
    </symbols>
    <source-symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" force_rhr="0" name="0">
        <layer pass="0" locked="0" class="SimpleFill" enabled="1">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="145,82,45,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="35,35,35,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option value="" type="QString" name="name"/>
              <Option name="properties"/>
              <Option value="collection" type="QString" name="type"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
    </source-symbol>
    <colorramp type="gradient" name="[source]">
      <prop k="color1" v="254,240,217,255"/>
      <prop k="color2" v="179,0,0,255"/>
      <prop k="discrete" v="0"/>
      <prop k="rampType" v="gradient"/>
      <prop k="stops" v="0.25;253,204,138,255:0.5;252,141,89,255:0.75;227,74,51,255"/>
    </colorramp>
    <rotation/>
    <sizescale/>
  </renderer-v2>
  <customproperties>
    <property value="0" key="embeddedWidgets/count"/>
    <property key="variableNames"/>
    <property key="variableValues"/>
  </customproperties>
  <blendMode>0</blendMode>
  <featureBlendMode>0</featureBlendMode>
  <layerOpacity>1</layerOpacity>
  <SingleCategoryDiagramRenderer diagramType="Histogram" attributeLegend="1">
    <DiagramCategory lineSizeType="MM" sizeType="MM" penAlpha="255" scaleDependency="Area" sizeScale="3x:0,0,0,0,0,0" penColor="#000000" height="15" minimumSize="0" maxScaleDenominator="1e+08" diagramOrientation="Up" opacity="1" labelPlacementMethod="XHeight" backgroundColor="#ffffff" enabled="0" width="15" lineSizeScale="3x:0,0,0,0,0,0" rotationOffset="270" penWidth="0" backgroundAlpha="255" scaleBasedVisibility="0" barWidth="5" minScaleDenominator="0">
      <fontProperties description=".SF NS Text,13,-1,5,50,0,0,0,0,0" style=""/>
    </DiagramCategory>
  </SingleCategoryDiagramRenderer>
  <DiagramLayerSettings linePlacementFlags="18" showAll="1" placement="1" priority="0" obstacle="0" zIndex="0" dist="0">
    <properties>
      <Option type="Map">
        <Option value="" type="QString" name="name"/>
        <Option name="properties"/>
        <Option value="collection" type="QString" name="type"/>
      </Option>
    </properties>
  </DiagramLayerSettings>
  <geometryOptions geometryPrecision="0" removeDuplicateNodes="0">
    <activeChecks/>
    <checkConfiguration/>
  </geometryOptions>
  <fieldConfiguration>
    <field name="fid">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="OBJECTID">
      <editWidget type="Range">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="ID_KAB_CLEAN">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="KABUPATEN">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="PROVINSI">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="ID_PROV">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="LUAS_HA">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="Shape_Length">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="Shape_Area">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="histo_NODATA">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="histo_70">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="histo_80">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="histo_90">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="total_count">
      <editWidget type="Range">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="score">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="ratio">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="CANDIDATE_CLASS">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
    <field name="kabkot">
      <editWidget type="TextEdit">
        <config>
          <Option/>
        </config>
      </editWidget>
    </field>
  </fieldConfiguration>
  <aliases>
    <alias field="fid" index="0" name=""/>
    <alias field="OBJECTID" index="1" name=""/>
    <alias field="ID_KAB_CLEAN" index="2" name=""/>
    <alias field="KABUPATEN" index="3" name=""/>
    <alias field="PROVINSI" index="4" name=""/>
    <alias field="ID_PROV" index="5" name=""/>
    <alias field="LUAS_HA" index="6" name=""/>
    <alias field="Shape_Length" index="7" name=""/>
    <alias field="Shape_Area" index="8" name=""/>
    <alias field="histo_NODATA" index="9" name=""/>
    <alias field="histo_70" index="10" name=""/>
    <alias field="histo_80" index="11" name=""/>
    <alias field="histo_90" index="12" name=""/>
    <alias field="total_count" index="13" name=""/>
    <alias field="score" index="14" name=""/>
    <alias field="ratio" index="15" name=""/>
    <alias field="CANDIDATE_CLASS" index="16" name=""/>
    <alias field="kabkot" index="17" name=""/>
  </aliases>
  <excludeAttributesWMS/>
  <excludeAttributesWFS/>
  <defaults>
    <default field="fid" applyOnUpdate="0" expression=""/>
    <default field="OBJECTID" applyOnUpdate="0" expression=""/>
    <default field="ID_KAB_CLEAN" applyOnUpdate="0" expression=""/>
    <default field="KABUPATEN" applyOnUpdate="0" expression=""/>
    <default field="PROVINSI" applyOnUpdate="0" expression=""/>
    <default field="ID_PROV" applyOnUpdate="0" expression=""/>
    <default field="LUAS_HA" applyOnUpdate="0" expression=""/>
    <default field="Shape_Length" applyOnUpdate="0" expression=""/>
    <default field="Shape_Area" applyOnUpdate="0" expression=""/>
    <default field="histo_NODATA" applyOnUpdate="0" expression=""/>
    <default field="histo_70" applyOnUpdate="0" expression=""/>
    <default field="histo_80" applyOnUpdate="0" expression=""/>
    <default field="histo_90" applyOnUpdate="0" expression=""/>
    <default field="total_count" applyOnUpdate="0" expression=""/>
    <default field="score" applyOnUpdate="0" expression=""/>
    <default field="ratio" applyOnUpdate="0" expression=""/>
    <default field="CANDIDATE_CLASS" applyOnUpdate="0" expression=""/>
    <default field="kabkot" applyOnUpdate="0" expression=""/>
  </defaults>
  <constraints>
    <constraint field="fid" constraints="3" exp_strength="0" notnull_strength="1" unique_strength="1"/>
    <constraint field="OBJECTID" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="ID_KAB_CLEAN" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="KABUPATEN" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="PROVINSI" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="ID_PROV" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="LUAS_HA" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="Shape_Length" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="Shape_Area" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="histo_NODATA" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="histo_70" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="histo_80" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="histo_90" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="total_count" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="score" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="ratio" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="CANDIDATE_CLASS" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
    <constraint field="kabkot" constraints="0" exp_strength="0" notnull_strength="0" unique_strength="0"/>
  </constraints>
  <constraintExpressions>
    <constraint field="fid" exp="" desc=""/>
    <constraint field="OBJECTID" exp="" desc=""/>
    <constraint field="ID_KAB_CLEAN" exp="" desc=""/>
    <constraint field="KABUPATEN" exp="" desc=""/>
    <constraint field="PROVINSI" exp="" desc=""/>
    <constraint field="ID_PROV" exp="" desc=""/>
    <constraint field="LUAS_HA" exp="" desc=""/>
    <constraint field="Shape_Length" exp="" desc=""/>
    <constraint field="Shape_Area" exp="" desc=""/>
    <constraint field="histo_NODATA" exp="" desc=""/>
    <constraint field="histo_70" exp="" desc=""/>
    <constraint field="histo_80" exp="" desc=""/>
    <constraint field="histo_90" exp="" desc=""/>
    <constraint field="total_count" exp="" desc=""/>
    <constraint field="score" exp="" desc=""/>
    <constraint field="ratio" exp="" desc=""/>
    <constraint field="CANDIDATE_CLASS" exp="" desc=""/>
    <constraint field="kabkot" exp="" desc=""/>
  </constraintExpressions>
  <expressionfields/>
  <attributeactions>
    <defaultAction value="{00000000-0000-0000-0000-000000000000}" key="Canvas"/>
  </attributeactions>
  <attributetableconfig sortOrder="0" actionWidgetStyle="dropDown" sortExpression="">
    <columns>
      <column hidden="0" type="field" name="fid" width="-1"/>
      <column hidden="0" type="field" name="OBJECTID" width="-1"/>
      <column hidden="0" type="field" name="ID_KAB_CLEAN" width="-1"/>
      <column hidden="0" type="field" name="KABUPATEN" width="-1"/>
      <column hidden="0" type="field" name="PROVINSI" width="-1"/>
      <column hidden="0" type="field" name="ID_PROV" width="-1"/>
      <column hidden="0" type="field" name="LUAS_HA" width="-1"/>
      <column hidden="0" type="field" name="Shape_Length" width="-1"/>
      <column hidden="0" type="field" name="Shape_Area" width="-1"/>
      <column hidden="0" type="field" name="histo_NODATA" width="-1"/>
      <column hidden="0" type="field" name="histo_70" width="-1"/>
      <column hidden="0" type="field" name="histo_80" width="-1"/>
      <column hidden="0" type="field" name="histo_90" width="-1"/>
      <column hidden="0" type="field" name="total_count" width="-1"/>
      <column hidden="0" type="field" name="score" width="-1"/>
      <column hidden="0" type="field" name="ratio" width="-1"/>
      <column hidden="0" type="field" name="CANDIDATE_CLASS" width="-1"/>
      <column hidden="0" type="field" name="kabkot" width="-1"/>
      <column hidden="1" type="actions" width="-1"/>
    </columns>
  </attributetableconfig>
  <conditionalstyles>
    <rowstyles/>
    <fieldstyles/>
  </conditionalstyles>
  <editform tolerant="1"></editform>
  <editforminit/>
  <editforminitcodesource>0</editforminitcodesource>
  <editforminitfilepath></editforminitfilepath>
  <editforminitcode><![CDATA[# -*- coding: utf-8 -*-
"""
QGIS forms can have a Python function that is called when the form is
opened.

Use this function to add extra logic to your forms.

Enter the name of the function in the "Python Init function"
field.
An example follows:
"""
from qgis.PyQt.QtWidgets import QWidget

def my_form_open(dialog, layer, feature):
	geom = feature.geometry()
	control = dialog.findChild(QWidget, "MyLineEdit")
]]></editforminitcode>
  <featformsuppress>0</featformsuppress>
  <editorlayout>generatedlayout</editorlayout>
  <editable>
    <field editable="1" name="CANDIDATE_CLASS"/>
    <field editable="1" name="ID_KAB_CLEAN"/>
    <field editable="1" name="ID_PROV"/>
    <field editable="1" name="KABUPATEN"/>
    <field editable="1" name="LUAS_HA"/>
    <field editable="1" name="OBJECTID"/>
    <field editable="1" name="PROVINSI"/>
    <field editable="1" name="Shape_Area"/>
    <field editable="1" name="Shape_Length"/>
    <field editable="1" name="fid"/>
    <field editable="1" name="histo_70"/>
    <field editable="1" name="histo_80"/>
    <field editable="1" name="histo_90"/>
    <field editable="1" name="histo_NODATA"/>
    <field editable="1" name="kabkot"/>
    <field editable="1" name="ratio"/>
    <field editable="1" name="score"/>
    <field editable="1" name="total_count"/>
  </editable>
  <labelOnTop>
    <field labelOnTop="0" name="CANDIDATE_CLASS"/>
    <field labelOnTop="0" name="ID_KAB_CLEAN"/>
    <field labelOnTop="0" name="ID_PROV"/>
    <field labelOnTop="0" name="KABUPATEN"/>
    <field labelOnTop="0" name="LUAS_HA"/>
    <field labelOnTop="0" name="OBJECTID"/>
    <field labelOnTop="0" name="PROVINSI"/>
    <field labelOnTop="0" name="Shape_Area"/>
    <field labelOnTop="0" name="Shape_Length"/>
    <field labelOnTop="0" name="fid"/>
    <field labelOnTop="0" name="histo_70"/>
    <field labelOnTop="0" name="histo_80"/>
    <field labelOnTop="0" name="histo_90"/>
    <field labelOnTop="0" name="histo_NODATA"/>
    <field labelOnTop="0" name="kabkot"/>
    <field labelOnTop="0" name="ratio"/>
    <field labelOnTop="0" name="score"/>
    <field labelOnTop="0" name="total_count"/>
  </labelOnTop>
  <widgets/>
  <previewExpression>fid</previewExpression>
  <mapTip></mapTip>
  <layerGeometryType>2</layerGeometryType>
</qgis>

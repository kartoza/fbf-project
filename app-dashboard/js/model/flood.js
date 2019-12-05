define([
    'backbone',
    'wellknown'
    ], function (Backbone, Wellknown) {

    /**
     * Attributes:
     *  - areas []
     *      - geometry
     *      - depth_class
     *  - geojson
     *  - id
     *  - place_name
     *  - notes
     *  - return_period
     *  - station
     *      - glofas_id
     *      - name
     *      - geometry
     */
    const FloodLayer = Backbone.Model.extend({

            // attribute placeholder
            _url : {
                flooded_area: postgresUrl + 'flooded_area',
                flooded_areas: postgresUrl + 'flooded_areas',
                flood_map: postgresUrl + 'flood_map'
            },
            _table_attrs: {
                flood_map: {
                    place_name: 'place_name',
                    notes: 'notes',
                    return_period: 'return_period'
                },
                flooded_area: {
                    flood_id: 'flood_map_id',
                    flooded_area_id: 'flooded_area_id'
                },
                flooded_areas: {
                    depth_class: 'depth_class',
                    geometry: 'geometry'
                }
            },

            _geojson_attrs: {
                flood_class_field: "class"
            },
        
            initialize: function (){
                this._uploaded_features = 0;
                this.on('feature-uploaded', this.featureUploaded, this);
            },

            getFloodMapAttributes: function(){
                return {
                    [this._table_attrs.flood_map.place_name]: this.get('place_name'),
                    [this._table_attrs.flood_map.notes]: this.get('notes'),
                    [this._table_attrs.flood_map.return_period]: this.get('return_period')
                }
            },

            featureCount: function(){
                const areas = this.get('areas');
                if(areas) {
                    return areas.length;
                }
                return 0;
            },
        
            featureUploaded: function(feature){
                if(feature) {
                    this._uploaded_features++;
                }
                if ( this._uploaded_features > this.featureCount()) {
                    this._uploaded_features = this.featureCount();
                }
            },

            uploadedFeatures: function(){
                return this._uploaded_features
            },

            _createFloodMap: function () {
                const that = this
                return new Promise(function (resolve, reject) {
                    // Create new flood map first, then retrieve the id
                    AppRequest.post(
                        that._url.flood_map,
                        that.getFloodMapAttributes())
                        .done( function(data, textStatus, response){
                            if(response.status === 201){
                                // Flood map creation succeed
                                // get the flood map id
                                const flood_map_url = postgresBaseUrl + response.getResponseHeader('Location')
                                AppRequest.get(flood_map_url)
                                    .done(
                                        function (data) {
                                            if (data && data[0]) {
                                                const flood_map_id = data[0].id
                                                // Create flooded area relationship
                                                that._createFloodedAreas(flood_map_id)
                                                // if succeed, done
                                                    .then(function () {
                                                        resolve({
                                                            id: flood_map_id,
                                                            url: flood_map_url
                                                        })
                                                    })
                                                    // if fails, reject
                                                    .catch(reject)
                                            }
                                        }
                                    ).catch(reject)
                            }
                            else {
                                reject(response)
                            }
                        }).catch(reject)
                })
            },

            _createFloodedAreas: function (flood_map_id) {
                // Bulk insert doesn't return ids, so we insert one by one
                const areas = this.get('areas')
                const that = this

                const on_post_fails = function (data) {
                    console.log('Flooded Area post fails: ' + data)
                }

                const on_post_relations_fails = function (data) {
                    console.log('Flooded Area relationship post fails: ' + data)
                }

                const created_areas = areas.map(function(value){
                    // Insert flood area, one by one, as promise.
                    return that._createFloodedArea({
                        [that._table_attrs.flooded_areas.geometry]: 'SRID=4326;' + Wellknown.stringify(value.geometry),
                        [that._table_attrs.flooded_areas.depth_class]: value.depth_class
                    }).catch(on_post_fails)
                })

                return new Promise(function (resolve, reject) {
                    // If all posted areas succeed, insert relationships
                    Promise.all(created_areas).then(function (values) {
                        // Make lists of Flood_Area - Flood_Areas relationship
                        const relations = values.map(function (value) {
                            return {
                                [that._table_attrs.flooded_area.flood_id]: flood_map_id,
                                [that._table_attrs.flooded_area.flooded_area_id]: value.id
                            }
                        })
                        // Bulk insert relationship
                        AppRequest.post(
                            that._url.flooded_areas,
                            relations,
                            null,
                            null,
                            'application/json')
                            .done(
                                function (data, textStatus, response) {
                                    if(response.status === 201) {
                                        // Bulk insert succeed
                                        // we resolve but nothing to return since the REST API doesn't have anything useful returned
                                        that.set({
                                            id: flood_map_id
                                        })
                                        resolve()
                                    }
                                    else {
                                        // posting relationship fails
                                        on_post_relations_fails(response)
                                        // tell what the response is
                                        reject(response)
                                    }
                                })
                            // request error
                            .catch(reject)

                        // one of the promise to post flood area fails
                    }).catch(on_post_fails)
                })
            },

            _createFloodedArea: function (area) {
                // Return promised created flooded area object
                const that = this
                return new Promise(function (resolve, reject) {
                    // Insert an area
                    AppRequest.post(
                        that._url.flooded_area,
                        area)
                        .done(
                            // callback to get area id
                            function (data, textStatus, response) {
                                if(response.status === 201){
                                    // get object
                                    const flooded_area_url = postgresBaseUrl + response.getResponseHeader('Location')
                                    AppRequest.get(
                                        // created object were given via Location header
                                        flooded_area_url,
                                        null,
                                        null,
                                        function (data) {
                                            // send the newly created object
                                            if(data && data[0]){
                                                that.trigger('feature-uploaded', data[0])
                                                resolve(data[0])
                                            }
                                            else {
                                                reject(data)
                                            }
                                        },
                                        reject
                                    )
                                }
                                else {
                                    reject(data)
                                }
                            })
                        .catch(reject)
                })
            },

            _validateMultiPolygonFeature: function(){
                let geojson = this.get('geojson');
                const areas = geojson.features;
                const that = this;
                if(areas !== undefined && areas.length > 0){
                    let feature = areas[0];
                    let geom = feature.geometry;
                    let geom_type = geom.type;
                    if(geom_type === 'MultiPolygon'){
                        return true;
                    }
                    else if(geom_type === "Polygon"){
                        // convert to multipolygon
                        let new_areas = areas.map(function (feature) {
                            let geom = {
                                'type': 'MultiPolygon',
                                'coordinates': [feature.geometry.coordinates]
                            };
                            feature.geometry = geom;
                            return feature;
                        });

                        let geojson = that.get('geojson');
                        geojson.features = new_areas;
                        that.set('geojson', geojson);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                return false;
            },
        
            _validateDepthClassAttribute: function () {
                const geojson = this.get('geojson');
                const areas = geojson.features;
                const that = this;
                if(areas !== undefined && areas.length > 0) {
                    let feature = areas[0];
                    return (that._geojson_attrs.flood_class_field in feature.properties)
                }
                else {
                    return false;
                }
            }
        },
        {
            uploadFloodMap: function(flood_map_attributes){
                return new Promise(function (resolve, reject) {
                    // Upload flood map from file specified in HTML input dom
                    // We only handle one single GeoJSON
                    const selected_file = flood_map_attributes.files[0]
                    const geojson = flood_map_attributes.geojson
                    const place_name = flood_map_attributes.place_name
                    const return_period = flood_map_attributes.return_period
                    const flood_model_notes = flood_map_attributes.flood_model_notes

                    function _process_geojson(geojson){
                        try {
                            const layer = FloodLayer.fromGeoJSON(JSON.parse(geojson));
                            layer.set({
                                place_name: place_name,
                                return_period: return_period,
                                notes: flood_model_notes
                            })

                            // send the layer object
                            resolve(layer)

                            // Perform upload to backend in async
                            layer._createFloodMap()
                                .then(function (data) {
                                    // what to do when succeed
                                    layer.trigger('upload-finished', layer)
                                })
                                .catch(function (data) {
                                    // what to do when upload fails
                                    reject(data)
                                })
                        }
                        catch (e) {
                            reject(e)
                        }
                    }

                    if("geojson" in flood_map_attributes){
                        _process_geojson(geojson);
                    }
                    else {

                        const reader = new FileReader()

                        reader.onload = function (e) {
                            const result = e.target.result

                            // result must be a GeoJSON
                            _process_geojson(result);
                        }

                        // Read the file as GeoJSON text
                        reader.readAsText(selected_file)
                    }
                })
            },

            fromGeoJSON: function (geojson_layer, attributes) {
                /**
                 * geojson_layer is a geojson object
                 */

                const layer = new FloodLayer(attributes)
                layer.set('geojson', geojson_layer)

                // validations
                let is_valid_geom = layer._validateMultiPolygonFeature();
                if(! is_valid_geom){
                    let e = {
                        'layer': layer,
                        'message': 'Invalid geometry types'
                    }
                    throw e
                }

                let is_valid_attributes = layer._validateDepthClassAttribute();
                if(! is_valid_attributes){

                    let e = {
                        'layer': layer,
                        'message': `Depth class attribute "${layer._geojson_attrs.flood_class_field}" does not exists in the flood layer`
                    }
                    throw e
                }

                const validated_geojson = layer.get('geojson');

                const areas = validated_geojson.features.map(function(value){
                    return {
                        depth_class: value.properties[layer._geojson_attrs.flood_class_field],
                        geometry: value.geometry
                    }
                })
                layer.set('areas', areas)
                return layer
            },
        })
    return FloodLayer
})

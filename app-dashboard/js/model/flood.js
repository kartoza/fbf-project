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
                    flood_id: 'flood_id',
                    flooded_area_id: 'flooded_area_id'
                },
                flooded_areas: {
                    depth_class: 'depth_class',
                    geometry: 'geometry'
                }
            },

            getFloodMapAttributes: function(){
                return {
                    [this._table_attrs.flood_map.place_name]: this.get('place_name'),
                    [this._table_attrs.flood_map.notes]: this.get('notes'),
                    [this._table_attrs.flood_map.return_period]: this.get('return_period')
                }
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
                                const flood_map_url = response.getResponseHeader('Location')
                                AppRequest.get(flood_map_url)
                                    .done(
                                        function (data) {
                                            const flood_map_id = data.id
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
                const areas = this.areas
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
                            that._url.flooded_area,
                            relations)
                            .done(
                                function (data, textStatus, response) {
                                    if(response.status === 201) {
                                        // Bulk insert succeed
                                        // we resolve but nothing to return since the REST API doesn't have anything useful returned
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
                        that._url.flooded_areas,
                        area)
                        .done(
                            // callback to get area id
                            function (data, textStatus, response) {
                                if(response.status === 201){
                                    // get object
                                    AppRequest.get(
                                        // created object were given via Location header
                                        data.getResponseHeader('Location'),
                                        null,
                                        null,
                                        function (data) {
                                            // send the newly created object
                                            resolve(data)
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
            }
        },
        {
            uploadFloodMap: function(files, place_name, return_period, notes, forecast_date, acquired_date){
                // Upload flood map from file specified in HTML input dom
                // We only handle one single GeoJSON
                const selected_file = files[0]
                const reader = new FileReader()

                reader.onload = function(e){
                    const result = e.target.result

                    // result must be a GeoJSON
                    const layer = FloodLayer.fromGeoJSON(result)
                    layer.set({
                        place_name: place_name,
                        return_period: return_period,
                        notes: notes
                    })

                    // Perform upload to backend
                    layer._createFloodMap()
                        .then(function (data) {
                            // what to do when succeed
                            console.log(data)
                        })
                        .catch(function (data) {
                            // what to do when upload fails
                            console.log(data)
                        })
                }

                // Read the file as GeoJSON text
                reader.readAsText(selected_file)

            },

            fromGeoJSON: function (geojson_layer, attributes) {
                /**
                 * geojson_layer is a geojson object
                 */

                const layer = new FloodLayer(attributes)
                layer.set('geojson', geojson_layer)
                const areas = geojson_layer.features.map(function(value){
                    return {
                        depth_class: value.properties["class"],
                        geometry: value.geometry
                    }
                })
                layer.set('areas', areas)
                return layer
            },
        })
    return FloodLayer
})

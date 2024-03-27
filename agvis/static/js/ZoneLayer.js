/* ****************************************************************************************
 * File Name:   ZoneLayer.js
 * Authors:     Nicholas West, Nicholas Parsley
 * Date:        9/28/2023 (last modified)
 * 
 * Description: ZoneLayer.js contains the code for the ZoneLayer class. The ZoneLayer 
 *              highlights certain areas of the map with colors. These areas are 
 *              determined by a GeoJSON file. For the most part, ZoneLayer is fairly 
 *              self-explanatory. During its initialization, it calls a chain of functions 
 *              that ensure that the necessary data is loaded before rendering. It is also 
 *              guaranteed to be drawn underneath the TopologyLayer and ContourLayer. The 
 *              ZoneLayer extends from the Leaflet GeoJSON class.
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/zone.html
 * ****************************************************************************************/

/**
 * @class ZoneLayer
 * @extends {L.GeoJSON}
 * @param   {Object}    options - The leaflet options passed to the ZoneLayer.
 * @var     {Boolean}   _render - Determines whether the ZoneLayer is rendered or not.
 * @var     {Response}  geojson - The main thing to note with the geojson variable is the fetch command used to initialize it.
 * @returns {ZoneLayer}
 */
L.ZoneLayer = L.GeoJSON.extend({
	options: {
        /**
         * Determines which colors are assigned to what zones based on the GeoJSON data. Adjusting the return values of the switch statement 
         * can change the colors of the zones. The cases for the switch statement will most likely have to be changed if a different 
         * GeoJSON file is used.
         * 
         * @memberof ZoneLayer
         * @param {Object} feature - Contains the properties of the GeoJSON file that are used to determine the color of specific zones.
         * @returns 
         */
        style: function(feature) {
            switch (feature.properties.NERC) {
                case 'MRO':  return {color: "#ff0000"};
                case 'NPCC': return {color: "#ff8000"};
                case 'RFC':  return {color: "#ffff00"};
                case 'SERC': return {color: "#00ff00"};
                case 'SPP':  return {color: "#00ffff"};
                case 'TRE':  return {color: "#0000ff"};
                case 'WECC': return {color: "#8000ff"};
                case '-':    return {color: "#808080"};
            }
        }
	},

    /**
     * Initialize the ZoneLayer variables.
     * 
     * @constructs ZoneLayer
     * @param {Object} options
     * @returns 
     */
    initialize(options) {
        L.GeoJSON.prototype.initialize.call(this, null, options);
        this._render = false;
        this._geojson = null;

        (async function(zonelayer) {
            let geojson = await fetch("/js/nerc_regions.geojson");
            geojson = await geojson.json();

            zonelayer._geojson = geojson;
            zonelayer.toggleRender();
        })(this);
    },

    /**
     * Adds GeoJSON data to the layer but also manipulates the order in which different 
     * map layers are rendered by moving the GeoJSON layer's pane within the DOM structure. 
     * 
     * @memberof ZoneLayer
     * @param {*} geojson 
     * @returns
     */
    addData(geojson) {
        L.GeoJSON.prototype.addData.call(this, geojson);

        // Move ZoneLayer's pane within the div containing all of the panes,
        // ensuring that it is drawn below the TopologyLayer/ContourLayer
        let pane = this.getPane();
        let parent = pane.parentElement;

        parent.removeChild(pane);
        //if (!pane.classList.contains("zone-pane")) {
        //    pane.classList.add("zone-pane");
        //}

        let topologypane = parent.querySelector(".topology-pane");

        if (topologypane) {
            parent.insertBefore(pane, topologypane);
        } else {
            parent.prepend(pane);
        }
    },

    /**
     * Toggles the rendering of the ZoneLayer.
     * 
     * @memberof ZoneLayer
     * @returns
     */
    toggleRender() {
        this._render = !this._render;
        console.log("Zone rendering: ", this._render);

        if (this._render) {
            this.addData(this._geojson);
        } else {
            this.clearLayers();
        }
    }
});

L.zoneLayer = function(options) {
	return new L.ZoneLayer(options);
};

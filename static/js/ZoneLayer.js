L.ZoneLayer = L.GeoJSON.extend({
	options: {
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

    initialize(options) {
        L.GeoJSON.prototype.initialize.call(this, null, options);
        this._layers = {};

        (async function(zonelayer) {
            let geojson = await fetch("/static/js/nerc_regions.geojson");
            geojson = await geojson.json();

            zonelayer.addData(geojson);
        })(this);
    },

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
    }
});

L.zoneLayer = function(options) {
	return new L.ZoneLayer(options);
};

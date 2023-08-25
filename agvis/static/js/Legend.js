L.Legend = L.Control.extend({
    onAdd: function() {
        let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        div.style.backgroundColor = "white";
        div.style.boxSizing = "border-box";
        div.style.padding = "4px";

        div.innerHTML = "<p style=\"font-size:250%;\"><strong>Hello there</strong></p>";
        return div;
    },

    onRemove: function() {
        // Nothing to do here
    }
});

L.legend = function(opts) { return new L.Legend(opts); }
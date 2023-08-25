L.Legend = L.Control.extend({
    onAdd: function() {
        this.simulation_time = 0;
        this.text = L.DomUtil.create('div');
        this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Hello there</strong></p>";
        return this.text;
    },

    onRemove: function() {
        // Nothing to do here
    }
});

L.legend = function(opts) { return new L.Legend(opts); }
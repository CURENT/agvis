L.SimTimeBox = L.Control.extend({
    simulation_time: 0.0,

    onAdd: function(map) {
                this.simulation_time = 0;
                this.text = L.DomUtil.create('div');
                this.text.id = "info_text";
                this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
                return this.text;

    },

    onRemove: function(map) {
                    // Nothing to do here

    },

    update: function(t){
        this.simulation_time = t;
        this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
    }

});

L.simTimeBox = function(opts) { return new L.SimTimeBox(opts); }


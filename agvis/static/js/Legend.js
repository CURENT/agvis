L.DynamicLegend = L.Control.extend({
    options: {
        position: 'bottomright',
    },

    initialize: function(win, options) {
        this.win = win;
        if (options) L.Util.setOptions(this, options);
    },

    onAdd: function() {
        // Legend Container
        let div = L.DomUtil.create('div', 'leaflet-bar');
        div.style.backgroundColor = 'white';
        div.style.boxSizing = 'border-box';
        div.style.padding = '5px';
        div.style.paddingLeft = '15px';
        div.style.paddingRight = '15px';
        div.style.width = '300px';
        div.style.height = '75px';

        // Title and Units labels
        let topLabels = L.DomUtil.create('div', '', div);
        topLabels.style.width = '100%';
        topLabels.style.height = '16px';

        this.title = L.DomUtil.create('div', '', topLabels);
        this.title.style.float = 'left';
        this.title.style.width = '45%';

        this.units = L.DomUtil.create('div', '', topLabels);
        this.units.style.float = 'right';
        this.units.style.width = '55%';

        // Create Dynamic Gradient
        let gradient = L.DomUtil.create('div', 'legend-gradient', div);
        gradient.style.backgroundImage = 'linear-gradient(to right, #0b00ff, #0044ff, #0044ff, #279eff, #41cef1, #41cef1, #ffffff, #ffb41e, #ffb41e, #ff9537, #ff4727, #ff4727, #ff0000)';
        gradient.style.width = '100%';
        gradient.style.height = '20px';
        gradient.style.border = '1px solid grey';
        gradient.style.borderRadius = '2px';

        // Min and max labels
        let bottomLabels = L.DomUtil.create('div', '', div);
        bottomLabels.style.width = '100%';

        this.min = L.DomUtil.create('div', '', bottomLabels);
        this.min.style.float = 'left';

        this.max = L.DomUtil.create('div', '', bottomLabels);
        this.max.style.float = 'right';

        // Initialize the legend values
        this.update();

        return div;
    },

    update: function() {
        if (this.win.state == this.win.states.angl)
        {
            this.title.innerHTML = "V Angle";
            this.units.innerHTML = "(rad)";
            this.min.innerHTML = this.win.options.amin;
            this.max.innerHTML = this.win.options.amax;
        }
        else if (this.win.state == this.win.states.volt)
        {
            this.title.innerHTML = "V Magnitude";
            this.units.innerHTML = "(p.u.)";
            this.min.innerHTML = this.win.options.vmin;
            this.max.innerHTML = this.win.options.vmax;
        }
        else if (this.win.state == this.win.states.freq)
        {
            this.title.innerHTML = "Frequency";
            this.units.innerHTML = "(p.u.)";
            this.min.innerHTML = this.win.options.fmin;
            this.max.innerHTML = this.win.options.fmax;
        }
    }
});
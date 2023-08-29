L.DynamicLegend = L.Control.extend({
    options: {
        position: 'bottomright',
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
        // div.style.height = "100px";
        div.style.height = '75px';

        // Title if we need it
        // let title = L.DomUtil.create('div', '', div);
        // title.style.width = '100%';
        // title.style.textAlign = 'center';
        // title.style.fontSize = '14px';
        // title.style.fontWeight = 'bold';
        // title.innerHTML = 'Dynamic Results';

        // Labels at the top of the bar
        let topLabels = L.DomUtil.create('div', '', div);
        topLabels.style.width = '100%';
        topLabels.style.height = '16px';

        let left = L.DomUtil.create('div', '', topLabels);
        left.style.float = 'left';
        left.style.width = '40%';
        left.innerHTML = "<p>Contour</p>";

        let right = L.DomUtil.create('div', '', topLabels);
        right.style.float = 'right';
        right.style.width = '60%';
        right.innerHTML = "<p>Bus + Hz</p>";

        // Create Dynamic Gradient
        let gradient = L.DomUtil.create('div', 'legend-gradient', div);
        gradient.style.backgroundImage = 'linear-gradient(to right, #0b00ff, #0044ff, #0044ff, #279eff, #41cef1, #41cef1, #ffffff, #ffb41e, #ffb41e, #ff9537, #ff4727, #ff4727, #ff0000)';
        gradient.style.width = '100%';
        gradient.style.height = '20px';
        gradient.style.border = '1px solid grey';
        gradient.style.borderRadius = '2px';
        // gradient.style.margin = 'auto';

        // Labels below the bar
        let bottomLabels = L.DomUtil.create('div', '', div);
        bottomLabels.style.width = '100%';

        left = L.DomUtil.create('div', '', bottomLabels);
        left.style.float = 'left';
        left.innerHTML = "<p>-0.1100</p>";

        right = L.DomUtil.create('div', '', bottomLabels);
        right.style.float = 'right';
        right.innerHTML = "<p>+0.1100</p>";

        return div;
    }
});

L.dynamicLegend = function() { return new L.DynamicLegend(); }
let PlaybackBar = L.Control.extend({
    options: {
        position: "bottomleft"
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);
    },

    onAdd: function(options) {
        let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        div.style.backgroundColor = "white";
        //div.style.width = "50%";
        //div.style.minWidth = "20em";
        //div.style.padding = 2;

        let playbackbar = L.DomUtil.create('input', '', div);
        //playbackbar.style.width = "100%";
        playbackbar.type = "range";

        let pausebutton = L.DomUtil.create('input', '', div);
        //pausebutton.style.float = "left";
        pausebutton.type = "button";
        pausebutton.value = "Pause";

        let stopbutton = L.DomUtil.create('input', '', div);
        //stopbutton.style.float = "left";
        stopbutton.type = "button";
        stopbutton.value = "Stop";

        let playbackspeedrange = L.DomUtil.create('input', '', div);
        playbackspeedrange.type = "range";
        playbackspeedrange.value = 2;
        playbackspeedrange.min = -1;
        playbackspeedrange.max = 6;
        playbackspeedrange.step = 1;

        let playbackspeedtext = L.DomUtil.create('input', '', div);
        playbackspeedtext.type = "text";
        playbackspeedtext.value = "1";
        playbackspeedtext.pattern = "[0-9]*(\.[0-9]*)?";
        playbackspeedtext.disabled = true;

        return div;
    },

    onRemove: function(options) {}
});

let PlaybackBar = L.Control.extend({
    options: {
        position: "bottomleft"
    },

    initialize: function(map, workspace, options) {
        this.map = map;
        this.workspace = workspace;

        if (options) L.Util.setOptions(this, options);
    },

    onAdd: function(options) {
        const { map, workspace } = this;

        let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        div.style.backgroundColor = "white";

        let playbackbar = L.DomUtil.create('input', '', div);
        playbackbar.type = "range";
        playbackbar.min = 0;
        playbackbar.max = map.end_time;
        playbackbar.value = map.end_time;
        playbackbar.keep_ticking = true;

        playbackbar.oninput = function() {
            workspace.currentTimeInSeconds = Number(playbackbar.value);
        }

        let pausebutton = L.DomUtil.create('input', '', div);
        pausebutton.type = "button";
        pausebutton.value = "Pause";

        pausebutton.onclick = function() { console.log(name + ": Pause!"); }

        let stopbutton = L.DomUtil.create('input', '', div);
        stopbutton.type = "button";
        stopbutton.value = "Stop";

        stopbutton.onclick = function() {
            map.resetTime();
        }

        let playbackspeedrange = L.DomUtil.create('input', '', div);
        playbackspeedrange.type = "range";
        playbackspeedrange.value = 2;
        playbackspeedrange.min = -1;
        playbackspeedrange.max = 6;
        playbackspeedrange.step = 1;

        let playbackspeeddiv = L.DomUtil.create('div', '', div);

        let playbackspeedtext = L.DomUtil.create('input', '', div);
        playbackspeedtext.type = "text";
        playbackspeedtext.value = "1";
        playbackspeedtext.pattern = "[0-9]*(\.[0-9]*)?";
        playbackspeedtext.disabled = true;

        playbackspeedrange.oninput = function() {
            if (playbackspeedrange.value < 0) {
                playbackspeedtext.disabled = false;
                playbackspeeddiv.innerHTML = "Custom";

                const val = Number(playbackspeedtext.value);

                if (val >= 0) {
                    map.timescale = val;
                }
            } else {
                playbackspeedtext.disabled = true;

                const vals = [
                    0.25,
                    0.5,
                    1,
                    1.5,
                    2,
                    3,
                    4
                ];

                const val = vals[Number(playbackspeedrange.value)];

                map.timescale = val;
                playbackspeeddiv.innerHTML = " " + val + "x";
            }
        }

        playbackspeedtext.oninput = function() {
            const val = Number(playbackspeedtext.value);

            if (val > 0) {
                map.timescale = val;
            }
        }

        return div;
    },

    onRemove: function(options) {}
});

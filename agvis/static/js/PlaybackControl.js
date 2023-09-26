/* ****************************************************************************************
 * File Name:   PlaybackControl.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/21/2023 (last modified)
 * 
 * Description: PlaybackControl.js contains the code for the PlaybackControl class, also 
 *              known as the Playback Bar. The Playback Bar handles the UI for the 
 *              ContourLayer animations. It updates the Window’s timescale when the user 
 *              changes the animation speed, sets the time when the user restarts or scrubs 
 *              through the animation, and changes the opacity setting for ContourLayer’s 
 *              rendering based on the user’s input.
 * ****************************************************************************************/

let PlaybackControl = L.Control.extend({
    options: {
        position: "bottomleft"
    },

    /**
     * Sets PlaybackControl.win and calls the Leaflet Util Initialization function.
     * 
     * @constructs PlaybackControl
     * @param {Window} win     - The Window the Playback Bar is associated with.
     * @param {Object} options - (optional) Passed to leaflet 
     */
    initialize: function(win, options) {
        this.win = win;
        this.opacitybar = null;
        this.playbackbar = null;

        if (options) L.Util.setOptions(this, options);
    },

    /**
     * Adds all the UI elements to the map. Also sets up all of their event functions.
     * 
     * @memberof PlaybackControl
     * @param   {Object} options - Completely unused.
     * @returns 
     */
    onAdd: function(options) {
        const { win } = this;
        let paused = false;
        let playbackspeed = 1.0;

        let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
		
        div.style.backgroundColor = "white";
        div.style.boxSizing = "border-box";
        div.style.padding = "4px";

        L.DomEvent.disableClickPropagation(div);

        let playbackbar = L.DomUtil.create('input', '', div);
        this.playbackbar = playbackbar;
        playbackbar.style.width = "100%";
        playbackbar.type = "range";
        playbackbar.min = 0;
        playbackbar.max = win.end_time;
        playbackbar.step = 0.01;
        playbackbar.value = win.end_time;

        /**
         * Updates the Window’s time whenever the user changes the range input.
         * 
         * @memberof PlaybackControl
         * @returns
         */
        playbackbar.oninput = function() {
            win.time = Number(playbackbar.value);
        }

        let ldiv = L.DomUtil.create('div', '', div);
        ldiv.style.float = "left";

        let pausebutton = L.DomUtil.create('input', '', ldiv);
        pausebutton.type = "button";
        pausebutton.value = "Pause";

        /**
         * Toggles whether the animation is paused or not. When paused, timescale is set to 0. When not, it is set to whatever timescale the user has selected.
         * 
         * @memberof PlaybackControl
         * @returns
         */
        pausebutton.onclick = function() {
            paused = !paused;

            if (paused) {
                win.timescale = 0;
                pausebutton.value = "Play";
            } else {
                win.timescale = playbackspeed;
                pausebutton.value = "Pause";
            }
        }

        // Stop button
        let stopbutton = L.DomUtil.create('input', '', ldiv);
        stopbutton.type = "button";
        stopbutton.value = "Stop";

        stopbutton.onclick = function() {
            win.resetTime();
        }

        let rdiv = L.DomUtil.create('div', '', div);
        rdiv.style.float = "right";

        let opacitylabel = L.DomUtil.create('span', '', rdiv);
        opacitylabel.innerHTML = "Opacity ";
        let opacitybar = L.DomUtil.create('input', '', rdiv);
        this.opacitybar = opacitybar;
        opacitybar.type = "range";
        opacitybar.min = 0;
        opacitybar.max = 1;
        opacitybar.step = 0.01;
        opacitybar.value = 1.0;

        let opacityspan = L.DomUtil.create('span', '', rdiv);
        opacityspan.innerHTML = " 100 ";
        opacityspan.style.marginRight = '20px';

        opacitybar.oninput = function(e) {
            a = Math.round(e.target.value*100);
            opacityspan.innerHTML = ' ' + a + ' ';
            win.contourLayer.updateOpacity(e.target.value);
        }

        let playbackspeedlabel = L.DomUtil.create('span', '', rdiv);
        playbackspeedlabel.innerHTML = "Speed ";
        let playbackspeedrange = L.DomUtil.create('input', '', rdiv);
        playbackspeedrange.type = "range";
        playbackspeedrange.value = 2;
        playbackspeedrange.min = -1;
        playbackspeedrange.max = 6;
        playbackspeedrange.step = 1;

        let playbackspeedspan = L.DomUtil.create('span', '', rdiv);
        playbackspeedspan.innerHTML = " 1x ";

        let playbackspeedtext = L.DomUtil.create('input', '', rdiv);
        playbackspeedtext.type = "text";
        playbackspeedtext.value = "1";
        playbackspeedtext.pattern = "[0-9]*(\.[0-9]*)?";
        playbackspeedtext.disabled = true;
        playbackspeedtext.size = 4;

        /**
         * Updates the Window’s timescale when the user changes the input bar. Also handles adjusting settings when a user selects the custom playback speed option.
         * 
         * @memberof PlaybackControl
         * @returns
         */
        playbackspeedrange.oninput = function() {
            if (playbackspeedrange.value < 0) {
                playbackspeedtext.disabled = false;
                playbackspeedspan.innerHTML = " Custom ";

                const val = Number(playbackspeedtext.value);

                if (val > 0) {
                    playbackspeed = val;
                    if (!paused) {
                        win.timescale = playbackspeed;
                    }
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

                playbackspeed = val;
                if (!paused) {
                    win.timescale = playbackspeed;
                }

                playbackspeedspan.innerHTML = " " + val + "x ";
            }
        }

        /**
         * Sets the Window’s timescale to the value the user input in the text box if the custom playback speed option has been selected.
         * 
         * @memberof PlaybackControl
         * @returns
         */
        playbackspeedtext.oninput = function() {
            const val = Number(playbackspeedtext.value);

            if (val > 0) {
                playbackspeed = val;
                if (!paused) {
                    win.timescale = playbackspeed;
                }
            }
        }

		
        return div;
    },

    onRemove: function(options) {},

    /**
     * Updates the Playback Bar’s value based on the Window’s current time.
     * 
     * @memberof PlaybackControl
     * @param {Number} value - The time passed from the window
     * @returns
     */
    updatePlaybackBar: function(value) {
        if (this.playbackbar) {
            this.playbackbar.value = value;
        }
    }
});

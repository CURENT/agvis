/* ****************************************************************************************
 * File Name:   PlayMulti.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/26/2023 (last modified)
 * 
 * Description: PlayMulti.js contains the code for the PlayMulti control, which handles 
 *              the simulation controls for newlayers. It is mostly the same as the 
 *              PlaybackControl, though it does also incorporate some aspects from 
 *              SimTimeBox since the timer for each newlayer is just some updating text as 
 *              opposed to a full time box.
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/playmulti.html
 * ****************************************************************************************/

/**
 * @class PlayMulti
 * @extends {L.Control}
 * 
 * @var {Object}  newlayer    - The newlayer associated with the specific Playback Bar.
 * @var {Element} playbackbar - The multiplier for how much time passes per timestep. Setting it to 0 pauses the animation.
 * @var {Number}  prev        - The previous Playback Bar value. Used to check if the timer actually needs to update.
 * 
 * @returns {PlayMulti}
 */
let PlayMulti = L.Control.extend({
    options: {
        position: "bottomleft"
    },

	/**
     * Primarily just sets PlayMulti.win and calls the Leaflet Util initialization function.
     * 
     * @constructs PlayMulti
     * @param {*}      newlayer - The newlayer associated with the specific Playback Bar.
     * @param {Object} options  - (optional) Passed to leaflet
     * @param {*}      elem     
     * @param {Window} win      - The primary window for AGVis
     * @returns
     */
    initialize: function(newlayer, options, elem, win) {
        this.newlayer = newlayer;
        this.playbackbar = null;

        if (options) L.Util.setOptions(this, options);
		
        let paused = false;
        let playbackspeed = 1.0;

        // ===============================================================
        // Define the CSS styles for the playback control.
        // ===============================================================

        let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.style.backgroundColor = "white";
        div.style.boxSizing = "border-box";
        div.style.padding = "4px";
		div.id = "pbar" + newlayer.num;

        // ===============================================================
        // Create the playback control.
        // ===============================================================

        L.DomEvent.disableClickPropagation(div);
		div.appendChild(document.createElement("br"));
        let playbackbar = L.DomUtil.create('input', '', div);
		this.win = win;
        this.playbackbar = playbackbar;
        playbackbar.style.width = "100%";
        playbackbar.type = "range";
        playbackbar.min = Number(newlayer.start_time);
        playbackbar.max = Number(newlayer.end_time);
        playbackbar.step = 0.01;
        playbackbar.value = Number(newlayer.end_time);
		this.newlayer.curtime = Number(Date.now());
		this.prev = Number(newlayer.end_time);

		/**
         * Updates the Window’s time whenever the user changes the range input.
         * 
         * @memberof PlayMulti
         * @returns
         */
        playbackbar.oninput = function() {
            newlayer.time = Number(playbackbar.value);
			newlayer.cont.update(this.win);
        }

        // ===============================================================
        // Create the playback control buttons.
        // ===============================================================

        let ldiv = L.DomUtil.create('div', '', div);
        ldiv.style.float = "left";

        let pausebutton = L.DomUtil.create('input', '', ldiv);
        pausebutton.type = "button";
        pausebutton.value = "Pause";

        pausebutton.onclick = function() {
            paused = !paused;

            if (paused) {
                newlayer.timescale = 0;
                pausebutton.value = "Play";
            } else {
                newlayer.timescale = Number(playbackspeed);
                pausebutton.value = "Pause";
            }
        }

        let stopbutton = L.DomUtil.create('input', '', ldiv);
        stopbutton.type = "button";
        stopbutton.value = "Restart";

        /**
         * Resets the animation back to the beginning.
         * 
         * @memberof PlayMulti
         * @returns
         */
        stopbutton.onclick = function() {
            newlayer.time = playbackbar.min;
			playbackbar.value = playbackbar.min;
        }

        let rdiv = L.DomUtil.create('div', '', div);
        rdiv.style.float = "right";

        let playbackspeedrange = L.DomUtil.create('input', '', ldiv);
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
         * Updates the Window’s timescale when the user changes the input bar. Also handles 
         * adjusting settings when a user selects the custom playback speed option.
         * 
         * @memberof PlayMulti
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
                        newlayer.timescale = playbackspeed;
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
                    newlayer.timescale = playbackspeed;
                }

                playbackspeedspan.innerHTML = " " +  val + "x ";
            }
        }

        /**
         * Sets the Window’s timescale to the value the user input in the text box if 
         * the custom playback speed option has been selected.
         * 
         * @memberof PlayMulti
         * @returns
         */
        playbackspeedtext.oninput = function() {
            const val = Number(playbackspeedtext.value);

            if (val > 0) {
                playbackspeed = val;
                if (!paused) {
                    newlayer.timescale = playbackspeed;
                }
            }
        }

        // ===============================================================
        // Create div2 to hold the playback control.
        // ===============================================================
	
	    let div2 = document.createElement("div");
	    div.style.marginTop = "10px";
	    div.style.marginBottom = "10px";
	    div2.appendChild(div);
	    elem.appendChild(div2);
    },

    onRemove: function(options) {},

	/**
     * Updates the Playback Bar’s value based on the Window’s current time, requests that the MultiContLayer 
     * updates, and checks for Custom Timestamp settings.
     * 
     * @param {Number} dt       - The number of seconds between the current update and the most recent update.
     * @param {Number} timestep - The current time from the window.
     */
    updatePlaybackBar: function(dt, timestep) {
        if (this.playbackbar) {
			
			//Calculate the timer it should be at
			let pt = dt * Number(this.newlayer.timescale);
			
			//If it goes over, just set it to max
			if (Number(this.playbackbar.value) + pt > this.playbackbar.max) {
				
				this.playbackbar.value = this.playbackbar.max;
			}
			else {
				this.playbackbar.value = Number(this.playbackbar.value) + pt;
			}
			
			//Only update it if it actually changes
			if (this.prev != Number(this.playbackbar.value)) {
				
				this.prev = Number(this.playbackbar.value);
				this.newlayer.curtime = timestep;
				this.newlayer.time = this.playbackbar.value;
				let timerup = document.getElementById("sp1_" + this.newlayer.num);
				
				const tstamp = document.getElementById("ny_" + this.newlayer.num);
				
				//Check for using timestamp
				if (tstamp.checked) {
						
					//If you are, use the provided timer, not the pure seconds one
					let dval2 = document.getElementById("ts_date_" + this.newlayer.num).value;
					let nval2 = Number(document.getElementById("ts_num_" + this.newlayer.num).value);
					// let yval2 = document.getElementById("ny_" + this.newlayer.num).checked;
					let tval2 = document.getElementById("ts_time_" + this.newlayer.num).value;
					
					if ((dval2 == "") || (nval2 < 0) || (!(Number.isFinite(nval2))) || (tval2 == "")) {
						timerup.innerText = "Simulation Time: " + this.newlayer.time;
					}
					else {
						//msmult is the millisecond multiplier. It determines how many ms need to be added to the time per frame.
						let msmult = 1;
						let ival2 = document.getElementById("ts_inc_" + this.newlayer.num).value;
						let sdate = Date.parse(dval2 + " " + tval2);
						let fdate = sdate;
						
						//Could be reversed in order to be a litle more efficient, but this is more readable.
						switch(ival2) {
                
							case "s":
                        
							msmult = 1000;
							break;
							
							case "min":
                        
							msmult = 1000 * 60;
							break;
							
							case "h":
                        
							msmult = 1000 * 60 * 60;
							break;
                    
							case "day":
                    
							msmult = 1000 * 60 * 60 * 24;
							break;
						
							default:
							
							msmult = 1;
						}
        
						//Actual calculation of the new time.
						fdate = fdate + (msmult * this.newlayer.time * nval2);
                
						let ddate = new Date(fdate);
						let dstring = new Date(Date.UTC(ddate.getFullYear(), ddate.getMonth(), ddate.getDate(), ddate.getHours(), ddate.getMinutes(), ddate.getSeconds(), ddate.getMilliseconds()));
						let isostring = dstring.toISOString().split("T");
                
						timerup.innerText = "Simulation time: " + isostring[0] + " " + isostring[1].slice(0, 12);
					
					}
				}
				else {
					timerup.innerText = "Simulation Time: " + this.newlayer.time;
				}
				
				this.newlayer.cont.update(this.win);
			}
        }
    }
});

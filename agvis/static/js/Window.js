/* ***********************************************************************************
 * File Name:   Window.js
 * Authors:     Nicholas West, Nicholas Parsley, Zack Malkmus
 * Date:        9/15/2023 (last modified)
 * 
 * The window class is the main class for AGVis. It contains 5 layers: 
 * (Tile Layer | Zone Layer | Topology Layer | Contour Layer | User Layer)
 * 
 * [Note] Each of these are described in their respective files and on the github
 * https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/index.html#development
 * 
 * Windows initialize the map and all of the layers, and contains the main thread.
 * They handle timing for the animations and receiving data from DiME. They 
 * also instantiate most of the Layers and UI elements used for displaying data.
 * Developers that want to add new features to AGVis will inevitably have to either 
 * interface with a Window directly or with one of its components.
 * ***********************************************************************************/

class Window {
    /**
     * The constructor for the Window class. 
     * 
     * Instantiates the layers along with various UI elements. It also begins 
     * the timer loop for simulations uploaded by users instead of sent through DiME.
     * 
     * @constructs Window
     * 
     * @param   {Number} num     - The number of the window.
     * @param   {Object} options - The options for the window.
     * @param   {Object} dimec   - The DiME client (Unused).
     * @returns
     * 
     * @var {Object} workspace  - Contains the data of all variables for the current timestep.
     * @var {Object} history    - Contains the data of all variabes for all timesteps.
     * @var {Object} states     - The enum for the window's view state.
     * @var {Number} state      - The window's current view state.
     * @var {Object} options    - The options for the window.
     * @var {Array}  multilayer - An array of newlayer Objects containing the data necessary for displaying simulations added by file upload.
     * 
     * @example const window1 = new Window(1, options[0]);
     * @see     index.html
     */
    constructor(num, options, dimec) {
        // ====================================================================
        // Initialize workspace and history
        // ====================================================================
         
        this.workspace = {};
        this.history = {};

        // Enum to track the window's view state
        this.states = {
            angl: 0,
            volt: 1,
            freq: 2,
        }
        this.state = this.states.freq;

        this.num = num;
        this.options = options;

        this.multilayer = [];
        this.multihistory = [];
        this.mlayercur = 0;
        this.mnumfree = 0;

        /**
         * The timer loop for the playback bar. It updates the playback bar every 17 milliseconds.
         * Animation step is associated with receiving info from DiME, so we have to use this for 
         * the bundled version.
         * 
         * @memberof Window
         * 
         * @param    {Object} multilayer - The array of multilayers.
         * @returns
         */
		setInterval(function(multilayer) {
			let timestep = Number(Date.now());
			for (let i = 0; i < multilayer.length; i++) {
				
				let multi = multilayer[i];
				
				if (multi == null) {
					
					continue;
				}
				
				let pt = (timestep - multi.curtime) / 1000;
				multi.pbar.updatePlaybackBar(pt, timestep);
				multi.curtime = Number(timestep);
			}
		}, 17, this.multilayer);

        this.map_name = "map" + num;
        this.dimec_name = "geovis" + num;
        this.time = 0.0;
        this.end_time = null;
        this.timescale = 1.0;

        this.p1 = options.p1;
        this.p2 = options.p2;
        this.p3 = options.p3;

        const p1min = (options.p1min === undefined) ? 0 : options.p1min;
        const p1max = (options.p1max === undefined) ? 0 : options.p1max;

        const arch = "LTB Modules and Data Flow";

        let TILE_LAYER_URL = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?' +
                             'access_token=pk.eyJ1IjoiamhlcndpZzEiLCJhIjoiY2lrZnB2MnE4MDAyYnR4a2xua3pramprNCJ9.7-wu_YjNrTFsEE0mcUP06A';

        let plotOpen = false;
        let plot1Index = 5;

        this.map = L.map(this.map_name, {
            minZoom: 3,
            maxZoom: 10,
			zoomSnap: 0.01,
            center: [40, -100],
            zoom: 5,
        });
        
        // ===================================================================
        // Initialize AGVis layers and UI elements
        // ===================================================================

        this.map.handshake = true;
        this.legend = new L.DynamicLegend(this, options).addTo(this.map);
        this.pbar = new PlaybackControl(this, options);
        this.tileLayer = L.tileLayer(TILE_LAYER_URL).addTo(this.map);
        this.zoneLayer = L.zoneLayer().addTo(this.map);
        this.topologyLayer = L.topologyLayer().addTo(this.map);
        this.contourLayer = L.contourLayer().addTo(this.map);
        this.communicationLayer = L.communicationLayer().addTo(this.map);
        this.searchLayer = L.searchLayer().addTo(this.map);
        this.map.addControl(this.searchLayer.control);
        this.simTimeBox = L.simTimeBox({ position: 'topright' }).addTo(this.map);

        /**
         * The function that is called when the user clicks on the map. It is used to toggle the sidebar.
         * 
         * @memberof Window
         * 
         * @param    {Object} e - The event object.
         * @returns
         */
        const sidebar = L.control.sidebar({
            autopan: true,                         // whether to maintain the centered map point when opening the sidebar
            closeButton: true,                     // whether t add a close button to the panes
            container: this.map_name + '_sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
            position: 'right',                     // left or right
        }).addTo(this.map);

        // Add new panels to the sidebar
        let visPlotName = this.map_name + "Vis";
        let visPane = '';

        if (this.p1 !== undefined) {
            visPane = visPane + '<div id="' + visPlotName + this.p1 + '"></div>'
        }

        if (this.p2 !== undefined) {
            visPane = visPane + '<div id="' + visPlotName + this.p2 + '"></div>'
        }

        if (this.p3 !== undefined) {
            visPane = visPane + '<div id="' + visPlotName + this.p3 + '"></div>'
        }

        addSidebarConfig(this, options, sidebar);
        addSidebarLayers(this, options, sidebar);

        sidebar.addPanel({
            id: 'plotPanel',                         // UID, used to access the panel
            tab: '<i class="fa fa-line-chart"></i>', // content can be passed as HTML string,
            pane: visPane,                           // DOM elements can be passed, too
            title: 'LTB Plot Panel',                 // an optional pane header
            position: 'top'                          // optional vertical alignment, defaults to 'top'
        });

        sidebar.addPanel({
            id: 'architecture',
            tab: '<i class="fa fa-info"></i>',
            pane: '<img src="/img/ltb-architecture.gif" width="400", height="600">',
            title: 'LTB System Architecture',
            position: 'top'
        });
    }

    /**
     * This getter retrieves the variables stored in Window.history, allowing for the 
     * playback of simulations.
     * 
     * @memberof    Window
     * 
     * @param       {String} varname              - The name of the variable to retrieve.
     * @param       {Number} currentTimeInSeconds - The current time in seconds.
     */
    historyKeeper(varname, currentTimeInSeconds) {
        const varHistory = this.history[varname];
        let value;

        if (varHistory == null) {
            return false;
        }

        for (let i = 0; i < varHistory.length; ++i) {
            value = varHistory[i];
            const t = value.t;
            if (t >= currentTimeInSeconds) break;
        }

        this.workspace[varname] = value;
        return true;
    }

    /**
     * Begins drawing the simulation once initial data is received from DiME.
     * Initializes Contour Layer and starts its animation.
     * 
     * @memberof    Window
     * @returns
     */
    startSimulation() {
        const busVoltageIndices = this.workspace.Idxvgs.Bus.V.array;
        const busThetaIndices = this.workspace.Idxvgs.Bus.theta.array;
        const busfreqIndices= this.workspace.Idxvgs.Bus.w_Busfreq.array;

        const nBus = busVoltageIndices.length;

        // Build the idx list for simulator
        let nPlotVariable = 1;

        if (this.p2 !== undefined) {
            nPlotVariable += 1;
        }

        if (this.p3 !== undefined) {
            nPlotVariable += 1;
        }

		//console.log(nPlotVariable);
        this.variableAbsIndices = new Float64Array(nBus * 3 + nPlotVariable);
        this.variableRelIndices = {};

        for (let i=0; i < busVoltageIndices.length; ++i) {
            this.variableAbsIndices[i] = Number(busVoltageIndices[i]);
        }
        for (let i=0; i < busThetaIndices.length; ++i) {
            this.variableAbsIndices[nBus + i] = Number(busThetaIndices[i]);
        }
        for (let i=0; i < busfreqIndices.length; ++i) {
            this.variableAbsIndices[2*nBus + i] = Number(busfreqIndices[i]);
        }
        if (this.p1 !== undefined)
            this.variableAbsIndices[3*nBus] = parseInt(this.p1);
        if (this.p2 !== undefined)
            this.variableAbsIndices[3*nBus + 1] = parseInt(this.p2);
        if (this.p3 !== undefined)
            this.variableAbsIndices[3*nBus + 2] = parseInt(this.p3);

        // Build internal idx list
        this.variableRelIndices["V"] = {"begin": 0, "end": nBus};
        this.variableRelIndices["theta"] = {"begin": nBus, "end": 2 * nBus};
        this.variableRelIndices["freq"] = {"begin": 2 * nBus, "end": 3 * nBus};
		//console.log(this.variableRelIndices);
		
        // Update variable Range
        this.contourLayer.storeRelativeIndices(this.variableRelIndices);
        this.contourLayer.showVariable("freq");

        const fmin = (this.options.fmin === undefined) ? 0.9998 : this.options.fmin;
        const fmax = (this.options.fmax === undefined) ? 1.0002 : this.options.fmax;

        this.contourLayer.updateRange(fmin, fmax);
    }

    /**
     * Called once all the simulation data has been received. 
     * It sets the end time for the animation and adds the Playback Bar UI element.
     * 
     * @memberof Window
     * @return
     */
    endSimulation() {
        this.time = this.end_time = Number(this.workspace.Varvgs.t.toFixed(2));
        this.pbar.addTo(this.map);
    }
	/*
	function updateTimer(multilayer) {
		
			let timestep = Date.now();
			console.log(timestep);
			for (let i = 0; i < multilayer.length; i++) {
				
				let multi = multilayer[i];
				
				if (multi == null) {
					
					continue;
				}
				
				let pt = (timestep - multi.pbar.curtime) / 1000.0;
				
				multi.pbar.updatePlaybackBar(pt, timestep);
				multi.topo.update(self.workspace);
				multi.cont.update(self.workspace);
				
			}
	}
*/
    /**
     * Creates and calls the step() and reset() functions to draw the animation
     * 
     * @memberof Window
     * @returns
     */
    async drawThread() {
        const lineSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
            "width": 300,
            "height": 180,
            "description": "Plot",
            "data": {"name": "table"},
            "mark": "line",
            "encoding": {
                "x": {"field": "Time",  "type": "quantitative"},
                "y": {"field": "Value", "type": "quantitative", "scale": {"domain": {"data": "table", "field": "Value"}}},
            },
            "autosize": {
                resize: true
            }
            //"autosize": {"type": "fit", "contains": "padding"}
        };

        const self = this;

        if (this.p1 !== undefined) {
            const { view } = await vegaEmbed('#' + this.map_name + 'Vis' + this.p1, lineSpec, {defaultStyle: true});
            this.workspace.p1 = view;
        }

        if (this.p2 !== undefined) {
            const { view } = await vegaEmbed('#' + this.map_name + 'Vis' + this.p2, lineSpec, {defaultStyle: true});
            this.workspace.p2 = view;
        }

        if (this.p3 !== undefined) {
            const { view } = await vegaEmbed('#' + this.map_name + 'Vis' + this.p3, lineSpec, {defaultStyle: true});
            this.workspace.p3 = view;
        }

        let firstTime = null;

        /**
         * Finds the difference between the current time and the previous step() call’s time and 
         * updates the variables and the Layers based on the new time. It also updates the SimTimeBox display.
         * 
         * @param   {*} currentTime 
         * @returns
         */
        function step(currentTime) {
            requestAnimationFrame(step);

            if (firstTime === null) {
                self.time = 0.0;
                firstTime = currentTime;
                return;
            }

            let dt = (currentTime - firstTime) / 1000.0;
			
            if (self.end_time !== null) {
                dt *= self.timescale;
            }

            self.time += dt;
			
            self.pbar.updatePlaybackBar(self.time);
			
            self.workspace.currentTimeInSeconds = self.time;
            firstTime = currentTime;

            // get data from history, update contour, simulation time, and plots
            let ready = self.historyKeeper('Varvgs', self.workspace.currentTimeInSeconds);
            if (!ready) return;

            //zoneLayer.update(workspace);
            self.communicationLayer.update(self.workspace);
            self.topologyLayer.update(self.workspace);
            self.contourLayer.update(self.workspace);
            self.searchLayer.update(self.workspace, self);
		
			//console.log(self.workspace.Varvgs);

            if (self.workspace.Varvgs) {
                self.simTimeBox.update(self.workspace.Varvgs.t.toFixed(2));

                // determine the number of plots
                let nPlots = 0;
                if (self.p1 !== undefined)
                    nPlots += 1;
                if (self.p2 !== undefined)
                    nPlots += 1;
                if (self.p3 !== undefined)
                    nPlots += 1;

                // determine the total number of variables from andes
                let nVariables = self.workspace.Varvgs.vars.shape[1];

                if (self.p1 !== undefined)
                    self.workspace.p1.insert("table", {"Time": self.workspace.Varvgs.t, "Value": self.workspace.Varvgs.vars.get(0, nVariables - nPlots) }).run();
                if (self.p2 !== undefined)
                    self.workspace.p2.insert("table", {"Time": self.workspace.Varvgs.t, "Value": self.workspace.Varvgs.vars.get(0, nVariables - nPlots + 1) }).run();
                if (self.p3 !== undefined)
                    self.workspace.p3.insert("table", {"Time": self.workspace.Varvgs.t, "Value": self.workspace.Varvgs.vars.get(0, nVariables - nPlots + 2) }).run();
            }
        }

        /**
         * Resets the variable for telling if an animation is starting from the beginning.
         * 
         * @returns
         */
        function reset() {
            firstTime = null;
            if (self.p1 !== undefined)
                self.workspace.p1.remove('table', function(d) { return true; }).run();
            if (self.p2 !== undefined)
                self.workspace.p2.remove('table', function(d) { return true; }).run();
            if (self.p3 !== undefined)
                self.workspace.p3.remove('table', function(d) { return true; }).run();
        }

        requestAnimationFrame(step);
        return reset;
    }

    /**
     * The main AGVis program. Starts and stops the simulation based on input from the
     * DiME server. Also creates some UI elements for changing simulation view.
     * Invoked in index.html after creating the window.
     * 
     * @memberof Window
     * 
     * @returns
     * 
     * @see      index.html
     */
    async mainThread() {
        const self = this;

        const resetTime = await this.drawThread();
        this.workspace.resetTime = resetTime;
        this.map.resetTime = resetTime;
        this.resetTime = resetTime;

        // ====================================================================
        // UI Buttons
        // ====================================================================

        // voltage angle
        const thetaButton = L.easyButton('<span>&Theta;</span>', function(btn, map) {
            const amin = (self.options.amin === undefined) ? -1.0 : self.options.amin;
            const amax = (self.options.amax === undefined) ?  1.0 : self.options.amax;

            self.contourLayer.showVariable("theta");
            self.contourLayer.updateRange(amin, amax);
            self.state = self.states.angl;
            self.legend.update();
        });
        
        // voltage magnitude
        const voltageButton = L.easyButton('<span>V</span>', function(btn, map) {
            const vmin = (self.options.vmin === undefined) ? 0.8 : self.options.vmin;
            const vmax = (self.options.vmax === undefined) ? 1.2 : self.options.vmax;

            self.contourLayer.showVariable("V");
            self.contourLayer.updateRange(vmin, vmax);
            self.state = self.states.volt;
            self.legend.update();
        });

        // frequency
        const freqButton = L.easyButton('<span><i>f</i></span>', function(btn, map) {
            const fmin = (self.options.fmin === undefined) ? 0.9998 : self.options.fmin;
            const fmax = (self.options.fmax === undefined) ? 1.0002 : self.options.fmax;

            self.contourLayer.showVariable("freq");
            self.contourLayer.updateRange(fmin, fmax);
            self.state = self.states.freq;
            self.legend.update();
        });

        /// Added toggle buttons for different layer views
        const rendContourButton = L.easyButton('<i class="fa fa-bolt"></i>', function(btn, map) {
            self.contourLayer.toggleRender();
        });

        const rendCommunicationButton = L.easyButton('<i class="fa fa-wifi"></i>', function(btn, map) {
            //self.topologyLayer.toggleRender(); // Since communicationlayer is unused, just do this for now
            self.communicationLayer.toggleRender();
        });

        const avfButtons = [thetaButton, voltageButton, freqButton];
        const avfBar = L.easyBar(avfButtons).addTo(this.map);

        const toggleLayerButtons = [rendContourButton, rendCommunicationButton];
        const toggleLayerBar = L.easyBar(toggleLayerButtons).addTo(this.map);

        // ====================================================================
        // DiME
        // ====================================================================

        newdimeserver: for (;;) {
            this.dimec = new dime.DimeClient(this.options.dimehost, this.options.dimeport);
            let dime_updated = this.dime_updated();

            //await this.dimec.join(this.dimec_name);
            if (await Promise.any([this.dimec.join(this.dimec_name), dime_updated]) instanceof DimeInfo) {
                continue newdimeserver;
            }

            console.time(this.map_name);

            let sentHeader = false;

            for (;;) {
                let kvpair = {};

                while (Object.keys(kvpair).length === 0) {
                    //await this.dimec.wait();
                    if (await Promise.any([this.dimec.wait(), dime_updated]) instanceof DimeInfo) {
                        continue newdimeserver;
                    }

                    kvpair = await this.dimec.sync_r(1);
                }

                const [[name, value]] = Object.entries(kvpair);

                if (!this.map.handshake) {
                    continue;
                }

                this.workspace[name] = value;

                if (!this.history[name]) this.history[name] = [];
                this.history[name].push(value);

                //if (name !== 'Varvgs' && name !== 'pmudata' && name !== 'LTBNET_vars')
                    //console.log({ name, value });

                if (!sentHeader && name === 'Idxvgs') {
                    this.startSimulation();

                    kvpair = {};
                    kvpair[this.dimec_name] = { vgsvaridx: new dime.NDArray('F', [1, this.variableAbsIndices.length],this.variableAbsIndices) };

                    //await this.dimec.send_r('andes', kvpair);
                    if (await Promise.any([this.dimec.send_r('andes', kvpair), dime_updated]) instanceof DimeInfo) {
                        continue newdimeserver;
                    }

                    sentHeader = true;
                } else if (name === 'DONE') {
                    console.timeEnd(this.map_name);
                    this.endSimulation();
                }
            }
        }
    }

    /**
     * Sets the history and workspace when loading a previous simulation from a DiME file upload. 
     * Note that this is separate from the MultiLayer and IDR features. The button for this is 
     * found in the Configuration menu.
     * 
     * @memberof Window
     * 
     * @param   {Object} buf - The Array buffer from the file upload
     * @returns
     */
    load(buf) {
        let {workspace, history} = dime.dimebloads(buf);

        this.workspace = workspace;
        this.history = history;
    }

    /**
     * Downloads a DiME file of the current simulation. 
     * Note that this is separate from the MultiLayer and IDR features.
     * 
     * @memberof Window
     * 
     * @returns  {Object} The DiME file of the current simulation.
     */
    save() {
        return dime.dimebdumps({history: this.history, workspace: this.workspace});
    }
}
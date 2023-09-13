class Window {
    constructor(num, options, dimec) {
        this.workspace = {};
        this.history = {};

        // Keep track of the view state
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
		
		//Loops every 17 milliseconds to update the animation for the independent simulation data
		//Animation step is associated with receiving info from DiME, so we have to use this for the bundled version
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

        // side bar
        const sidebar = L.control.sidebar({
            autopan: true,       // whether to maintain the centered map point when opening the sidebar
            closeButton: true,    // whether t add a close button to the panes
            container: this.map_name + '_sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
            position: 'right',     // left or right
        }).addTo(this.map);

        /* add a new panel */
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
            id: 'plotPanel',                     // UID, used to access the panel
            tab: '<i class="fa fa-line-chart"></i>',  // content can be passed as HTML string,
            pane: visPane,        // DOM elements can be passed, too
            title: 'LTB Plot Panel',              // an optional pane header
            position: 'top'                  // optional vertical alignment, defaults to 'top'
        });

        sidebar.addPanel({
            id: 'architecture',
            tab: '<i class="fa fa-info"></i>',
            pane: '<img src="/img/ltb-architecture.gif" width="400", height="600">',
            title: 'LTB System Architecture',
            position: 'top'
        });
    }

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

    async mainThread() {
        const self = this;

        const resetTime = await this.drawThread();
        this.workspace.resetTime = resetTime;
        this.map.resetTime = resetTime;
        this.resetTime = resetTime;

        /// Bar of icons for voltage, theta and frequency
        const thetaButton = L.easyButton('<span>&Theta;</span>', function(btn, map) {
            const amin = (self.options.amin === undefined) ? -1.0 : self.options.amin;
            const amax = (self.options.amax === undefined) ?  1.0 : self.options.amax;

            self.contourLayer.showVariable("theta");
            self.contourLayer.updateRange(amin, amax);
            self.state = self.states.angl;
            self.legend.update();
        });

        const voltageButton = L.easyButton('<span>V</span>', function(btn, map) {
            const vmin = (self.options.vmin === undefined) ? 0.8 : self.options.vmin;
            const vmax = (self.options.vmax === undefined) ? 1.2 : self.options.vmax;

            self.contourLayer.showVariable("V");
            self.contourLayer.updateRange(vmin, vmax);
            self.state = self.states.volt;
            self.legend.update();
        });

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

    load(buf) {
        let {workspace, history} = dime.dimebloads(buf);

        this.workspace = workspace;
        this.history = history;
    }

    save() {
        return dime.dimebdumps({history: this.history, workspace: this.workspace});
    }
}
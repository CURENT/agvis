function CreateWindow(map_name, dimec, dimec_name) {
    const options = window.location.hash.substring(1).split(',').map((d) => d.split('=')).reduce((acc, [k, v]) => { acc[k] = v; return acc;  }, {});

    const vmin = (options.vmin === undefined) ? 0.8 : options.vmin;
    const vmax = (options.vmax === undefined) ? 1.2 : options.vmax;

    const amin = (options.amin === undefined) ? -1.0 : options.amin;
    const amax = (options.amax === undefined) ?  1.0 : options.amax;

    const fmin = (options.fmin === undefined) ? 0.9998 : options.fmin;
    const fmax = (options.fmax === undefined) ? 1.0002 : options.fmax;

    const p1 = options.p1;
    const p2 = options.p2;
    const p3 = options.p3;

    const p1min = (options.p1min === undefined) ? 0 : options.p1min;
    const p1max = (options.p1max === undefined) ? 0 : options.p1max;

    const arch = "LTB Modules and Data Flow"

    let TILE_LAYER_URL = 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?' +
                         'access_token=pk.eyJ1IjoiamhlcndpZzEiLCJhIjoiY2lrZnB2MnE4MDAyYnR4a2xua3pramprNCJ9.7-wu_YjNrTFsEE0mcUP06A';

    let plotOpen = false;
    let plot1Index = 5;

    var map = L.map(map_name, {
        minZoom: 3,
        maxZoom: 10,
        center: [40, -100],
        zoom: 5,
    });

    const workspace = {};
    const history = {};

    const tileLayer = L.tileLayer(TILE_LAYER_URL).addTo(map);

    const zoneLayer = L.zoneLayer().addTo(map);
    const topologyLayer = L.topologyLayer().addTo(map);
    const contourLayer = L.contourLayer().addTo(map);
    const communicationLayer = L.communicationLayer().addTo(map);
    const searchLayer = L.searchLayer().addTo(map);

    map.addControl(searchLayer.control);

    const layers = {
        zoneLayer,
        tileLayer,
        topologyLayer,
        contourLayer,
        communicationLayer
    };

    const simTimeBox = L.simTimeBox({ position: 'topright' }).addTo(map);

    const lineSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        "width": 300,
        "height": 180,
        "description": "Plot",
        "data": {"name": "table"},
        "mark": "line",
        "encoding": {
            "x": {"field": "Time",  "type": "quantitative" },
            "y": {"field": "Value", "type": "quantitative"},
        },
        "autosize": {
            resize: true
        }
    };

    // side bar
    const sidebar = L.control.sidebar({
        autopan: true,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether t add a close button to the panes
        container: map_name + '_sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'right',     // left or right
    }).addTo(map);

    /* add a new panel */
    let visPlotName = map_name + "Vis";
    let visPane = '';

    if (p1 !== undefined) {
        visPane = visPane + '<div id="' + visPlotName + p1 + '"></div>'
    }

    if (p2 !== undefined) {
        visPane = visPane + '<div id="' + visPlotName + p2 + '"></div>'
    }

    if (p3 !== undefined) {
        visPane = visPane + '<div id="' + visPlotName + p3 + '"></div>'
    }

    var plotPanel = {
        id: 'plotPanel',                     // UID, used to access the panel
        tab: '<i class="fa fa-line-chart"></i>',  // content can be passed as HTML string,
        pane: visPane,        // DOM elements can be passed, too
        title: 'LTB Plot Panel',              // an optional pane header
        position: 'top'                  // optional vertical alignment, defaults to 'top'
    };
    sidebar.addPanel(plotPanel);

    sidebar.addPanel({
        id: 'architecture',
        tab: '<i class="fa fa-info"></i>',
        pane: '<img src="static/img/ltb-architecture.gif" width="400", height="600">',
        title: 'LTB System Architecture',
        position: 'top'
    });

    function historyKeeper(workspace, history, currentTimeInSeconds, varname) {
        const varHistory = history[varname];
        let value;

        if (varHistory == null){
            return false;
        }
        for (let i=0; i<varHistory.length; ++i) {
            value = varHistory[i];
            const t = value.t;
            if (t >= currentTimeInSeconds) break;
        }
        workspace[varname] = value;
        return true;

    }

    async function updateThread(workspace) {
        if (p1 !== undefined) {
            const { view } = await vegaEmbed('#' + map_name + 'Vis' + p1, lineSpec, {defaultStyle: true})
            workspace.p1 = view;
        }

        if (p2 !== undefined) {
            const { view } = await vegaEmbed('#' + map_name + 'Vis' + p2, lineSpec, {defaultStyle: true})
            workspace.p2 = view;
        }

        if (p3 !== undefined) {
            const { view } = await vegaEmbed('#' + map_name + 'Vis' + p3, lineSpec, {defaultStyle: true})
            workspace.p3 = view;
        }

        let firstTime = null;

        function step(currentTime) {
            requestAnimationFrame(step);

            if (firstTime === null) {
                firstTime = currentTime;
                return;
            }
            workspace.currentTimeInSeconds = (currentTime - firstTime) / 1000.0;

            // get data from history, update contour, simulation time, and plots
            ready = historyKeeper(workspace, history, workspace.currentTimeInSeconds, 'Varvgs');
            if (!ready) return;

            zoneLayer.update(workspace);
            topologyLayer.update(workspace);
            contourLayer.update(workspace);
            communicationLayer.update(workspace);
            searchLayer.update(workspace);

            if (workspace.Varvgs) {
                simTimeBox.update(workspace.Varvgs.t.toFixed(2));

                // determine the number of plots
                nPlots = 0;
                if (p1 !== undefined)
                    nPlots += 1;
                if (p2 !== undefined)
                    nPlots += 1;
                if (p3 !== undefined)
                    nPlots += 1;

                // determine the total number of variables from andes
                nVariables = workspace.Varvgs.vars.shape[1];

                if (p1 !== undefined)
                    workspace.p1.insert("table", {"Time": workspace.Varvgs.t, "Value": workspace.Varvgs.vars.get(0, nVariables - nPlots) }).run();
                if (p2 !== undefined)
                    workspace.p2.insert("table", {"Time": workspace.Varvgs.t, "Value": workspace.Varvgs.vars.get(0, nVariables - nPlots + 1) }).run();
                if (p3 !== undefined)
                    workspace.p3.insert("table", {"Time": workspace.Varvgs.t, "Value": workspace.Varvgs.vars.get(0, nVariables - nPlots + 2) }).run();
            }
        }

        function reset() {
            firstTime = null;
            if (p1 !== undefined)
                workspace.p1.remove('table', function(d) { return true; }).run();
            if (p2 !== undefined)
                workspace.p2.remove('table', function(d) { return true; }).run();
            if (p3 !== undefined)
                workspace.p3.remove('table', function(d) { return true; }).run();
        }

        requestAnimationFrame(step);
        return reset;
    }

    (async () => {

    const resetTime = await updateThread(workspace);
    workspace.resetTime = resetTime;
    map.resetTime = resetTime;

    /// Bar of icons for voltage, theta and frequency
    const thetaButton = L.easyButton('<span>&Theta;</span>', function(btn, map){
        contourLayer.showVariable("theta");
        contourLayer.updateRange(-1, 1);
    });
    const voltageButton = L.easyButton('<span>V</span>', function(btn, map){
        contourLayer.showVariable("V");
        contourLayer.updateRange(0.8, 1.2);
    });
    const freqButton = L.easyButton('<span><i>f</i></span>', function(btn, map){
        contourLayer.showVariable("freq");
        contourLayer.updateRange(0.9998, 1.0002);
    });

    /// Added toggle buttons for different layer views
    const rendContourButton = L.easyButton('<i class="fa fa-bolt"></i>', function(btn, map){
        contourLayer.toggleRender();
        topologyLayer.toggleRender();
    });
    const rendCommunicationButton = L.easyButton('<i class="fa fa-wifi"></i>', function(btn, map){
        communicationLayer.toggleRender();
    });

    const avfButtons= [thetaButton, voltageButton, freqButton];
    const avfBar = L.easyBar(avfButtons).addTo(map);

    const toggleLayerButtons = [rendContourButton, rendCommunicationButton];
    const toggleLayerBar = L.easyBar(toggleLayerButtons).addTo(map);

    await dimec.ready;
    console.time(map_name);

    let sentHeader = false;

    for (;;) {
        const { name, value } = await dimec.sync();

        workspace[name] = value;

        if (!history[name]) history[name] = [];
        history[name].push(value);

        if (name !== 'Varvgs' && name !== 'pmudata' && name !== 'LTBNET_vars')
            console.log({ name, value });

        if (!sentHeader && name === 'Idxvgs') {
            const busVoltageIndices = workspace.Idxvgs.Bus.V.typedArray;
            const busThetaIndices = workspace.Idxvgs.Bus.theta.typedArray;
            const busfreqIndices= workspace.Idxvgs.Bus.w_Busfreq.typedArray;

            const nBus = busVoltageIndices.length;

            // Build the idx list for simulator
            nPlotVariable = 1;
            if (p2 !== undefined){
                nPlotVariable += 1;
            }
            if (p3 !== undefined){
                nPlotVariable += 1;
            }

            const variableAbsIndices = new Float64Array(nBus * 3 + nPlotVariable);
            const variableRelIndices = {};

            for (let i=0; i<busVoltageIndices.length; ++i) {
                variableAbsIndices[i] = busVoltageIndices[i];
            }
            for (let i=0; i<busThetaIndices.length; ++i) {
                variableAbsIndices[nBus + i] = busThetaIndices[i];
            }
            for (let i=0; i<busfreqIndices.length; ++i) {
                variableAbsIndices[2*nBus + i] = busfreqIndices[i];
            }
            if (p1 !== undefined)
                variableAbsIndices[3*nBus] = parseInt(p1);
            if (p2 !== undefined)
                variableAbsIndices[3*nBus + 1] = parseInt(p2);
            if (p3 !== undefined)
                variableAbsIndices[3*nBus + 2] = parseInt(p3);

            // Build internal idx list
            variableRelIndices["V"] = {"begin": 0, "end": nBus};
            variableRelIndices["theta"] = {"begin": nBus, "end": 2 * nBus};
            variableRelIndices["freq"] = {"begin": 2 * nBus, "end": 3 * nBus};

            // Update variable Range
            contourLayer.storeRelativeIndices(variableRelIndices);
            contourLayer.showVariable("freq");
            contourLayer.updateRange(0.9998, 1.0002);

            dimec.send_var('sim', dimec_name, {
                vgsvaridx: {
                    ndarray: true,
                    shape: [1, variableAbsIndices.length],
                    data: base64arraybuffer.encode(variableAbsIndices.buffer),
                },
            }
            );
            sentHeader = true;

        } else if (name === 'DONE') {
            dimec.close();
            console.timeEnd(map_name);
        }

    }
    })();

    return [map, layers];

}

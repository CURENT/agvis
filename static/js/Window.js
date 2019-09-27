function CreateWindow(map_name, dimec, dimec_name){

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

    const tileLayer = L.tileLayer(TILE_LAYER_URL)
        .addTo(map);
    const topologyLayer = L.topologyLayer()
        .addTo(map);

    const contourLayer = L.contourLayer()
        .addTo(map);

    const communicationLayer = L.communicationLayer()
        .addTo(map);

    const simTimeBox = L.simTimeBox({ position: 'topright'  })
        .addTo(map);

    const lineSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "description": "Voltage on Bus 0 Plot",
    "data": {"name": "table"},
    "mark": "line",
    "encoding": {
        "x": {"field": "t", "type": "quantitative"},
        "y": {"field": "voltage", "type": "quantitative"}
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

    var panelContent = {
        id: 'userinfo',                     // UID, used to access the panel
        tab: '<i class="fa fa-line-chart"></i>',  // content can be passed as HTML string,
        pane: '<div id="' + visPlotName + '"></div>',        // DOM elements can be passed, too
        title: 'Plot Tool',              // an optional pane header
        position: 'top'                  // optional vertical alignment, defaults to 'top'
    };
    sidebar.addPanel(panelContent);

    /* add an external link */
    sidebar.addPanel({
        id: 'ghlink',
        tab: '<i class="fa fa-github"></i>',
        button: 'https://github.com/nickpeihl/leaflet-sidebar-v2',
    });

    /* add a button with click listener */
    sidebar.addPanel({
        id: 'click',
        tab: '<i class="fa fa-info"></i>',
        button: function (event) { console.log(event); }
    });

    function doTheThing(workspace, history, currentTimeInSeconds, varname) {
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
        const { view } = await vegaEmbed('#' + map_name + 'Vis', lineSpec, {defaultStyle: true})
        workspace.view = view;
        
        let firstTime = null;
        function step(currentTime) {
            requestAnimationFrame(step);
            if (firstTime === null) {
                firstTime = currentTime;
                return;
            }
            workspace.currentTimeInSeconds = (currentTime - firstTime) / 1000.0;

            // get data from history, update contour, simulation time, and plots
            ready = doTheThing(workspace, history, workspace.currentTimeInSeconds, 'Varvgs');
            if (!ready) return;

            topologyLayer.update(workspace);
            contourLayer.update(workspace);
            communicationLayer.update(workspace);
            if (workspace.Varvgs){
                simTimeBox.update(workspace.Varvgs.t.toFixed(2));
                view.insert("table", {"t": workspace.Varvgs.t, "voltage": workspace.Varvgs.vars.get(0, plot1Index) }).run();
            }
        }
        function reset() {
            firstTime = null;
            // view.insert("table", {"t": workspace.Varvgs.t, "voltage": workspace.Varvgs.vars.get(0, plot1Index) }).run();
        }
        requestAnimationFrame(step);
        return reset;
    }

    (async () => {

    const resetTime = await updateThread(workspace);
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
        contourLayer.updateRange(0.9995, 1.0005);
    });

    const avfButtons= [thetaButton, voltageButton, freqButton];
    const avfBar = L.easyBar(avfButtons).addTo(map);

    // Plot selector Dialog
    const plotSelector = L.control.dialog({"initOpen": false})
        .setContent("<p>Hello! Welcome to your nice new dialog box!</p>")
        .addTo(map);

    const plotButton = L.easyButton('<span><i>p</i></span>', function(btn, map){
        if (plotOpen == false) {
            plotSelector.open();
            plotOpen = true;
        } else {
            plotSelector.close();
            plotOpen = false;
        }

    }).addTo(map);

    const resetButton = L.easyButton('<span><i>R</i></span>', function(btn, map){
        resetTime();
    }).addTo(map);


    await dimec.ready;
    console.time(map_name);

    // plot

    let sentHeader = false;

    for (;;) {
        const { name, value } = await dimec.sync();
        workspace[name] = value;

        if (!history[name]) history[name] = [];
        history[name].push(value);

        if (name !== 'Varvgs')
            console.log({ name, value });

        if (!sentHeader && name === 'Idxvgs') {
            const busVoltageIndices = workspace.Idxvgs.Bus.V.typedArray;
            const busThetaIndices = workspace.Idxvgs.Bus.theta.typedArray;
            const busfreqIndices= workspace.Idxvgs.Bus.w_Busfreq.typedArray;

            const nBus = busVoltageIndices.length;

            // Build the idx list for simulator
            const variableAbsIndices = new Float64Array(nBus * 3);
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

            // Build internal idx list
            variableRelIndices["V"] = {"begin": 0, "end": nBus};
            variableRelIndices["theta"] = {"begin": nBus, "end": 2 * nBus};
            variableRelIndices["freq"] = {"begin": 2 * nBus, "end": 3 * nBus};

            // Update variable Range
            contourLayer.storeRelativeIndices(variableRelIndices);
            contourLayer.showVariable("freq");
            contourLayer.updateRange(0.9995, 1.0005);

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

    return map;

}

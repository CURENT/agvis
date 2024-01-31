/* ****************************************************************************************
 * File Name:   ConfigControl.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/16/2023 (last modified)
 * 
 * Description: This file sets up the configuration control menu sidebar. The config menu 
 *              is used to select the view state (what variable to show) of the contour 
 *              layer. It creates custom Timestamps for the SimTimeBox, can change DiME 
 *              server settings, change graphical settings, and save/load configurations 
 *              and simulations.
 * 
 * Note:        Saving/loading configurations and simulations from the config control menu
 *              differs from the functionality of the Multilater and IDR.
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/config.html
 * ****************************************************************************************/

// HTML for Configuration Control UI
const table_html = `
<table style="width: 100%;">
    <tr>
        <td>DiME hostname/port</td>
        <td style="white-space: nowrap;"><input type="text" name="opt_dimehost" size="9"> : <input type="text" name="opt_dimeport" pattern="[0-9]*(\.[0-9]*)?" size="5"></td>
    </tr>
    <tr>
        <td><span name="opt_alabel">V Angle (rad) min/max</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_amin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_amax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><span name="opt_vlabel">V Magnitude (p.u.) min/max</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_vmin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_vmax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><span name="opt_flabel">Frequency (p.u.) min/max</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_fmin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_fmax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><span name="opt_flabel">Edge opacity</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_opacity" pattern="[01]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><label for="opt_togglehandshake">Toggle Handshake</label></td>
        <td><input type="checkbox" name="opt_togglehandshake" checked></td>
    </tr>
    <tr>
        <td><label for="opt_togglezones">Toggle Zones</label></td>
        <td><input type="checkbox" name="opt_togglezones" checked></td>
    </tr>
    <tr>
        <td><label for="opt_togglebuslabels">Toggle Bus Labels</label></td>
        <td><input type="checkbox" name="opt_togglebuslabels"></td>
    </tr>
</table>
<div>
    <input type="button" value="Load config" name="opt_loadconfig">
    <input type="button" value="Save config" name="opt_saveconfig">
</div>
<div>
    <input type="button" value="Load simulation" name="opt_loadsimulation">
    <input type="button" value="Save simulation" name="opt_savesimulation">
</div>

<hr>
<h3>Timestamp Settings</h3>

<div>
    <label for="ny">Use Timestamp?</label>
    <select name="ny" id="ny">
        <option select="selected" value="No">No</option>
        <option value="Yes">Yes</option>
    </select>
    
</div>
<div>
    <label for="ts_date">Select a Date:</label>
    <input type="date" id="ts_date" name="ts_date">
</div>

<div>
    <label for="ts_time">Select a Time:</label>
    <input type="time" id="ts_time" value="00:00:00" name="ts_time">
</div>

<div>
    <label for="ts_inc">Select an Increment:</label>
    <select name="ts_inc" id="ts_inc">
        <option select="selected" value="ms">Milliseconds</option>
        <option value="s">Seconds</option>
        <option value="min">Minutes</option>
        <option value="h">Hours</option>
        <option value="day">Days</option>
    </select>
    <br>
    
    <label for="ts_num">Number of Increments per Second:</label>
    <input type="number" id="ts_num" name="ts_num" value="1" min="0" step="1">
</div>

<div>
</div>
<div>
    <label for="ts_up">Update Settings?</label>
    <input type="button" value="Update" id="ts_up" name="ts_up">
</div>
`

const SIDEBAR_CALLBACKS = [];

/**
 * Contains the info for a DiME server address. Used when changing what DiME server AGVis is connected to.
 * 
 * @param {Object} host
 * @param {Object} port
 * @returns
 */
class DimeInfo {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        Object.freeze(this);
    }
}

/**
 * Sets up all of the event funciton for the UI elements in table_html.
 * 
 * @param   {Window} win      - The current AGVis window 
 * @param   {Object} options  - Initial settings for several variables throughout AGVis. Presets input elements
 * @param   {Object} sidebar  - The sidebar containing the configuration menu
 * @returns {String}          - A string containing the element id of the configuration panel
 */
function addSidebarConfig(win, options, sidebar) {
    const table_id = "configpanel" + win.num;

    // Add the configuration control menu to the sidebar
    sidebar.addPanel({
        id: table_id,
        tab: '<span>\u2699</span>',
        pane: table_html,
        title: 'Configuration settings'
    });

    const opt_dimehost        = document.querySelector(`#${table_id} input[name='opt_dimehost']`);
    const opt_dimeport        = document.querySelector(`#${table_id} input[name='opt_dimeport']`);
    const opt_amin            = document.querySelector(`#${table_id} input[name='opt_amin']`);
    const opt_amax            = document.querySelector(`#${table_id} input[name='opt_amax']`);
    const opt_vmin            = document.querySelector(`#${table_id} input[name='opt_vmin']`);
    const opt_vmax            = document.querySelector(`#${table_id} input[name='opt_vmax']`);
    const opt_fmin            = document.querySelector(`#${table_id} input[name='opt_fmin']`);
    const opt_fmax            = document.querySelector(`#${table_id} input[name='opt_fmax']`);
    const opt_opacity         = document.querySelector(`#${table_id} input[name='opt_opacity']`);
    const opt_togglezones     = document.querySelector(`#${table_id} input[name='opt_togglezones']`);
    const opt_togglebuslabels = document.querySelector(`#${table_id} input[name='opt_togglebuslabels']`);
    const opt_loadconfig      = document.querySelector(`#${table_id} input[name='opt_loadconfig']`);
    const opt_saveconfig      = document.querySelector(`#${table_id} input[name='opt_saveconfig']`);
    const opt_loadsimulation  = document.querySelector(`#${table_id} input[name='opt_loadsimulation']`);
    const opt_savesimulation  = document.querySelector(`#${table_id} input[name='opt_savesimulation']`);
    const opt_alabel          = document.querySelector(`#${table_id} span[name='opt_alabel']`);
    const opt_vlabel          = document.querySelector(`#${table_id} span[name='opt_vlabel']`);
    const opt_flabel          = document.querySelector(`#${table_id} span[name='opt_flabel']`);
    const ts_up               = document.querySelector(`#${table_id} input[name='ts_up']`);
    
    /**
     * Verifies the custom Timestamp settings are properly formatted and updates the simTimeBox.
     * 
     * @returns 
     */
    ts_up.onclick = function() {
    
        let dval = document.getElementById("ts_date").value;
        let nval = Number(document.getElementById("ts_num").value);
        let yval = document.getElementById("ny").value;
        let tval = document.getElementById("ts_time").value;
    
        //If the Timestamp isn't being used, don't bother checking for good inputs
        if (yval === "No") {
            //The Timestamp is updated based on where in the simulation the timer is on.
            if (win.workspace.Vargs) {
                win.simTimeBox.update(win.workspace.Varvgs.t.toFixed(2));
            }
        
            //If there is no simulation, set it to 0.
            else {
                win.simTimeBox.update(0.00);
            }
        }
        
        else {
            //Make sure all fully user provided inputs are proper. If not, throw an alert.
            if ((dval == "") || (nval < 0) || (!(Number.isFinite(nval))) || (tval == "")) {
                alert("Please set all inputs properly before trying to update.");
                return;
            }

            if (win.workspace.Vargs) {
                win.simTimeBox.update(win.workspace.Varvgs.t.toFixed(2));
            }
        
            else {
                win.simTimeBox.update(0.00);
            }
        
        }

    };
    
    /**
     * Sets all of the values for the inputs based off their values in the options object
     * 
     * @returns
     */
    function updateInputs() {
        if ("dimehost" in options) {
            opt_dimehost.value = options.dimehost;
        }

        if ("dimeport" in options) {
            opt_dimeport.value = options.dimeport;
        }

        if ("amin" in options) {
            opt_amin.value = options.amin;
        }

        if ("amax" in options) {
            opt_amax.value = options.amax;
        }

        if ("vmin" in options) {
            opt_vmin.value = options.vmin;
        }

        if ("vmax" in options) {
            opt_vmax.value = options.vmax;
        }

        if ("fmin" in options) {
            opt_fmin.value = options.fmin;
        }

        if ("fmax" in options) {
            opt_fmax.value = options.fmax;
        }

        if ("opacity" in options) {
            opt_opacity.value = options.opacity;
        }

        if ("togglezones" in options) { // TODO
            opt_togglezones.checked = options.togglezones;
        }

        if ("togglebuslabels" in options) {
            opt_togglebuslabels.checked = options.togglebuslabels;
        }

        if ("alabel" in options) {
            opt_alabel.innerHTML = options.alabel + " min/max";
        }

        if ("vlabel" in options) {
            opt_vlabel.innerHTML = options.vlabel + " min/max";
        }

        if ("flabel" in options) {
            opt_flabel.innerHTML = options.flabel + " min/max";
        }
    };

    /**
     * Handles setting up a new connection to a DiME server when a user changes the host or port number.
     * 
     * @memberof Window
     * @returns
     */
    win.dime_updated = function() {
        return new Promise(function(resolve, reject) {
            let callback = function() {
                const host = opt_dimehost.value;
                const port = Number(opt_dimeport.value);

                if (port === port) {
                    options.dimehost = host;
                    options.dimeport = port;

                    let dt = new Date();
                    dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
                    dt = dt.toUTCString();

                    document.cookie = `dimehost${win.num}=${host};expires=${dt};path=/`;
                    document.cookie = `dimeport${win.num}=${port};expires=${dt};path=/`;

                    resolve(new DimeInfo(host, port));
                }
            };

            opt_dimehost.oninput = callback;
            opt_dimeport.oninput = callback;
        });
    };

    // ===================================================
    // Update ContourLayer’s view state variable
    // ===================================================

    /**
     * Updates the minimum range for the ContourLayer’s voltage angle variable.
     * 
     * @returns
     */
    opt_amin.oninput = function() {
        const val = Number(opt_amin.value);

        if (val === val) {
            options.amin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amin${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "theta") {
                win.contourLayer.updateRange(options.amin, options.amax);
            }

            win.legend.update();
        }
    }

    /**
     * Updates the maximum range for the ContourLayer’s voltage angle variable.
     * 
     * @returns
     */
    opt_amax.oninput = function() {
        const val = Number(opt_amax.value);

        if (val === val) {
            options.amax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amax${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "theta") {
                win.contourLayer.updateRange(options.amax, options.amax);
            }

            win.legend.update();
        }
    };

    /**
     * Updates the minimum range for the ContourLayer’s voltage magnitude variable.
     * 
     * @returns
     */
    opt_vmin.oninput = function() {
        const val = Number(opt_vmin.value);

        if (val === val) {
            options.vmin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmin${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "V") {
                win.contourLayer.updateRange(options.vmin, options.vmax);
            }

            win.legend.update();
        }
    };

    /**
     * Updates the maximum range for the ContourLayer’s voltage magnitude variable.
     * 
     * @returns
     */
    opt_vmax.oninput = function() {
        const val = Number(opt_vmax.value);

        if (val === val) {
            options.vmax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmax${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "V") {
                win.contourLayer.updateRange(options.vmin, options.vmax);
            }

            win.legend.update();
        }
    }

    /**
     * Updates the minimum range for the ContourLayer’s voltage frequency variable.
     * 
     * @returns
     */
    opt_fmin.oninput = function() {
        const val = Number(opt_fmin.value);

        if (val === val) {
            options.fmin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmin${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "freq") {
                win.contourLayer.updateRange(options.fmin, options.fmax);
            }

            win.legend.update();
        }
    };

    /**
     * Updates the maximum range for the ContourLayer’s voltage frequency variable.
     * 
     * @returns
     */
    opt_fmax.oninput = function() {
        const val = Number(opt_fmax.value);

        if (val === val) {
            options.fmax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmax${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "freq") {
                win.contourLayer.updateRange(options.fmin, options.fmax);
            }

            win.legend.update();
        }
    };

    /**
     * Updates TopologyLayer's opacity value for drawing lines.
     * 
     * @returns
     */
    opt_opacity.oninput = function() {
        const val = Number(opt_opacity.value);

        if (val === val) {
            options.opacity = val;

            win.topologyLayer._opacity = val;
            win.topologyLayer.redraw();

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `opacity${win.num}=${val};expires=${dt};path=/`;
        }
    };

    /**
     * Turns on and off the rendering of the ZoneLayer.
     * 
     * @returns
     */
    opt_togglezones.onclick = function() {
        win.zoneLayer.toggleRender();

        const val = win.zoneLayer._render;

        opt_togglezones.checked = val;
        options.togglezones = val;

        let dt = new Date();
        dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
        dt = dt.toUTCString();

        document.cookie = `togglezones${win.num}=${val};expires=${dt};path=/`;
    };

    /**
     * Turns on and off whether TopologyLayer includes the node labels.
     * 
     * @returns
     */
    opt_togglebuslabels.onclick = function() {
        const val = opt_togglebuslabels.checked;

        win.topologyLayer._render_bus_ids = val;
        win.topologyLayer.redraw();
        options.togglebuslabels = val;

        let dt = new Date();
        dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
        dt = dt.toUTCString();

        document.cookie = `togglebuslabels${win.num}=${val};expires=${dt};path=/`;
    };

    const opt_loadconfig_input = document.createElement("input");

    opt_loadconfig_input.style.display = "none";
    opt_loadconfig_input.type = "file";
    document.body.appendChild(opt_loadconfig_input);

    /**
     * Loads in and reads a simulation file from the user. The Window sets the history and workspace from the
     * file, then immediately begins and ends a simulation to set up the UI.
     * 
     * @returns
     */
    opt_loadconfig_input.onchange = function() {
        if (opt_loadconfig_input.files.length > 0) {
            let fr = new FileReader();

            fr.onload = function(file) {
                let newoptions = JSON.parse(file.target.result);
                Object.assign(options, newoptions);

                for (let func of SIDEBAR_CALLBACKS) {
                    func();
                }
            }

            fr.readAsText(opt_loadconfig_input.files[0]);
        }
    };

    /**
     * Click event for load config. Doesn't do much.
     * 
     * @returns
     */
    opt_loadconfig.onclick = function() {
        opt_loadconfig_input.click();
    };

    const opt_saveconfig_a = document.createElement("a");

    opt_saveconfig_a.style.display = "none";
    document.body.appendChild(opt_saveconfig_a);

    /**
     * Downloads a JSON configuration file from the current settings.
     * 
     * @returns
     */
    opt_saveconfig.onclick = function() {
        let json = JSON.stringify(options);
        let blob = new Blob([json], {type: "application/json"});

        opt_saveconfig_a.href = win.URL.createObjectURL(blob);
        opt_saveconfig_a.download = "ltbvis_config.json";

        opt_saveconfig_a.click();
    }

    const opt_loadsimulation_input = document.createElement("input");

    opt_loadsimulation_input.id = "opt_loadsimulation_input";
    opt_loadsimulation_input.style.display = "none";
    opt_loadsimulation_input.type = "file";
    document.body.appendChild(opt_loadsimulation_input);

    /**
     * Loads in and reads a simulation file from the user. The Window sets the history and workspace
     * from the file, then immediately begins and ends a simulation to set up the UI.
     * 
     * @returns
     */
    opt_loadsimulation_input.onchange = function() {
        if (opt_loadsimulation_input.files.length > 0) {
            let fr = new FileReader();

            fr.onload = function(file) {
                win.load(file.target.result);
                win.startSimulation();
                win.endSimulation();
            }

            fr.readAsArrayBuffer(opt_loadsimulation_input.files[0]);
        }
    };

    opt_loadsimulation.onclick = function() {
        opt_loadsimulation_input.click();
    };

    const opt_savesimulation_a = document.createElement("a");

    opt_savesimulation_a.style.display = "none";
    document.body.appendChild(opt_savesimulation_a);

    /**
     * Downloads a simulation file containing the information on the workspace and history of
     * the current simulation.
     * 
     * @returns
     */
    opt_savesimulation.onclick = function() {
        let blob = new Blob([win.save()]);

        opt_savesimulation_a.href = window.URL.createObjectURL(blob);
        opt_savesimulation_a.download = "ltbvis_history.dimeb";

        opt_savesimulation_a.click();
    }

    updateInputs();
    SIDEBAR_CALLBACKS.push(updateInputs);

    return table_id;
}

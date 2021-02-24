const table_html = `
<table style="width: 100%;">
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
`

const SIDEBAR_CALLBACKS = [];

function addSidebarConfig(win, options, sidebar) {
    const table_id = "configpanel" + win.num;

    sidebar.addPanel({
        id: table_id,
        tab: '<span>\u2699</span>',
        pane: table_html,
        title: 'Configuration settings'

    });

    const opt_amin = document.querySelector(`#${table_id} input[name='opt_amin']`);
    const opt_amax = document.querySelector(`#${table_id} input[name='opt_amax']`);
    const opt_vmin = document.querySelector(`#${table_id} input[name='opt_vmin']`);
    const opt_vmax = document.querySelector(`#${table_id} input[name='opt_vmax']`);
    const opt_fmin = document.querySelector(`#${table_id} input[name='opt_fmin']`);
    const opt_fmax = document.querySelector(`#${table_id} input[name='opt_fmax']`);
    const opt_togglezones = document.querySelector(`#${table_id} input[name='opt_togglezones']`);
    const opt_togglebuslabels = document.querySelector(`#${table_id} input[name='opt_togglebuslabels']`);

    const opt_loadconfig = document.querySelector(`#${table_id} input[name='opt_loadconfig']`);
    const opt_saveconfig = document.querySelector(`#${table_id} input[name='opt_saveconfig']`);
    const opt_loadsimulation = document.querySelector(`#${table_id} input[name='opt_loadsimulation']`);
    const opt_savesimulation = document.querySelector(`#${table_id} input[name='opt_savesimulation']`);

    const opt_alabel = document.querySelector(`#${table_id} span[name='opt_alabel']`);
    const opt_vlabel = document.querySelector(`#${table_id} span[name='opt_vlabel']`);
    const opt_flabel = document.querySelector(`#${table_id} span[name='opt_flabel']`);

    function updateInputs() {
        if ("amin" + win.num in options) {
            opt_amin.value = options["amin" + win.num];
        }

        if ("amax" + win.num in options) {
            opt_amax.value = options["amax" + win.num];
        }

        if ("vmin" + win.num in options) {
            opt_vmin.value = options["vmin" + win.num];
        }

        if ("vmax" + win.num in options) {
            opt_vmax.value = options["vmax" + win.num];
        }

        if ("fmin" + win.num in options) {
            opt_fmin.value = options["fmin" + win.num];
        }

        if ("fmax" + win.num in options) {
            opt_fmax.value = options["fmax" + win.num];
        }

        if ("togglezones" + win.num in options) { // TODO
            opt_togglezones.checked = options["togglezones" + win.num];
        }

        if ("togglebuslabels" + win.num in options) {
            opt_togglebuslabels.checked = options["togglebuslabels" + win.num];
        }

        if ("alabel" + win.num in options) {
            opt_alabel.innerHTML = options["alabel" + win.num] + " min/max";
        }

        if ("vlabel" + win.num in options) {
            opt_vlabel.innerHTML = options["vlabel" + win.num] + " min/max";
        }

        if ("flabel" + win.num in options) {
            opt_flabel.innerHTML = options["flabel" + win.num] + " min/max";
        }
    };

    opt_amin.oninput = function() {
        const val = Number(opt_amin.value);

        if (val === val) {
            options["amin" + win.num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amin${num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "theta") {
                win.contourLayer.updateRange(options["amin" + win.num], options["amax" + win.num]);
            }
        }
    }

    opt_amax.oninput = function() {
        const val = Number(opt_amax.value);

        if (val === val) {
            options["amax" + win.num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amax${num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "theta") {
                win.contourLayer.updateRange(options["amax" + win.num], options["amax" + win.num]);
            }
        }
    };

    opt_vmin.oninput = function() {
        const val = Number(opt_vmin.value);

        if (val === val) {
            options["vmin" + win.num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmin${num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "V") {
                win.contourLayer.updateRange(options["vmin" + win.num], options["vmax" + win.num]);
            }
        }
    };

    opt_vmax.oninput = function() {
        const val = Number(opt_vmax.value);

        if (val === val) {
            options["vmax" + win.num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmax${num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "V") {
                win.contourLayer.updateRange(options["vmin" + win.num], options["vmax" + win.num]);
            }
        }
    }

    opt_fmin.oninput = function() {
        const val = Number(opt_fmin.value);

        if (val === val) {
            options["fmin" + win.num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmin${num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "freq") {
                win.contourLayer.updateRange(options["fmin" + win.num], options["fmax" + win.num]);
            }
        }
    };

    opt_fmax.oninput = function() {
        const val = Number(opt_fmax.value);

        if (val === val) {
            options["fmax" + win.num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmax${num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "freq") {
                win.contourLayer.updateRange(options["fmin" + win.num], options["fmax" + win.num]);
            }
        }
    };

    opt_togglezones.onclick = function() {
        win.zoneLayer.toggleRender();

        const val = win.zoneLayer._render;

        opt_togglezones.checked = val;
        options["togglezones" + win.num] = val;

        let dt = new Date();
        dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
        dt = dt.toUTCString();

        document.cookie = `togglezones${num}=${val};expires=${dt};path=/`;
    };

    opt_togglebuslabels.onclick = function() {
        const val = opt_togglebuslabels.checked;

        win.topologyLayer._render_bus_ids = val;
        win.topologyLayer.redraw();
        options["togglebuslabels" + win.num] = val;

        let dt = new Date();
        dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
        dt = dt.toUTCString();

        document.cookie = `togglebuslabels${num}=${val};expires=${dt};path=/`;
    };

    const opt_loadconfig_input = document.createElement("input");

    opt_loadconfig_input.style.display = "none";
    opt_loadconfig_input.type = "file";
    document.body.appendChild(opt_loadconfig_input);

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

    opt_loadconfig.onclick = function() {
        opt_loadconfig_input.click();
    };

    const opt_saveconfig_a = document.createElement("a");

    opt_saveconfig_a.style.display = "none";
    document.body.appendChild(opt_saveconfig_a);

    opt_saveconfig.onclick = function() {
        let json = JSON.stringify(options);
        let blob = new Blob([json], {type: "application/json"});

        opt_saveconfig_a.href = win.URL.createObjectURL(blob);
        opt_saveconfig_a.download = "ltbvis_config.json";

        opt_saveconfig_a.click();
    }

    const opt_loadsimulation_input = document.createElement("input");

    opt_loadsimulation_input.style.display = "none";
    opt_loadsimulation_input.type = "file";
    document.body.appendChild(opt_loadsimulation_input);

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

    opt_savesimulation.onclick = function() {
        let blob = new Blob([win.save()], {type: "application/json"});

        opt_savesimulation_a.href = window.URL.createObjectURL(blob);
        opt_savesimulation_a.download = "ltbvis_history.json";

        opt_savesimulation_a.click();
    }

    updateInputs();
    SIDEBAR_CALLBACKS.push(updateInputs);

    return table_id;
}

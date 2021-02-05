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
    <input type="button" value="Load history" name="opt_loadhistory">
    <input type="button" value="Save history" name="opt_savehistory">
</div>
`

const SIDEBAR_CALLBACKS = [];

function addSidebarConfig(num, options, map, layers, sidebar, workspace, history) {
    const table_id = "configpanel" + num;

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
    const opt_loadhistory = document.querySelector(`#${table_id} input[name='opt_loadhistory']`);
    const opt_savehistory = document.querySelector(`#${table_id} input[name='opt_savehistory']`);

    const opt_alabel = document.querySelector(`#${table_id} span[name='opt_alabel']`);
    const opt_vlabel = document.querySelector(`#${table_id} span[name='opt_vlabel']`);
    const opt_flabel = document.querySelector(`#${table_id} span[name='opt_flabel']`);

    function updateInputs() {
        if ("amin" + num in options) {
            opt_amin.value = options["amin" + num];
        }

        if ("amax" + num in options) {
            opt_amax.value = options["amax" + num];
        }

        if ("vmin" + num in options) {
            opt_vmin.value = options["vmin" + num];
        }

        if ("vmax" + num in options) {
            opt_vmax.value = options["vmax" + num];
        }

        if ("fmin" + num in options) {
            opt_fmin.value = options["fmin" + num];
        }

        if ("fmax" + num in options) {
            opt_fmax.value = options["fmax" + num];
        }

        if ("togglezones" + num in options) { // TODO
            opt_togglezones.checked = options["togglezones" + num];
        }

        if ("togglebuslabels" + num in options) {
            opt_togglebuslabels.checked = options["togglebuslabels" + num];
        }

        if ("alabel" + num in options) {
            opt_alabel.innerHTML = options["alabel" + num] + " min/max";
        }

        if ("vlabel" + num in options) {
            opt_vlabel.innerHTML = options["vlabel" + num] + " min/max";
        }

        if ("flabel" + num in options) {
            opt_flabel.innerHTML = options["flabel" + num] + " min/max";
        }
    };

    opt_amin.oninput = function() {
        const val = Number(opt_amin.value);

        if (val === val) {
            options["amin" + num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amin${num}=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "theta") {
                layers.contourLayer.updateRange(options["amin" + num], options["amax" + num]);
            }
        }
    }

    opt_amax.oninput = function() {
        const val = Number(opt_amax.value);

        if (val === val) {
            options["amax" + num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amax${num}=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "theta") {
                layers.contourLayer.updateRange(options["amax" + num], options["amax" + num]);
            }
        }
    };

    opt_vmin.oninput = function() {
        const val = Number(opt_vmin.value);

        if (val === val) {
            options["vmin" + num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmin${num}=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "V") {
                layers.contourLayer.updateRange(options["vmin" + num], options["vmax" + num]);
            }
        }
    };

    opt_vmax.oninput = function() {
        const val = Number(opt_vmax.value);

        if (val === val) {
            options["vmax" + num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmax${num}=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "V") {
                layers.contourLayer.updateRange(options["vmin" + num], options["vmax" + num]);
            }
        }
    }

    opt_fmin.oninput = function() {
        const val = Number(opt_fmin.value);

        if (val === val) {
            options["fmin" + num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmin${num}=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "freq") {
                layers.contourLayer.updateRange(options["fmin" + num], options["fmax" + num]);
            }
        }
    };

    opt_fmax.oninput = function() {
        const val = Number(opt_fmax.value);

        if (val === val) {
            options["fmax" + num] = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmax${num}=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "freq") {
                layers.contourLayer.updateRange(options["fmin" + num], options["fmax" + num]);
            }
        }
    };

    opt_togglezones.onclick = function() {
        layers.zoneLayer.toggleRender();

        const val = layers.zoneLayer._render;

        opt_togglezones.checked = val;
        options["togglezones" + num] = val;

        let dt = new Date();
        dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
        dt = dt.toUTCString();

        document.cookie = `togglezones${num}=${val};expires=${dt};path=/`;
    };

    opt_togglebuslabels.onclick = function() {
        const val = opt_togglebuslabels.checked;

        layers.topologyLayer._render_bus_ids = val;
        layers.topologyLayer.redraw();
        options["togglebuslabels" + num] = val;

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

        opt_saveconfig_a.href = window.URL.createObjectURL(blob);
        opt_saveconfig_a.download = "ltbvis_config.json";

        opt_saveconfig_a.click();
    }

    const opt_loadhistory_input = document.createElement("input");

    opt_loadhistory_input.style.display = "none";
    opt_loadhistory_input.type = "file";
    document.body.appendChild(opt_loadhistory_input);

    opt_loadhistory_input.onchange = function() {
        if (opt_loadhistory_input.files.length > 0) {
            let fr = new FileReader();

            fr.onload = function(file) {
                let data = dime.dimebloads(file.target.result);

                for (let k in workspace) delete workspace[k];
                Object.assign(workspace, data.workspace);

                for (let k in history) delete history[k];
                Object.assign(history, data.history);
            }

            fr.readAsArrayBuffer(opt_loadhistory_input.files[0]);
        }
    };

    opt_loadhistory.onclick = function() {
        opt_loadhistory_input.click();
    };

    const opt_savehistory_a = document.createElement("a");

    opt_savehistory_a.style.display = "none";
    document.body.appendChild(opt_savehistory_a);

    opt_savehistory.onclick = function() {
        let json = dime.dimebdumps({history, workspace});
        let blob = new Blob([json]);

        opt_savehistory_a.href = window.URL.createObjectURL(blob);
        opt_savehistory_a.download = "ltbvis_history.dimeb";

        opt_savehistory_a.click();
    }

    updateInputs();
    SIDEBAR_CALLBACKS.push(updateInputs);

    return table_id;
}

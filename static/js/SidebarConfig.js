const table_html = `
<table style="width: 100%;">
    <tr>
        <td>V Angle (rad) min/max</td>
        <td style="white-space: nowrap;"><input type="text" name="opt_amin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_amax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td>V Magnitude (p.u.) min/max</td>
        <td style="white-space: nowrap;"><input type="text" name="opt_vmin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_vmax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td>Frequency (p.u.) min/max</td>
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
`

function addSidebarConfig(num, options, map, layers, sidebar) {
    const table_id = "configpanel" + num;

    sidebar.addPanel({
        id: table_id,
        tab: '<span>\u2699</span>',
        pane: table_html,
        title: 'Configuration settings'

    });

    const opt_amin = document.querySelector(`#${table_id} input[name='opt_amin']`);

    opt_amin.value = options["amin" + num];
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

    const opt_amax = document.querySelector(`#${table_id} input[name='opt_amax']`);

    opt_amax.value = options["amax" + num];
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

    const opt_vmin = document.querySelector(`#${table_id} input[name='opt_vmin']`);

    opt_vmin.value = options["vmin" + num];
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

    const opt_vmax = document.querySelector(`#${table_id} input[name='opt_vmax']`);

    opt_vmax.value = options["vmax" + num];
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

    const opt_fmin = document.querySelector(`#${table_id} input[name='opt_fmin']`);

    opt_fmin.value = options["fmin" + num];
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

    const opt_fmax = document.querySelector(`#${table_id} input[name='opt_fmax']`);

    opt_fmax.value = options["fmax" + num];
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

    const opt_togglezones = document.querySelector(`#${table_id} input[name='opt_togglezones']`);

    opt_togglezones.onclick = function() {
        layers.zoneLayer.toggleRender();
        opt_togglezones.checked = layers1.zoneLayer._render;
    };

    const opt_togglebuslabels = document.querySelector(`#${table_id} input[name='opt_togglebuslabels']`);

    opt_togglebuslabels.onclick = function() {
        layers.topologyLayer._render_bus_ids = opt_togglebuslabels.checked;
        layers.topologyLayer.redraw();
    };

    const opt_loadconfig = document.querySelector(`#${table_id} input[name='opt_loadconfig']`);
    const opt_loadconfig_input = document.createElement("input");

    opt_loadconfig_input.style.display = "none";
    opt_loadconfig_input.type = "file";
    document.body.appendChild(opt_loadconfig_input);

    opt_loadconfig.onclick = function() {
        opt_loadconfig_input.onchange = function() {
            if (opt_loadconfig_input.files.length > 0) {
                let fr = new FileReader();

                fr.onload = function(file) {
                    let newoptions = JSON.parse(file.target.result);
                    Object.assign(options, newoptions);
                }

                fr.readAsText(opt_loadconfig_input.files[0]);
            }
        };

        opt_loadconfig_input.click();
    }

    const opt_saveconfig = document.querySelector(`#${table_id} input[name='opt_saveconfig']`);
    const opt_saveconfig_a = document.createElement("a");

    opt_saveconfig_a.style.display = "none";
    document.body.appendChild(opt_saveconfig_a);

    opt_saveconfig.onclick = function() {
        let json = JSON.stringify(options);
        let blob = new Blob([json], {type: "application/json"});

        opt_saveconfig_a.href = window.URL.createObjectURL(blob);
        opt_saveconfig_a.download = "ltbvis.json";

        opt_saveconfig_a.click();
    }
}

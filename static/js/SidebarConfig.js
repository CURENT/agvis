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
        <td><label for="opt_togglemap2">Toggle 2<sup>nd</sup> Window</label></td>
        <td><input type="checkbox" name="opt_togglemap2"></td>
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
`

function addSidebarConfig(num, options, map, layers, sidebar) {
    // Generate a UUID for the config panel's ID
    table_id = "configpanel" + num;

    sidebar.addPanel({
        id: table_id,
        tab: '<span>\u2699</span>',
        pane: table_html,
        title: 'Configuration settings'

    });

    const opt_amin = document.querySelector(`#${table_id} input[name='opt_amin']`);

    opt_amin.value = options.amin;
    opt_amin.oninput = function() {
        const val = Number(opt_amin.value);

        if (val === val) {
            options.amin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amin=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "theta") {
                layers.contourLayer.updateRange(options.amin, options.amax);
            }
        }
    }

    const opt_amax = document.querySelector(`#${table_id} input[name='opt_amax']`);

    opt_amax.value = options.amax;
    opt_amax.oninput = function() {
        const val = Number(opt_amax.value);

        if (val === val) {
            options.amax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amax=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "theta") {
                layers.contourLayer.updateRange(options.amax, options.amax);
            }
        }
    }

    const opt_vmin = document.querySelector(`#${table_id} input[name='opt_vmin']`);

    opt_vmin.value = options.vmin;
    opt_vmin.oninput = function() {
        const val = Number(opt_vmin.value);

        if (val === val) {
            options.vmin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmin=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "V") {
                layers.contourLayer.updateRange(options.vmin, options.vmax);
            }
        }
    }

    const opt_vmax = document.querySelector(`#${table_id} input[name='opt_vmax']`);

    opt_vmax.value = options.vmax;
    opt_vmax.oninput = function() {
        const val = Number(opt_vmax.value);

        if (val === val) {
            options.vmax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmax=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "V") {
                layers.contourLayer.updateRange(options.vmin, options.vmax);
            }
        }
    }

    const opt_fmin = document.querySelector(`#${table_id} input[name='opt_fmin']`);

    opt_fmin.value = options.fmin;
    opt_fmin.oninput = function() {
        const val = Number(opt_fmin.value);

        if (val === val) {
            options.fmin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmin=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "freq") {
                layers.contourLayer.updateRange(options.fmin, options.fmax);
            }
        }
    }

    const opt_fmax = document.querySelector(`#${table_id} input[name='opt_fmax']`);

    opt_fmax.value = options.fmax;
    opt_fmax.oninput = function() {
        const val = Number(opt_fmax.value);

        if (val === val) {
            options.fmax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmax=${val};expires=${dt};path=/`;

            if (layers.contourLayer.variableName === "freq") {
                layers.contourLayer.updateRange(options.fmin, options.fmax);
            }
        }
    }

    const opt_togglezones = document.querySelector(`#${table_id} input[name='opt_togglezones']`);

    opt_togglezones.onclick = function() {
        layers.zoneLayer.toggleRender();
        opt_togglezones.checked = layers1.zoneLayer._render;
    }

    const opt_togglebuslabels = document.querySelector(`#${table_id} input[name='opt_togglebuslabels']`);

    opt_togglebuslabels.onclick = function() {
        layers.topologyLayer._render_bus_ids = opt_togglebuslabels.checked;
        layers.topologyLayer.redraw();
    }
}

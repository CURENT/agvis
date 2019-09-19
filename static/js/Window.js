function CreateWindow(map_name, dimec, dimec_name){
    let TILE_LAYER_URL = 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamhlcndpZzEiLCJhIjoiY2lrZnB2MnE4MDAyYnR4a2xua3pramprNCJ9.7-wu_YjNrTFsEE0mcUP06A';

    var map = L.map(map_name, {
        minZoom: 3,
        maxZoom: 10,
        center: [40, -100],
        zoom: 5,
    });

    const tileLayer = L.tileLayer(TILE_LAYER_URL)
        .addTo(map);
    const topologyLayer = L.topologyLayer()
        .addTo(map);

    const contourLayer = L.contourLayer()
        .addTo(map);

    const communicationLayer = L.communicationLayer()
        .addTo(map);

    const simTimeBox = L.simTimeBox({ position: 'topright'  }).addTo(map);

    (async () => {

    await dimec.ready;
    console.time(map_name);

    const workspace = {};

    let sentHeader = false;
    for (;;) {
        const { name, value } = await dimec.sync();
        if (name !== 'Varvgs')
            console.log({ name, value });
        workspace[name] = value;

        if (!sentHeader && name === 'Idxvgs') {
            const busVoltageIndices = workspace.Idxvgs.Bus.V.typedArray;
            const indices = new Float64Array(busVoltageIndices.length);
            for (let i=0; i<busVoltageIndices.length; ++i) {
                indices[i] = busVoltageIndices[i];
            }
            sentHeader = true;
            dimec.send_var('sim', dimec_name, {
                vgsvaridx: {
                    ndarray: true,
                    shape: [1, indices.length],
                    data: base64arraybuffer.encode(indices.buffer),
                },
            });

        } else if (name === 'DONE') {
            dimec.close();
            console.timeEnd(map_name);
        }

        topologyLayer.update(workspace);
        contourLayer.update(workspace);
        communicationLayer.update(workspace);
        if (workspace.Varvgs){
            simTimeBox.update(workspace.Varvgs.t.toFixed(2));
        }
    }
    })();

    return map;

}

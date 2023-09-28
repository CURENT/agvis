/* ****************************************************************************************
 * File Name:   CommunicationLayer.js (Deprecated)
 * Authors:     Nicholas West
 * Date:        9/15/2023 (last modified)
 * 
 * Description: It appears that it was originally going to draw substantially more 
 *              lines between points compared to the TopologyLayer. The color and 
 *              curve of these lines would be determined by devices associated with 
 *              the nodes and their capacities for transferring and receiving data. 
 * 
 * Warning:     This file is not in use. It was used to draw the communication layer 
 *              on the map.
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/communication.html
 * ****************************************************************************************/

/**
 * Renders for the CommunicationLayer. It primarily establishes lookup variables for 
 * device locations, device links, and data transfers. After setting up the variables, 
 * the Canvas Context draws lines between each set of linked devices. If then draws 
 * gradient lines between devices that transfer data, with the gradient indicating 
 * which node is the sending node and which is the receiving node. Lastly, it draws 
 * circles at the location of each device, with the color being determined by the 
 * device type.
 * 
 * @param {HTML Canvas Element}     canvas                 - The canvas that the layer will be drawn on.
 * @param {Point}                    size                  - The size of the canvas.
 * @param {LatLngBounds}             bounds                - The bounds of the map.
 * @param {Function}                 project               - The latLngToContainerPoint function specifically for CanvasLayer._map.
 * @param {Boolean}                  needsProjectionUpdate - Determines whether the Layer’s projection needs to be updated.
 * 
 * @var   {Object}                   paramCache            - Caches the locations for the various devices in the CommunciationLayer.
 * @var   {Object}                   varCache              - Caches which devices send and which ones receive, along with how much data was transferred between them.
 * @var   {NDArray}                  pdcPixelCoords        - Stores the location of each PDC device. 
 * @var   {NDArray}                  pmuPixelCoords        - Stores the location of each PMU device.
 * @var   {NDArray}                  switchPixelCoords     - Stores the location of each Switch device. 
 * @var   {NDArray}                  linkPixelCoords       - Stores the connections between the various devices. 
 * @var   {Object}                   transferBytesPerNode  - Keeps track of the location and transfer amount of each node that sends data.
 * @var   {Object}                   receiveBytesPerNode   - Keeps track of the location and transfer amount of each node that receives data. 
 * @var   {NDArray}                  transferPixelCoords   - Stores the data transfers between the various devices. 
 * @var   {CanvasRenderingContext2D} ctx                   - The canvas context used to render the communication lines.
 * 
 * @returns 
 */
function renderCommunication(canvas, { size, bounds, project, needsProjectionUpdate }) {
    const context = this._context;
    if (!context) return;
    const LTBNET_params = context.LTBNET_params;
    if (!LTBNET_params) return;
    const { Link } = LTBNET_params;
    const { Pdc } = LTBNET_params;
    const { Pmu } = LTBNET_params;
    const { Switch } = LTBNET_params;
    const { Hwintf } = LTBNET_params;
    const { Tchwintf } = LTBNET_params;

    const LTBNET_vars = context.LTBNET_vars;
    if (!LTBNET_vars) return;
    const { Transfer } = LTBNET_vars;

    let paramCache = this._cache.get(LTBNET_params);
    if (!paramCache) {
        paramCache = {};
        this._cache.set(LTBNET_params, paramCache);
    }

    let varCache = this._cache.get(LTBNET_vars);
    if(!varCache) {
        varCache = {};
        this._cache.set(LTBNET_vars, varCache);
    }

    let { pdcPixelCoords } = paramCache;
    if (!pdcPixelCoords || needsProjectionUpdate) {
        pdcPixelCoords = paramCache.pdcPixelCoords = new NDArray('C', [Pdc.shape[0], 2]);
        for (let i=0; i<Pdc.shape[0]; ++i) {
            const lat = Pdc.get(i, 0);
            const lng = Pdc.get(i, 1);
            const point = project(L.latLng(lat, lng));
            pdcPixelCoords.set(point.x, i, 0);
            pdcPixelCoords.set(point.y, i, 1);
        }
    }

    let { pmuPixelCoords } = paramCache;
    if (!pmuPixelCoords || needsProjectionUpdate) {
        pmuPixelCoords = paramCache.pmuPixelCoords = new NDArray('C', [Pmu.shape[0], 2]);
        for (let i=0; i<Pmu.shape[0]; ++i) {
            const lat = Pmu.get(i, 0);
            const lng = Pmu.get(i, 1);
            const point = project(L.latLng(lat, lng));
            pmuPixelCoords.set(point.x, i, 0);
            pmuPixelCoords.set(point.y, i, 1);
        }
    }

    let { switchPixelCoords } = paramCache;
    if (!switchPixelCoords || needsProjectionUpdate) {
        switchPixelCoords = paramCache.switchPixelCoords = new NDArray('C', [Switch.shape[0], 2]);
        for (let i=0; i<Switch.shape[0]; ++i) {
            const lat = Switch.get(i, 0);
            const lng = Switch.get(i, 1);
            const point = project(L.latLng(lat, lng));
            switchPixelCoords.set(point.x, i, 0);
            switchPixelCoords.set(point.y, i, 1);
        }
    }

    let { linkPixelCoords } = paramCache;
    if (!linkPixelCoords || needsProjectionUpdate) {
        linkPixelCoords = paramCache.linkPixelCoords = new NDArray('C', [Link.shape[0], 4]);
        for (let i=0; i<Link.shape[0]; ++i) {
            // A link can between two arbitrary devices
            const options = [Switch, Pmu, Pdc, Hwintf, Tchwintf];

            // Get the first device from the list of types
            const fromDevice = options[Link.get(i, 0)];
            // Get the latitude ad longitude for that device
            const fromNodeIndex = Link.get(i, 1);
            lat1 = fromDevice.get(fromNodeIndex, 0);
            lng1 = fromDevice.get(fromNodeIndex, 1);

            // Get the second devices lat and long
            const toDevice = options[Link.get(i, 2)];
            const toNodeIndex = Link.get(i, 3);
            lat2 = toDevice.get(toNodeIndex, 0);
            lng2 = toDevice.get(toNodeIndex, 1);

            // Create the first point
            const point1 = project(L.latLng(lat1, lng1));
            linkPixelCoords.set(point1.x, i, 0);
            linkPixelCoords.set(point1.y, i, 1);

            // Create the second point
            const point2 = project(L.latLng(lat2, lng2));
            linkPixelCoords.set(point2.x, i, 2);
            linkPixelCoords.set(point2.y, i, 3);
        }
    }

    let { transferBytesPerNode } = varCache;
    let { totalTransfer } = varCache;
    if (!transferBytesPerNode || needsProjectionUpdate) {
        transferBytesPerNode = varCache.transferBytesPerNode = {};
        totalTransfer = varCache.totalTransfer = 0;
    }

    let { receiveBytesPerNode } = varCache;
    let { totalReceive } = varCache;
    if (!receiveBytesPerNode || needsProjectionUpdate){
        receiveBytesPerNode = varCache.receiveBytesPerNode = {};
        totalReceive = varCache.totalReceive = 0;
    }

    let { transferPixelCoords } = varCache;
    if (!transferPixelCoords || needsProjectionUpdate) {
        //console.log("Updating tansfer pixels");
        transferPixelCoords = varCache.transferPixelCoords = new NDArray('C', [Transfer.shape[0], 4]);
        for(let i=0; i<Transfer.shape[0]; ++i) {
            const options = [Switch, Pmu, Pdc, Hwintf, Tchwintf];

            let lat1;
            let lng1;
            let lat2;
            let lng2;
            lat1 = lng1 = lat2 = lng2 = 0;

            const fromType = Transfer.get(i, 1);
            const fromDevice = options[fromType];
            const fromNodeIndex = Transfer.get(i, 2);
            lat1 = fromDevice.get(fromNodeIndex, 0);
            lng1 = fromDevice.get(fromNodeIndex, 1);

            const toType = Transfer.get(i, 3);
            const toDevice = options[toType];
            const toNodeIndex = Transfer.get(i, 4);
            lat2 = toDevice.get(toNodeIndex, 0);
            lng2 = toDevice.get(toNodeIndex, 1);

            const point1 = project(L.latLng(lat1, lng1));
            transferPixelCoords.set(point1.x, i, 0);
            transferPixelCoords.set(point1.y, i, 1);

            const point2 = project(L.latLng(lat2, lng2));
            transferPixelCoords.set(point2.x, i, 2);
            transferPixelCoords.set(point2.y, i, 3);

            let transferAmount = Transfer.get(i, 6);
            totalTransfer += transferAmount;
            totalReceive += transferAmount;

            if(typeof transferBytesPerNode[`${fromType},${fromNodeIndex}`] !== 'undefined') {
                transferBytesPerNode[`${fromType},${fromNodeIndex}`][2] += transferAmount;
            } else {
                transferBytesPerNode[`${fromType},${fromNodeIndex}`] = []
                transferBytesPerNode[`${fromType},${fromNodeIndex}`][0] = point1.x;
                transferBytesPerNode[`${fromType},${fromNodeIndex}`][1] = point1.y;
                transferBytesPerNode[`${fromType},${fromNodeIndex}`][2] = transferAmount;
            }

            if(receiveBytesPerNode[`${toType},${toNodeIndex}`]) {
                receiveBytesPerNode[`${toType},${toNodeIndex}`][2] += transferAmount;
            } else {
                receiveBytesPerNode[`${toType},${toNodeIndex}`] = []
                receiveBytesPerNode[`${toType},${toNodeIndex}`][0] = point2.x;
                receiveBytesPerNode[`${toType},${toNodeIndex}`][1] = point2.y;
                receiveBytesPerNode[`${toType},${toNodeIndex}`][2] = transferAmount;
            }
            // We need to save every time, how JavaScript treats "pointers" will make it so the
            // value of the cache is not updated when the underlying data is.
            varCache.totalTransfer = totalTransfer;
            varCache.totalReceive = totalReceive;
        }
        //console.log('end');
    }

    const lineBgColor = "rgba(243, 176, 90, 1)";
    const lineFlowColor000 = "rgba(222,66,91, 0.5)";
    const lineFlowColor025 = "rgba(239,162,103, 0.5)";
    const lineFlowColor050 = "rgba(255,248,187, 0.5)";
    const lineFlowColor075 = "rgba(255,255,248, 0.5)";
    const lineFlowColor100 = "rgba(255,255,255, 0.5)";
    const pdcColor = 'rgba(92, 74, 114, 1)';
    const pmuColor = 'rgba(0, 147, 209, 1.0)';
    const switchColor = 'rgba(244, 106, 78, 1.0)';

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size.x, size.y);

    if (this._render) {

    // Draw links first so they appear under nodes
    ctx.strokeStyle = lineBgColor;
    ctx.fillStyle = lineBgColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 15]);

    for (let i=0; i<Link.shape[0]; ++i){
        const x1 = linkPixelCoords.get(i, 0);
        const y1 = linkPixelCoords.get(i, 1);
        const x2 = linkPixelCoords.get(i, 2);
        const y2 = linkPixelCoords.get(i, 3);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    for(let i=0; i<Transfer.shape[0]; ++i) {
        const x1 = transferPixelCoords.get(i, 0);
        const y1 = transferPixelCoords.get(i, 1);
        const x2 = transferPixelCoords.get(i, 2);
        const y2 = transferPixelCoords.get(i, 3);

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop("0", lineFlowColor000);
        gradient.addColorStop(".25", lineFlowColor025);
        gradient.addColorStop(".50", lineFlowColor050);
        gradient.addColorStop(".75", lineFlowColor075);
        gradient.addColorStop("1", lineFlowColor100);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.fillStyle = pdcColor;
    for (let i=0; i<Pdc.shape[0]; ++i) {
        //break; // For now, skip drawing PDC's
        const x = pdcPixelCoords.get(i, 0);
        const y = pdcPixelCoords.get(i, 1);
        ctx.beginPath();
        ctx.arc(x, y, 3.0, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.fillStyle = pmuColor;
    for (let i=0; i<Pmu.shape[0]; ++i) {
        //break; // For now, skip drawing PMU's
        const x = pmuPixelCoords.get(i, 0);
        const y = pmuPixelCoords.get(i, 1);
        ctx.beginPath();
        ctx.arc(x, y, 3.0, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.fillStyle = switchColor;
    for (let i=0; i<Switch.shape[0]; ++i) {
        const x = switchPixelCoords.get(i, 0);
        const y = switchPixelCoords.get(i, 1);
        ctx.beginPath();
        ctx.arc(x, y, 4.0, 0, 2 * Math.PI);
        ctx.fill();
    }

    let maxTransmission = 0;
    for (let [key, value] of Object.entries(transferBytesPerNode)) {
        let commSize = ((value[2] / totalTransfer)).toPrecision(2);
        if (commSize > maxTransmission) {
            maxTransmission = commSize;
        }
    }

    let maxReception = 0;
    for (let [key, value] of Object.entries(receiveBytesPerNode)) {
        let commSize = ((value[2] / totalReceive)).toPrecision(2);
        if (commSize > maxReception) {
            maxReception = commSize;
        }
    }

    ctx.strokeStyle = 'rgba(222,66,91, 0.9)';
    ctx.lineWidth = 3;
    for (let [key, value] of Object.entries(transferBytesPerNode)) {
        let commSize = ((value[2] / totalTransfer)).toPrecision(2) / maxTransmission;
        x = value[0];
        y = value[1];
        ctx.beginPath();
        ctx.arc(x, y, 3 + (15 * commSize), 0, 2 * Math.PI);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255, 0.9)';
    ctx.lineWidth = 3;
    for (let [key, value] of Object.entries(receiveBytesPerNode)) {
        let commSize = ((value[2] / totalReceive)).toPrecision(2) / maxReception;
        x = value[0];
        y = value[1];
        ctx.beginPath();
        ctx.arc(x, y, 3 + (15 * commSize), 0, 2 * Math.PI);
        ctx.stroke();
    }
    }
}

function toggleRender () {
    this._render = !this._render;
}

/**
 * @class CommunicationLayer
 * @extends {L.CanvasLayer}
 * 
 * @param {Object} options
 * 
 * @var {Object}  _context - The Window’s workspace.
 * @var {Object}  _cache   - Caches the data for different device types from the context.
 * @var {Boolean} _render  - Determines whether the CommunicationLayer will be displayed.
 * 
 * @returns {CommunicationLayer}
 */
L.CommunicationLayer = L.CanvasLayer.extend({
    options: {
        render: renderCommunication,
        toggle: toggleRender
    },

    /**
     * Sets the CommunicationLayer’s starting variables.
     * 
     * @constructs CommunicationLayer
     * @param {Object} options
     * @returns 
     */
    initialize(options) {
        this._context = null;
        this._cache = new WeakMap();
        this._render = true;
        L.CanvasLayer.prototype.initialize.call(this, options);
    },

    /**
     * Updates the values for the devices and then re-renders the CommunicationLayer.
     * 
     * @memberof CommunicationLayer
     * @param {Object} context 
     * @returns
     */
    update(context) {
        this._context = context;
        this.redraw();
    },

    onAdd(map) {
        L.CanvasLayer.prototype.onAdd.call(this, map);
        this.getPane().classList.add("communication-pane");
    },

    toggleRender() {
        this._render = !this._render;
    }
});

L.communicationLayer = function(options) {
    return new L.CommunicationLayer(options);
};

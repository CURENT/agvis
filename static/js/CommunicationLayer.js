function renderTopology(canvas, { size, bounds, project, needsUpdate }) {
	console.log('render');
	const context = this._context;
	if (!context) return;
	const SysParam = context.SysParam;
	if (!SysParam) return;
	const Bus = SysParam.Bus;
	const Line = SysParam.Line;

	console.log('render', { needsUpdate });

	let busCache = this._cache.get(Bus);
	let { busPixelCoords, busLookup } = busCache ? busCache : {};
	if (!busCache || needsUpdate) {
		busCache = {};
		this._cache.set(Bus, busCache);

		busPixelCoords = busCache.busPixelCoords =
			new NDArray([Bus.shape[0], 2]);
	
		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = Bus.get(i, 6);
			const lng = Bus.get(i, 7);
			const point = project(L.latLng(lat, lng));
			busPixelCoords.set(point.x, i, 0);
			busPixelCoords.set(point.y, i, 1);
		}

		busLookup = busCache.busLookup =
			new Map();
		for (let i=0; i<Bus.shape[0]; ++i) {
			const num = Bus.get(i, 0);
			busLookup.set(num, i);
		}
	}

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, size.x, size.y);

	ctx.fillStyle = 'black';
	for (let i=0; i<Bus.shape[0]; ++i) {
		const x = busPixelCoords.get(i, 0);
		const y = busPixelCoords.get(i, 1);
		ctx.beginPath();
		ctx.arc(x, y, 10.0, 0, 2 * Math.PI);
		ctx.fill();
	}

	ctx.lineWidth = 5;
	ctx.beginPath();
	for (let i=0; i<Line.shape[0]; ++i){
		const nodeFrom = Line.get(i, 0);
		const nodeFromX = busPixelCoords.get(busLookup.get(nodeFrom), 0);
		const nodeFromY = busPixelCoords.get(busLookup.get(nodeFrom), 1);

		const nodeTo = Line.get(i, 1);
		const nodeToX = busPixelCoords.get(busLookup.get(nodeTo), 0);
		const nodeToY = busPixelCoords.get(busLookup.get(nodeTo), 1);

		ctx.moveTo(nodeFromX, nodeFromY);
		ctx.lineTo(nodeToX, nodeToY);
	}
	ctx.closePath();
	ctx.stroke();
}

L.TopologyLayer = L.CanvasLayer.extend({
	options: {
		render: renderTopology,
	},

	initialize(options) {
		this._context = null;
		this._Bus = new WeakMap();
		this._cache = new WeakMap();
		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	update(context) {
		this._context = context;
		this.redraw();
	},
});

L.topologyLayer = function(options) {
	return new L.TopologyLayer();
};
function renderTopology(canvas, { size, bounds, project, needsUpdate }) {
	console.log('render');
	const context = this._context;
	if (!context) return;
	const SysParam = context.SysParam;
	if (!SysParam) return;
	const Bus = SysParam.Bus;

	console.log('render', { needsUpdate });

	let busArray = this._busArray;
	if (!busArray || needsUpdate) {
		console.log('reset');
		busArray = new Float32Array(2 * Bus.shape[0]);
		this._busArray = busArray;

		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = Bus.get(i, 6);
			const lng = Bus.get(i, 7);
			const point = project(L.latLng(lat, lng));
			busArray[2*i+0] = point.x;
			busArray[2*i+1] = point.y;
		}

	}

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, size.x, size.y);

	const latLng = L.latLng(0, 0);

	ctx.fillStyle = 'black';
	for (let i=0; i<Bus.shape[0]; ++i) {
		const x = busArray[2*i+0];
		const y = busArray[2*i+1];
		/*
		const lat = busArray[2*i+0];
		const lng = busArray[2*i+1];
		latLng.lat = lat;
		latLng.lng = lng;
		const point = project(latLng);
		*/
		ctx.beginPath();
		ctx.arc(x, y, 10.0, 0, 2 * Math.PI);
		ctx.fill();
	}
}

L.TopologyLayer = L.CanvasLayer.extend({
	options: {
		render: renderTopology,
	},

	initialize(options) {
		this._context = null;
		this._Bus = new WeakMap();
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
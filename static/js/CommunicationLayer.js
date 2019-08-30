function renderCommunication(canvas, { size, bounds, project, needsProjectionUpdate }) {
	const context = this._context;
	if (!context) return;
	const LTBNET_params = context.LTBNET_params;
	if (!LTBNET_params) return;
	const { Link } = LTBNET_params;
	const { Pdc } = LTBNET_params;
	const { Pmu } = LTBNET_params;
	const { Switch } = LTBNET_params;

	let paramCache = this._cache.get(LTBNET_params);
	if (!paramCache) {
		paramCache = {};
		this._cache.set(LTBNET_params, paramCache);
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

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, size.x, size.y);

	ctx.fillStyle = 'red';
	for (let i=0; i<Pdc.shape[0]; ++i) {
		const x = pdcPixelCoords.get(i, 0);
		const y = pdcPixelCoords.get(i, 1);
		ctx.beginPath();
		ctx.arc(x, y, 10.0, 0, 2 * Math.PI);
		ctx.fill();
	}

	ctx.fillStyle = 'blue';
	for (let i=0; i<Pmu.shape[0]; ++i) {
		const x = pmuPixelCoords.get(i, 0);
		const y = pmuPixelCoords.get(i, 1);
		ctx.beginPath();
		ctx.arc(x, y, 10.0, 0, 2 * Math.PI);
		ctx.fill();
	}

	ctx.fillStyle = 'green';
	for (let i=0; i<Switch.shape[0]; ++i) {
		const x = switchPixelCoords.get(i, 0);
		const y = switchPixelCoords.get(i, 1);
		ctx.beginPath();
		ctx.arc(x, y, 10.0, 0, 2 * Math.PI);
		ctx.fill();
	}
}

L.CommunicationLayer = L.CanvasLayer.extend({
	options: {
		render: renderCommunication,
	},

	initialize(options) {
		this._context = null;
		this._cache = new WeakMap();
		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	update(context) {
		this._context = context;
		this.redraw();
	},
});

L.communicationLayer = function(options) {
	return new L.CommunicationLayer(options);
};
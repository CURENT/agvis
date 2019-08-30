function renderTopology(canvas, { size, bounds, project, needsProjectionUpdate }) {
	const images = this._images;
	if (!images.allLoaded) return;
	const context = this._context;
	if (!context) return;
	const SysParam = context.SysParam;
	if (!SysParam) return;
	const Bus = SysParam.Bus;
	const Line = SysParam.Line;
	const Syn = SysParam.Syn;
	const Dfig = SysParam.Dfig;

	let paramCache = this._cache.get(SysParam);
	if (!paramCache) {
		paramCache = {};
		this._cache.set(SysParam, paramCache);
	}

	let { busToSynLookup } = paramCache;
	if (!busToSynLookup) {
		busToSynLookup = paramCache.busToSynLookup = new Map();
		if (Syn)
		for (let i=0; i<Syn.shape[0]; ++i) {
			const busNumber = Syn.get(i, 0);
			busToSynLookup.set(busNumber, i);
		}
	}

	let { busToDfigLookup } = paramCache;
	if (!busToDfigLookup) {
		busToDfigLookup = paramCache.busToDfigLookup = new Map();
		if (Dfig)
		for (let i=0; i<Dfig.shape[0]; ++i) {
			const busNumber = Dfig.get(i, 0);
			busToDfigLookup.set(busNumber, i);
		}
	}

	let { busLatLngCoords } = paramCache;
	if (!busLatLngCoords) {
		busLatLngCoords = paramCache.busLatLngCoords =
			new NDArray('C', [Bus.shape[0], 2]);
		
		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = Bus.get(i, 6);
			const lng = Bus.get(i, 7);
			busLatLngCoords.set(lat, i, 0);
			busLatLngCoords.set(lng, i, 1);
		}
	}

	let { busPixelCoords } = paramCache;
	if (!busPixelCoords || needsProjectionUpdate) {
		busPixelCoords = paramCache.busPixelCoords = new NDArray('C', [Bus.shape[0], 2]);
		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = busLatLngCoords.get(i, 0);
			const lng = busLatLngCoords.get(i, 1);
			const point = project(L.latLng(lat, lng));
			busPixelCoords.set(point.x, i, 0);
			busPixelCoords.set(point.y, i, 1);
		}
	}

	let { busToIndexLookup } = paramCache;
	if (!busToIndexLookup) {
		busToIndexLookup = paramCache.busToIndexLookup =
			new Map();
		for (let i=0; i<Bus.shape[0]; ++i) {
			const busNumber = Bus.get(i, 0);
			busToIndexLookup.set(busNumber, i);
		}
	}

	let { busToImageLookup } = paramCache;
	if (!busToImageLookup) {
		busToImageLookup = paramCache.busToImageLookup = new Map();
		
		for (let i=0; i<Bus.shape[0]; ++i) {
			const busNumber = Bus.get(i, 0);
			const syn = busToSynLookup.get(busNumber);
			const dfig = busToDfigLookup.get(busNumber);
			const image =
				syn !== undefined ? images.syn :
				dfig !== undefined ? images.dfig :
				images.bus;
			
			busToImageLookup.set(busNumber, image);
		}

	}

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, size.x, size.y);

	ctx.strokeStyle = 'black';
	ctx.lineWidth = 5;
	ctx.beginPath();
	for (let i=0; i<Line.shape[0]; ++i){
		const fromNumber = Line.get(i, 0);
		const fromIndex = busToIndexLookup.get(fromNumber);
		const fromX = busPixelCoords.get(fromIndex, 0);
		const fromY = busPixelCoords.get(fromIndex, 1);

		const toNumber = Line.get(i, 1);
		const toIndex = busToIndexLookup.get(toNumber);
		const toX = busPixelCoords.get(toIndex, 0);
		const toY = busPixelCoords.get(toIndex, 1);

		ctx.moveTo(fromX, fromY);
		ctx.lineTo(toX, toY);
	}
	ctx.closePath();
	ctx.stroke();

	for (let i=0; i<Bus.shape[0]; ++i) {
		const x = busPixelCoords.get(i, 0);
		const y = busPixelCoords.get(i, 1);
		const busNumber = Bus.get(i, 0);
		const image = busToImageLookup.get(busNumber);
		const size = 10;
		ctx.drawImage(image, x - size/2, y - size/2, size, size);
	}
}

L.TopologyLayer = L.CanvasLayer.extend({
	options: {
		render: renderTopology,
	},

	initialize(options) {
		this._context = null;
		this._cache = new WeakMap();

		const images = {};
		for (let { name, src } of [
			{ name: 'bus', src: '/static/img/bus.svg' },
			{ name: 'syn', src: '/static/img/syn.svg' },
			{ name: 'dfig', src: '/static/img/dfig.svg' },
		]) {
			const image = new Image();
			image.src = src;
			images[name] = image;
		}

		Object.defineProperty(images, 'allLoaded', {
			configurable: false,
			enumerable: false,
			get() {
				for (let image of Object.values(images)) {
					if (!(image.complete && image.naturalHeight !== 0)) {
						return false;
					}
				}
				return true;
			},
		});
		this._images = images;


		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	update(context) {
		this._context = context;
		this.redraw();
	},
});

L.topologyLayer = function(options) {
	return new L.TopologyLayer(options);
};
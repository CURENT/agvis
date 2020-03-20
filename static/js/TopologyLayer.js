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
	const Tg = SysParam.Tg;
	const Exc = SysParam.Exc;
	const Pss = SysParam.Pss;

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

	let { synToTgLookup } = paramCache;
	if (!synToTgLookup) {
		synToTgLookup = paramCache.synToTgLookup = new Map();
		if (Tg)
		for (let i=0; i<Tg.shape[0]; ++i) {
			const synNumber = Tg.get(i, 0);
			synToTgLookup.set(synNumber, i);
		}
	}

	let { synToExcLookup } = paramCache;
	if (!synToExcLookup) {
		synToExcLookup = paramCache.synToExcLookup = new Map();
		if (Exc)
		for (let i=0; i<Exc.shape[0]; ++i) {
			const synNumber = Exc.get(i, 0);
			synToExcLookup.set(synNumber, i);
		}
	}

	let { excToPssLookup } = paramCache;
	if (!excToPssLookup) {
		excToPssLookup = paramCache.excToPssLookup = new Map();
		if (Pss)
		for (let i=0; i<Pss.shape[0]; ++i) {
			const excNumber = Pss.get(i, 0);
			excToPssLookup.set(excNumber, i);
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
			const exc = synToExcLookup.get(syn);
			const tg = synToTgLookup.get(syn);
			const pss = excToPssLookup.get(exc);
			const dfig = busToDfigLookup.get(busNumber);
			const image =
				syn !== undefined && tg !== undefined && exc !== undefined && pss !== undefined ? images.synTEP :
				syn !== undefined && tg !== undefined && exc !== undefined ? images.synTE :
				syn !== undefined && exc !== undefined && pss !== undefined ? images.synEP :
				syn !== undefined && tg !== undefined ? images.synT :
				syn !== undefined && exc !== undefined ? images.synE :
				syn !== undefined ? images.syn :
				dfig !== undefined ? images.dfig :
				images.bus;

			busToImageLookup.set(busNumber, image);
		}
	}

	let { lineVoltageRating } = paramCache;
	if (!lineVoltageRating) {
		lineVoltageRating = paramCache.lineVoltageRating = Line.column(3);
	}

	let { lineVoltageRatingExtents } = paramCache;
	if (!lineVoltageRatingExtents) {
		const min = Math.min(...lineVoltageRating);
		const max = Math.max(...lineVoltageRating);
		console.log({ min, max });
		lineVoltageRatingExtents = paramCache.lineVoltageRatingExtents = { min, max };
	}

	let { zoomToLineVoltageRatingMinLookup } = paramCache;
	if (!zoomToLineVoltageRatingMinLookup) {
		const minZoom = 1;
		const maxZoom = 7;
		const minVoltageRating = lineVoltageRatingExtents.min;
		const maxVoltageRating = lineVoltageRatingExtents.max;
		const voltageRatingStep = (maxVoltageRating - minVoltageRating) / (maxZoom - minZoom + 1);

		zoomToLineVoltageRatingMinLookup = paramCache.zoomToLineVoltageRatingMinLookup = new Map();
		let voltageRatingMin = maxVoltageRating - voltageRatingStep;
		for (let i=minZoom; i<maxZoom+1; ++i) {
			zoomToLineVoltageRatingMinLookup.set(i, voltageRatingMin);
			voltageRatingMin -= voltageRatingStep;
		}
		console.log(zoomToLineVoltageRatingMinLookup);
	}

	const zoomLevel = this._map.getZoom();

	const ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, size.x, size.y);

    if(this._render) {
        if (this._states) {
            for (let feature of this._states.features) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.beginPath();

                let polygons;

                if (feature.geometry.type === "MultiPolygon") {
                    polygons = feature.geometry.coordinates;
                } else if (feature.geometry.type === "Polygon") {
                    polygons = [feature.geometry.coordinates];
                } else {

                }

                for (let polygon of polygons) {
                    for (let path of polygon) {
                        for (let i in path) {
                            const [lon, lat] = path[i];
                            const {x, y} = project(L.latLng(lat, lon));

                            if (i === 0) {
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                    }
                }

                ctx.closePath();
                ctx.fill("evenodd");
            }
        }

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i=0; i<Line.shape[0]; ++i){
            const voltageRating = Line.get(i, 3);
            if (voltageRating <= zoomToLineVoltageRatingMinLookup.get(zoomLevel)) continue;

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

        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Draws the buses (vertices)
        for (let i=0; i<Bus.shape[0]; ++i) {
            const x = busPixelCoords.get(i, 0);
            const y = busPixelCoords.get(i, 1);
            const busNumber = Bus.get(i, 0);
            const image = busToImageLookup.get(busNumber);
            const size = 12;
            ctx.drawImage(image, x - size/2, y - size/2, size, size);

            //const voltageRating = Bus.get(i, 1); Mic

            if (this._render_bus_ids) {
                ctx.fillText(busNumber.toString(), x, y + size/2);
            }
        }
        // TODO: Render zones
    }
}

L.TopologyLayer = L.CanvasLayer.extend({
	options: {
		render: renderTopology,
	},

	initialize(options) {
		this._context = null;
		this._cache = new WeakMap();
        this._render = true;
        this._render_bus_ids = false;

		const images = {};
		for (let { name, src } of [
			{ name: 'bus', src: '/static/img/bus.svg' },
			{ name: 'syn', src: '/static/img/syn.svg' },
			{ name: 'dfig', src: '/static/img/dfig.svg' },
			{ name: 'synT', src: '/static/img/synT.svg' },
			{ name: 'synTE', src: '/static/img/synTE.svg' },
			{ name: 'synTEP', src: '/static/img/synTEP.svg' },
			{ name: 'synEP', src: '/static/img/synEP.svg' },
			{ name: 'synE', src: '/static/img/synE.svg' },
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

        this._states = null;

        (async () => {
            let request = await fetch("/static/js/us_states.json");
            request = await request.json();

            this._states = request;
        })();


		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	update(context) {
		this._context = context;
		this.redraw();
	},
    toggleRender() {
        this._render = !this._render;
        console.log("Topology rendering: ", this._render);
    }
});

L.topologyLayer = function(options) {
	return new L.TopologyLayer(options);
};

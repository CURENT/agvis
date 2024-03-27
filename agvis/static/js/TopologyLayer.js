/* ****************************************************************************************
 * File Name:   TopologyLayer.js
 * Authors:     Nicholas West, Nicholas Parsley
 * Date:        9/28/2023 (last modified)
 * 
 * Description: TopologyLayer.js contains the code the TopologyLayer class. The 
 * 				ToplogyLayer handles displaying the nodes (buses) and lines for a 
 * 				given power system.
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/topology.html
 * ****************************************************************************************/

/**
 * Renders for the TopologyLayer. It establishes many lookup variables for specific node 
 * types, but these go unused for the most part. Lines are drawn between node locations 
 * by the Canvas Context. Nodes are placed after the lines are drawn, and their icons 
 * depend on their associated image in busToImageLookup. Lines and nodes are drawn in order
 * of appearance in the data.
 * 
 * @param {HTML Canvas Element} canvas                - The canvas that the layer will be drawn on.
 * @param {Point}               size                  - Represents the current size of the map in pixels.
 * @param {LatLngBounds}        bounds                - Represents the geographical bounds of the map.
 * @param {Function}            project               - The latLngToContainerPoint function specifically for CanvasLayer._map.
 * @param {Boolean}             needsProjectionUpdate - Determines whether the Layer’s projection needs to be updated.
 * @returns 
 */
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

    const GENROU = SysParam.GENROU;

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

    const nelems = Bus.idx.length;

	let { busLatLngCoords } = paramCache;
	if (!busLatLngCoords) {
		busLatLngCoords = paramCache.busLatLngCoords =
			new NDArray('C', [nelems, 2]);

		for (let i=0; i < nelems; ++i) {
			const lat = Bus.ycoord[i];
			const lng = Bus.xcoord[i];
			busLatLngCoords.set(lat, i, 0);
			busLatLngCoords.set(lng, i, 1);
		}
	}

	let { busPixelCoords } = paramCache;
	if (!busPixelCoords || needsProjectionUpdate) {
		busPixelCoords = paramCache.busPixelCoords = new NDArray('C', [nelems, 2]);
		for (let i=0; i < nelems; ++i) {
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
		for (let i=0; i < nelems; ++i) {
			const busNumber = Bus.idx[i];
			busToIndexLookup.set(busNumber, i);
		}
	}

	let { busToImageLookup } = paramCache;
	if (!busToImageLookup) {
		busToImageLookup = paramCache.busToImageLookup = new Map();

		/*for (let i=0; i < nelems; ++i) {
			const busNumber = Bus.idx[i];
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
		}*/

        for (let i = 0; i < nelems; i++) {
			const busNumber = Bus.idx[i];
			busToImageLookup.set(busNumber, images.bus);
        }

        if (GENROU) {
            for (let i = 0; i < GENROU.bus.length; i++) {
                const busNumber = GENROU.bus[i];
                busToImageLookup.set(busNumber, images.syn);
            }
        }
	}

	let { lineVoltageRating } = paramCache;
	if (!lineVoltageRating) {
		lineVoltageRating = paramCache.lineVoltageRating = Line.Vn1.column(0);
	}

	let { lineVoltageRatingExtents } = paramCache;
	if (!lineVoltageRatingExtents) {
		const min = Math.min(...lineVoltageRating);
		const max = Math.max(...lineVoltageRating);
		//console.log({ min, max });
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
		//console.log(zoomToLineVoltageRatingMinLookup);
	}

	const zoomLevel = this._map.getZoom();

	const ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, size.x, size.y);

    if(this._render) {
        /*
        if (this._states) {
            for (let zone of this._states) {
                ctx.fillStyle = zone.color;

                for (let i = 0; i < zone.coords.shape[0]; i++) {
                    const lat = zone.coords.get(i, 0);
                    const lon = zone.coords.get(i, 1);

                    const {x, y} = project(L.latLng(lat, lon));

                    if (i === 0) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.closePath();
                ctx.fill("evenodd");
            }
        }
        */

        ctx.strokeStyle = `rgba(0, 0, 0, ${this._opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i=0; i < Line.idx.length; ++i){
            //const voltageRating = Line.Vn1.get(0, i);
            //if (voltageRating <= zoomToLineVoltageRatingMinLookup.get(zoomLevel)) continue;

            const fromNumber = Line.bus1[i];
            const fromIndex = busToIndexLookup.get(fromNumber);
            const fromX = busPixelCoords.get(fromIndex, 0);
            const fromY = busPixelCoords.get(fromIndex, 1);

            const toNumber = Line.bus2[i];
            const toIndex = busToIndexLookup.get(toNumber);
            const toX = busPixelCoords.get(toIndex, 0);
            const toY = busPixelCoords.get(toIndex, 1);

            const dist = Math.hypot(toX - fromX, toY - fromY);

            if (dist > 12) {
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(toX, toY);
            }
        }

        ctx.closePath();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Draws the buses (vertices)
        for (let i=0; i < nelems; ++i) {
            const x = busPixelCoords.get(i, 0);
            const y = busPixelCoords.get(i, 1);
            const busNumber = Bus.idx[i];
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

/**
 * @class TopologyLayer
 * @extends {L.CanvasLayer}
 * 
 * @var {Object}  _context         - Another name for the Window's workspace object.
 * @var {WeakMap} _cache           - Caches the information needed to determine which buses are specific types so that those buses can be given special icons. This primarily goes unused.
 * @var {Boolean} _render          - Determines if the TopologyLayer is displayed.
 * @var {Boolean} _render_bus_ids  - Determines if the Bus IDs are rendered along with the buses. This is primarily for debugging purposes.
 * @var {Number}  _opacity         - The opacity setting for the lines drawn between the buses.
 * @var {Object}  _images          - Contains the icons for the various types of nodes.
 * 
 * @returns {TopologyLayer}
 */
L.TopologyLayer = L.CanvasLayer.extend({
	options: {
		render: renderTopology,
	},

	/**
	 * Sets the TopologyLayer’s starting variables.
	 * 
	 * @constructs ToplogyLayer
	 * @param {Object} options - The options Object from Window. Unused beyond being passed to the CanvasLayer's 
	 * 							 initialization function, seemed to be initially used to set certain variables, 
	 * 							 but those values are instead hardcoded into the initialization.
	 * @returns
	 */
	initialize(options) {
		this._context = null;
		this._cache = new WeakMap();
        this._render = true;
        this._render_bus_ids = false;
        this._opacity = 0.25;

		const images = {};
		for (let { name, src } of [
			{ name: 'bus', src: '/img/bus.svg' },
			{ name: 'syn', src: '/img/syn.svg' },
			{ name: 'dfig', src: '/img/dfig.svg' },
			{ name: 'synT', src: '/img/synT.svg' },
			{ name: 'synTE', src: '/img/synTE.svg' },
			{ name: 'synTEP', src: '/img/synTEP.svg' },
			{ name: 'synEP', src: '/img/synEP.svg' },
			{ name: 'synE', src: '/img/synE.svg' },
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

	/**
	 * Updates the values for the nodes and lines and then re-renders the TopologyLayer.
	 * 
	 * @memberof TopologyLayer
	 * @param {Object} context - The workspace from Window.
	 * @returns
	 */
	update(context) {
		this._context = context;
		this.redraw();
	},

	/**
	 * Handles adding the TopologyLayer to the map.
	 * 
	 * @memberof TopologyLayer
	 * @param {Map} map - The map from Window.
	 * @returns
	 */
    onAdd(map) {
        L.CanvasLayer.prototype.onAdd.call(this, map);
        this.getPane().classList.add("topology-pane");
    },

	/**
	 * Switches the state of TopologyLayer._render.
	 * 
	 * @memberof TopologyLayer
	 * @returns
	 */
    toggleRender() {
        this._render = !this._render;
        //console.log("Topology rendering: ", this._render);
    }
});

L.topologyLayer = function(options) {
	return new L.TopologyLayer(options);
};

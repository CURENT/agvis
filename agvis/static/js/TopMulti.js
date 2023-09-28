/* ****************************************************************************************
 * File Name:   TopMulti.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/26/2023 (last modified)
 * 
 * Description: TopMulti.js contains the code for the MultiTopLayer. You’ll notice many 
 * 				similarities between this code and that of the standard TopologyLayer. 
 * 				This is due to the fact that the MultiTopLayer was built off of the 
 * 				TopologyLayer. The major difference between them is that the MultiTopLayer 
 * 				has more customization features and uses newlayer data as opposed to the 
 * 				Window’s workspace.
 *              
 * Devdocs:     https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/topmulti.html
 * ****************************************************************************************/

/**
 * Renders for the MultiTopLayer. It establishes many lookup variables for specific node 
 * types, but these go unused for the most part. Lines are drawn between node locations by 
 * the Canvas Context. Line color, width, and opacity is handled by simply modifying 
 * strokeStyle and linewidth variables of the Canvas Context. Nodes are placed after the 
 * lines are drawn, and their icons depend on their associated image in busToImageLookup.
 * 
 * Node customization is handled by initially placing the nodes at their user-selected 
 * size and then running through the image data to change the RGBA values at node 
 * locations. Node locations are determined by finding pixels of pure white and one 
 * specific shade of pink associated with the SYN type nodes. These pixels are then 
 * recolored. If a user selects a line color that is pure white or that shade of pink, 
 * the color is imperceptibly changed to not exactly match that RGB value. This prevents 
 * lines from being incorrectly recolored. Lines and nodes are drawn in order of appearance 
 * in the data.
 * 
 * @param {HTML Canvas Element} canvas                - The canvas that the layer will be drawn on.
 * @param {Point}               size                  - Represents the current size of the map in pixels.
 * @param {LatLngBounds}        bounds                - Represents the geographical bounds of the map.
 * @param {Function}            project               - The latLngToContainerPoint function specifically for CanvasLayer._map.
 * @param {Boolean}				needsProjectionUpdate - Determines whether the Layer’s projection needs to be updated.
 * @returns 
 */
function renderMultiTop(canvas, { size, bounds, project, needsProjectionUpdate }) {
	const images = this._images;
	if (!images.allLoaded) return;
	const context = this._context;
	if (!context) return;
	const SysParam = this._newlayer.data;
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
		
		if (Bus.type != null) {
			
			for (let i = 0; i < nelems; i++) {
				
				const busNumber = Bus.idx[i];
				const btype = Bus.type[i].toLowerCase();
				
				if (btype.indexOf("well") != -1) {
					busToImageLookup.set(busNumber, images.well);
				}
				
				else if (btype.indexOf("compressor") != -1) {
					busToImageLookup.set(busNumber, images.comp);
				}
				
				else if (btype.indexOf("load") != -1) {
					busToImageLookup.set(busNumber, images.load);
				}
				
				else if (btype.indexOf("ptg") != -1) {
					busToImageLookup.set(busNumber, images.ptg);
				}
				
				else if (btype.indexOf("gfg") != -1) {
					busToImageLookup.set(busNumber, images.gfg);
				}
			}
		}
	}

	let { lineVoltageRating } = paramCache;
	if (!lineVoltageRating) {
		lineVoltageRating = paramCache.lineVoltageRating = Line.Vn1;
	}

	let { lineVoltageRatingExtents } = paramCache;
	if (!lineVoltageRatingExtents && (lineVoltageRating != null)) {
		const min = Math.min(...lineVoltageRating);
		const max = Math.max(...lineVoltageRating);
		//console.log({ min, max });
		lineVoltageRatingExtents = paramCache.lineVoltageRatingExtents = { min, max };
	}

	let { zoomToLineVoltageRatingMinLookup } = paramCache;
	if (!zoomToLineVoltageRatingMinLookup && (lineVoltageRating != null)) {
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

		//{$this._opacity} - change back
		ctx.strokeStyle = `rgba(0, 0, 0, ${this._lop})`;
		
		if (this._cline) {
			ctx.strokeStyle = `rgba(${this._lr}, ${this._lg}, ${this._lb}, ${this._lop})`; 
		}

		//Line Width 2
		ctx.lineWidth = this._lthick;
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
		
		let ncop = Math.trunc(Math.round((this._nop * 255)));
		let lcop = Math.trunc(Math.round((this._lop * 255)));
		//this._nop = Math.trunc((rval1 / 100.0) * 255);

		// Draws the buses (vertices)
		for (let i=0; i < nelems; ++i) {
			const x = busPixelCoords.get(i, 0);
			const y = busPixelCoords.get(i, 1);
			const busNumber = Bus.idx[i];
			const image = busToImageLookup.get(busNumber);
			
			const size = this._nsize;
			ctx.drawImage(image, x - size/2, y - size/2, size, size);

			//const voltageRating = Bus.get(i, 1); Mic

			if (this._render_bus_ids) {
				ctx.fillText(busNumber.toString(), x, y + size/2);
			}
		}
		
		if ((!this._cnode) && (1 != Math.floor(this._nop))) {
			var cimg = ctx.getImageData(0, 0, canvas.width, canvas.height);
			
			for (let j = 0; j < cimg.data.length; j = j + 4) {
				
				if ((cimg.data[j + 3] == 0) || (cimg.data[j + 3] == lcop)) {
					
					continue;
				}

				cimg.data[j + 3] = ncop;
			}

			ctx.putImageData(cimg, 0, 0);
		}
		
		
		if (this._cnode) {
			var cimg = ctx.getImageData(0, 0, canvas.width, canvas.height);
			
			for (let j = 0; j < cimg.data.length; j = j + 4) {
				if (cimg.data[j + 3] == 0) {
					continue;
				}
				
				if ((cimg.data[j] == 0xfa && cimg.data[j + 1] == 0x80 && cimg.data[j + 2] == 0x72) || (cimg.data[j] == 0xff && cimg.data[j + 1] == 0xff && cimg.data[j + 2] == 0xff)) {
						cimg.data[j] = (this._nr & cimg.data[j]);
						cimg.data[j + 1] = (this._ng & cimg.data[j + 1]);
						cimg.data[j + 2] = (this._nb & cimg.data[j + 2]);
						
					}
				
				
				if (1 != Math.floor(this._nop)) {
					if (cimg.data[j + 3] != lcop) {
						cimg.data[j + 3] = ncop;
					}
				}
			}
				
			ctx.putImageData(cimg, 0, 0);
		}

		/*
		//Better but still laggy
		if (this._cnode) {
		
			let cv = document.createElement("canvas");
			cv.width = 12;
			cv.height = 12;
			let c2 = cv.getContext("2d");
			c2.drawImage(image, 0, 0, size, size);
			let cimg = c2.getImageData(0, 0, 12, 12);
			
			for (let j = 0; j < cimg.data.length; j = j + 4) {
				
				cimg.data[j] = (this._nr & cimg.data[j]);
				cimg.data[j + 1] = (this._ng & cimg.data[j + 1]);
				cimg.data[j + 2] = (this._nb & cimg.data[j + 2]);
			
			}
			
			ctx.putImageData(cimg, (x - (size / 2)), (y - (size / 2)));
			
		}
		
		else {
			
			ctx.drawImage(image, x - size/2, y - size/2, size, size);
		}
		*/

		//This will make it so the line and node colors don't interact, but it makes the browser incredibly laggy

		/*
		if (this._cnode) {
			
			var cimg = ctx.getImageData((x - (size / 2)), (y - (size / 2)), (x + (size / 2)), (y + (size / 2)));
			
			for (let j = 0; j < cimg.data.length; j = j + 4) {
				
			cimg.data[j] = (this._nr & cimg.data[j]);
			cimg.data[j + 1] = (this._ng & cimg.data[j + 1]);
			cimg.data[j + 2] = (this._nb & cimg.data[j + 2]);
			
			}
			
			ctx.putImageData(cimg, (x - (size / 2)), (y - (size / 2)));
		}
		*/
		/*
		if (this._cnode) {
			
			var cimg = ctx.getImageData(0, 0, canvas.width, canvas.height);
			
			for (let j = 0; j < cimg.data.length; j = j + 4) {
				
				cimg.data[j] = (this._nr & cimg.data[j]);
				cimg.data[j + 1] = (this._ng & cimg.data[j + 1]);
				cimg.data[j + 2] = (this._nb & cimg.data[j + 2]);
				
			}
			
			ctx.putImageData(cimg, 0, 0);
		}
		*/

		
		// TODO: Render zones
	}
}

/**
 * MultiTopLayer Class
 * 
 * @class MultiTopLayer
 * @extends {L.CanvasLayer}
 * 
 * @param   {Object}  newlayer        - The newlayer data from the backend.
 * @param   {Object}  options         - The options for the layer.
 * 
 * @var	    {Object}  _context        - The context is just another name for the Window’s workspace. For the most part, goes unused.
 * @var     {WeakMap} _cache          - Caches the information needed to determine which buses are specific types so that those buses can be given special icons. This primarily goes unused.
 * @var     {Boolean} _render         - Determines if the MultiTopLayer is displayed.
 * @var     {Boolean} _render_bus_ids - Determines if the Bus IDs are rendered along with the buses. This is primarily for debugging purposes.
 * @var     {Boolean} _cnode          - Whether to use custom node colors or not.
 * @var     {Boolean} _cline          - Whether to use custom line colors or not.
 * @var     {Number}  _nr             - The red value of the custom node color.
 * @var     {Number}  _ng             - The green value of the custom node color.
 * @var     {Number}  _nb             - The blue value of the custom node color.
 * @var     {Number}  _lr             - The red value of the custom line color.
 * @var     {Number}  _lg             - The green value of the custom line color.
 * @var     {Number}  _lb             - The blue value of the custom line color.
 * @var     {Number}  _nop            - The opacity of the nodes.
 * @var     {Number}  _lop            - The opacity of the lines.
 * @var     {Number}  _lthick         - The thickness of the lines.
 * @var     {Number}  _nsize          - The size of the nodes.
 * @var     {Object}  _newlayer       - The newlayer associated with the MultiTopLayer.
 * @var     {Object}  _images         - Contains the icons for the various types of nodes.
 * 
 * @returns {MultiTopLayer}
 */
L.MultiTopLayer = L.CanvasLayer.extend({
	options: {
		render: renderMultiTop,
	},

	/**
	 * Sets MultiTopLayer variables.
	 * 
	 * @constructs MultiTopLayer
	 * @param {Object} newlayer 
	 * @param {Object} options 
	 * @returns
	 */
	initialize(newlayer, options) {
		this._context = null;
		this._cache = new WeakMap();
		this._render = false;
		this._render_bus_ids = false;
		this._cnode = false;
		this._cline = false;
		this._nr = 255;
		this._ng = 255;
		this._nb = 255;
		this._lr = 0;
		this._lg = 0;
		this._lb = 0;
		this._nop = 1;
		this._lop = 0.50;
		this._lthick = 2;
		this._nsize = 12;
		//this._opacity = 0.50;
		this._newlayer = newlayer;

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
			{ name: 'well', src: '/img/well.svg' },
			{ name: 'comp', src: '/img/comp.svg' },
			{ name: 'load', src: '/img/load.svg' },		
			{ name: 'ptg', src: '/img/ptg.svg' },	
			{ name: 'gfg', src: '/img/gfg.svg' }				
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
	 * Updates the values for the nodes and lines and then re-renders the MultiTopLayer.
	 * 
	 * @memberof MultiTopLayer
	 * @param {Object} context 
	 * @returns
	 */
	update(context) {
		this._context = context;
		this.redraw();
	},

	/**
	 * Handles adding the MultiTopLayer to the map.
	 * 
	 * @memberof MultiTopLayer
	 * @param {Map} map - The map from Window
	 * @returns
	 */
	onAdd(map) {
		L.CanvasLayer.prototype.onAdd.call(this, map);
		console.log("Adding multitop");

		this.getPane().classList.add("multitop-pane" + this._newlayer.num);
	},

	/**
	 * Switches the state of MultiTopLayer._render.
	 * 
	 * @memberof MultiTopLayer
	 * @returns
	 */
	toggleRender() {
		this._render = !this._render;
		//console.log("Topology rendering: ", this._render);
	},
	
	/**
	 * Switches the state of MultiTopLayer._cnode.
	 * 
	 * @memberof MultiTopLayer
	 * @returns
	 */
	toggleCNode() {
		this._cnode = !this._cnode;
	},
	
	/**
	 * Switches the state of MultiTopLayer._cline.
	 * 
	 * @memberof MultiTopLayer
	 * @returns
	 */
	toggleCLine() {
		this._cline = !this._cline;
	},
	
	/**
	 * Updates the node color values based on user input.
	 * 
	 * @memberof MultiTopLayer
	 * @param {String} cval1 - The RGB string from the input.
	 * @returns
	 */
	updateCNVal(cval1) {
		this._nr = parseInt(cval1.slice(1, 3), 16);
		this._ng = parseInt(cval1.slice(3, 5), 16);
		this._nb = parseInt(cval1.slice(5, 7), 16);
		
		console.log("Red: " + this._nr);
		console.log("Green: " + this._ng);
		console.log("Blue: " + this._nb);
	},
	
	/**
	 * Updates the line color values based on user input. Also ensures that the line color does not match specific values needed when recoloring nodes.
	 * 
	 * @memberof MultiTopLayer
	 * @param {String} cval2 - The RGB string from the input.
	 * @returns
	 */
	updateCLVal(cval2) {
		this._lr = parseInt(cval2.slice(1, 3), 16);
		this._lg = parseInt(cval2.slice(3, 5), 16);
		this._lb = parseInt(cval2.slice(5, 7), 16);
		
		if (this._lr == 0xfa && this._lg == 0x80 && this._lb == 0x72) {
			
			this._lr = this._lr + 1;
			console.log("pinkish");
		}
		
		if (this._lr == 0xff && this._lg == 0xff &&  this._lb == 0xff) {
			
			this._lb = this._lb - 1;
			console.log("white");
		}
	},
	
	/**
	 * Updates the opacity value for nodes and normalizes it to a 0-1 range.
	 * 
	 * @memberof MultiTopLayer
	 * @param {Number} rval1 - The value from the range input.
	 * @returns
	 */
	updateNOp(rval1) {
		//this._nop = Math.trunc((rval1 / 100.0) * 255);
		this._nop = rval1 / 100.0;
	},
	
	/**
	 * Updates the opacity value for lines and normalizes it to a 0-1 range.
	 * 
	 * @memberof MultiTopLayer
	 * @param {Number} rval2 
	 * @returns
	 */
	updateLOp(rval2) {
		//this._lop = Math.trunc((rval2 / 100.0) * 255);
		let temp = rval2;
		
		if (temp == 100) {
			
			temp = temp - 1;
		}
		
		this._lop = temp / 100.0;
	},
	
	/**
	 * Updates the thickness value for the lines.
	 * 
	 * @memberof MultiTopLayer
	 * @param {Number} rval3 - The value from the range input.
	 * @returns
	 */
	updateLThick(rval3) {
		this._lthick = rval3;
	},
	
	/**
	 * Updates the size value for nodes.
	 * 
	 * @memberof MultiTopLayer
	 * @param {Number} rval4 - The value from the range input.
	 * @returns
	 */
	updateNSize(rval4) {
		this._nsize = rval4;
	},
	
	/**
	 * Changes the newlayer’s current values to be those from another newlayer. Used exclusively for the “Prioritize Layer” button.
	 * 
	 * @memberof MultiTopLayer
	 * @param {Object} oldlayer - The newlayer that the values are being taken from.
	 * @returns
	 */
	stealVals(oldlayer) {
		this._render = oldlayer._render;
		this._render_bus_ids = oldlayer._render_bus_ids;
		this._cnode = oldlayer._cnode;
		this._cline = oldlayer._cline;
		this._nr = oldlayer._nr;
		this._ng = oldlayer._ng;
		this._nb = oldlayer._nb;
		this._lr = oldlayer._lr;
		this._lg = oldlayer._lg;
		this._lb = oldlayer._lb;
		//this._opacity = oldlayer._opacity;
		this._nop = oldlayer._nop;
		this._lop = oldlayer._lop;
		this._lthick = oldlayer._lthick;
		this._nsize = oldlayer._nsize;
	}
});

L.multitopLayer = function(newlayer, options) {
	console.log("New multitop");
	return new L.MultiTopLayer(newlayer, options);
};

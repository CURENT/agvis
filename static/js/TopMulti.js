//topmulti.js is basically just the topology layer but adjusted to work for multiple layers and file input
function renderMultiTop(canvas, { size, bounds, project, needsProjectionUpdate }) {
	const images = this._images;
	if (!images.allLoaded) return;
	const context = this._context;
	if (!context) return;
	const SysParam = this._newlayer;
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
		lineVoltageRating = paramCache.lineVoltageRating = Line.Vn1;
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
		
		if (this._cline) {
			
			ctx.strokeStyle = `rgba(${this._lr}, ${this._lg}, ${this._lb}, ${this._opacity})`; 
		}

		
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

L.MultiTopLayer = L.CanvasLayer.extend({
	options: {
		render: renderMultiTop,
	},

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
		this._opacity = 0.50;
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

	onAdd(map) {
		L.CanvasLayer.prototype.onAdd.call(this, map);
		console.log("Adding multitop");

		this.getPane().classList.add("multitop-pane" + this._newlayer.num);
	},

	toggleRender() {
		this._render = !this._render;
		//console.log("Topology rendering: ", this._render);
	},
	
	toggleCNode() {
		
		this._cnode = !this._cnode;
	},
	
	toggleCLine() {
		
		this._cline = !this._cline;
	},
	
	updateCNVal(cval1) {
		
		this._nr = parseInt(cval1.slice(1, 3), 16);
		this._ng = parseInt(cval1.slice(3, 5), 16);
		this._nb = parseInt(cval1.slice(5, 7), 16);
		
		console.log("Red: " + this._nr);
		console.log("Green: " + this._ng);
		console.log("Blue: " + this._nb);
	},
	
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
	}
});

L.multitopLayer = function(newlayer, options) {
	console.log("New multitop");
	return new L.MultiTopLayer(newlayer, options);
};
